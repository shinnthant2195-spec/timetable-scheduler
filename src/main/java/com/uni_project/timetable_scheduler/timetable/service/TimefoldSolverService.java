package com.uni_project.timetable_scheduler.timetable.service;

import ai.timefold.solver.core.api.solver.SolverManager;
import ai.timefold.solver.core.api.solver.SolverStatus;
import com.uni_project.timetable_scheduler.class_period.ClassPeriod;
import com.uni_project.timetable_scheduler.class_period.ClassPeriodRepository;
import com.uni_project.timetable_scheduler.room.Room;
import com.uni_project.timetable_scheduler.room.RoomRepository;
import com.uni_project.timetable_scheduler.session.Session;
import com.uni_project.timetable_scheduler.session.SessionRepository;
import com.uni_project.timetable_scheduler.subject.Subject;
import com.uni_project.timetable_scheduler.subject.SubjectRepository;
import com.uni_project.timetable_scheduler.teacher.Teacher;
import com.uni_project.timetable_scheduler.teacher.TeacherRepository;
import com.uni_project.timetable_scheduler.timetable.dto.TimetableSlotUpdateRequestDTO;
import com.uni_project.timetable_scheduler.timetable.entities.TeacherAvailability;
import com.uni_project.timetable_scheduler.timetable.entities.TimetableSlot;
import com.uni_project.timetable_scheduler.timetable.repos.TeacherAvailabilityRepository;
import com.uni_project.timetable_scheduler.timetable.repos.TimetableSlotRepository;
import com.uni_project.timetable_scheduler.timetable.solver.TimeSlot;
import com.uni_project.timetable_scheduler.timetable.solver.TimetableSchedule;
import com.uni_project.timetable_scheduler.timetable.solver.fact.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TimefoldSolverService {

    private static final Long TENANT_ID = 1L; // Single-tenant architecture constant

    private final SolverManager<TimetableSchedule> solverManager;
    private final TimetableSlotRepository slotRepo;
    private final SessionRepository sessionRepo;
    private final TeacherRepository teacherRepo;
    private final RoomRepository roomRepo;
    private final ClassPeriodRepository periodRepo;
    private final SubjectRepository subjectRepo;
    private final TeacherAvailabilityRepository availabilityRepo;
    private final TransactionTemplate txTemplate;
    private final TimetableValidationService validationService;

    public TimefoldSolverService(
            SolverManager<TimetableSchedule> solverManager, TimetableSlotRepository slotRepo,
            SessionRepository sessionRepo, TeacherRepository teacherRepo, RoomRepository roomRepo,
            ClassPeriodRepository periodRepo, SubjectRepository subjectRepo,
            TeacherAvailabilityRepository availabilityRepo,
            TransactionTemplate txTemplate,
            TimetableValidationService validationService) {
        this.solverManager = solverManager;
        this.slotRepo = slotRepo;
        this.sessionRepo = sessionRepo;
        this.teacherRepo = teacherRepo;
        this.roomRepo = roomRepo;
        this.periodRepo = periodRepo;
        this.subjectRepo = subjectRepo;
        this.availabilityRepo = availabilityRepo;
        this.txTemplate = txTemplate;
        this.validationService = validationService;
    }

    public SolverStatus getSolverStatus() {
        return solverManager.getSolverStatus(TENANT_ID);
    }

    @Transactional(readOnly = true)
    public void generateGlobalScheduleAsync(List<String> excludedTeacherIds) {
        // 1. Fetch Master Data
        List<Session> sessions = sessionRepo.findAll();
        List<ClassPeriod> allPeriods = periodRepo.findAll();

        LocalTime lunchEndTime = allPeriods.stream()
                .filter(cp -> cp.getType() == ClassPeriod.PeriodType.LUNCH)
                .map(ClassPeriod::getEndTime)
                .findFirst()
                .orElse(LocalTime.of(12, 0));

        List<ClassPeriod> lecturePeriods = allPeriods.stream()
                .filter(cp -> cp.getType() == ClassPeriod.PeriodType.LECTURE)
                .sorted(Comparator.comparing(ClassPeriod::getStartTime))
                .toList();

        List<DayOfWeek> days = Arrays.asList(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY);

        // 2. Flatten Timeslot Grid (With Search Space Pruning)
        List<TimeslotFact> timeslotFacts = new ArrayList<>();
        int pIndex = 1;
        for (ClassPeriod p : lecturePeriods) {
            boolean isMorning = p.getStartTime().isBefore(lunchEndTime);

            for (DayOfWeek d : days) {

                // Search Space Pruning: Exclude Wednesday afternoons for Extra Curricular Activities
                if (d == DayOfWeek.WEDNESDAY && !p.getStartTime().isBefore(lunchEndTime)) {
                    continue;
                }
                timeslotFacts.add(new TimeslotFact(d.name() + "-" + p.getId(), d, p.getId(), pIndex, isMorning));
            }
            pIndex++;
        }

        // 3. Map Rooms
        List<RoomFact> roomFacts = roomRepo.findAll().stream()
                .map(r -> new RoomFact(r.getId(), r.getCapacity(), r.getRoomType()))
                .toList();

        // 4. Filter Teachers
        List<Teacher> allTeachers = teacherRepo.findAll();
        if (excludedTeacherIds != null && !excludedTeacherIds.isEmpty()) {
            allTeachers.removeIf(t -> excludedTeacherIds.contains(t.getId()));
        }
        List<TeacherAvailability> allAvailabilities = availabilityRepo.findAll();
        Map<String, Integer> teacherLoad = new HashMap<>();
        allTeachers.forEach(t -> teacherLoad.put(t.getId(), 0));

        // 5. Build Curriculum Payload (Enterprise Grouping Strategy)
        List<TimeSlot> unassignedSlots = new ArrayList<>();
        long slotIdCounter = 1L;

        // Group Sessions by Subject
        Map<Subject, List<Session>> subjectToSessionsMap = new HashMap<>();
        for (Session session : sessions) {
            for (Subject subject : session.getSubjects()) {
                subjectToSessionsMap.computeIfAbsent(subject, k -> new ArrayList<>()).add(session);
            }
        }

        // Generate unified AI TimeSlots
        for (Map.Entry<Subject, List<Session>> entry : subjectToSessionsMap.entrySet()) {
            Subject subject = entry.getKey();
            List<Session> linkedSessions = entry.getValue();

            List<SessionFact> sessionFacts = linkedSessions.stream()
                    .map(s -> new SessionFact(s.getId(), s.getTotalStudent()))
                    .toList();
            SubjectFact subjectFact = new SubjectFact(subject.getId(), subject.getLabPeriods(), subject.getSubjectType());

            List<Teacher> validTeachers = allTeachers.stream()
                    .filter(t -> t.getTeacherSubjects().stream().anyMatch(ts -> ts.getSubject().getId().equals(subject.getId())))
                    .toList();

            if (validTeachers.isEmpty()) {
                throw new IllegalStateException("No available teacher for subject: " + subject.getName());
            }

            int labQuota = subject.getLabPeriods() != null ? subject.getLabPeriods() : 0;

            for (int i = 0; i < subject.getTotalWeeklyPeriod(); i++) {
                Teacher assignedTeacher = validTeachers.stream()
                        .min(Comparator.comparing(t -> teacherLoad.get(t.getId())))
                        .orElseThrow();
                teacherLoad.put(assignedTeacher.getId(), teacherLoad.get(assignedTeacher.getId()) + 1);

                Set<String> blockedTimeslots = new HashSet<>();
                if (assignedTeacher.getTeacherType() == Teacher.TeacherType.PART_TIME) {
                    Set<String> availableIds = allAvailabilities.stream()
                            .filter(a -> a.getTeacher().getId().equals(assignedTeacher.getId()))
                            .map(a -> a.getDayOfWeek().name() + "-" + a.getClassPeriod().getId())
                            .collect(Collectors.toSet());
                    timeslotFacts.forEach(tf -> {
                        if (!availableIds.contains(tf.id())) blockedTimeslots.add(tf.id());
                    });
                }

                TeacherFact teacherFact = new TeacherFact(assignedTeacher.getId(), assignedTeacher.getTeacherType(), blockedTimeslots);

                TimeSlot aiSlot = new TimeSlot(slotIdCounter++, sessionFacts, subjectFact, teacherFact);

                aiSlot.setRequiresLab(i <  labQuota);

                unassignedSlots.add(aiSlot);
            }
        }

        TimetableSchedule problem = new TimetableSchedule(unassignedSlots, roomFacts, timeslotFacts);

        // 6. Launch Asynchronous Solver Thread
        solverManager.solve(TENANT_ID, problem, solution -> {
            // Explicitly force Spring to open a transaction on this background thread
            txTemplate.executeWithoutResult(status -> saveSolution(solution));
        });
    }

    protected void saveSolution(TimetableSchedule solution) {
        slotRepo.deleteAllDrafts(); // Wipe old drafts before saving new ones

        List<TimetableSlot> dbSlots = new ArrayList<>();

        for (TimeSlot aiSlot : solution.getSlots()) {
            // Unroll the AI group back into normalized database rows
            for (SessionFact sessionFact : aiSlot.getSessions()) {
                TimetableSlot dbSlot = new TimetableSlot();

                dbSlot.setDayOfWeek(aiSlot.getTimeslot().dayOfWeek());
                // getReferenceById prevents N+1 SELECT queries during this mapping phase!
                dbSlot.setClassPeriod(periodRepo.getReferenceById(aiSlot.getTimeslot().classPeriodId()));
                dbSlot.setRoom(roomRepo.getReferenceById(aiSlot.getRoom().id()));
                dbSlot.setSession(sessionRepo.getReferenceById(sessionFact.id()));
                dbSlot.setSubject(subjectRepo.getReferenceById(aiSlot.getSubject().id()));
                dbSlot.setRequiresLab(aiSlot.getRequiresLab());
                dbSlot.setTeacher(teacherRepo.getReferenceById(aiSlot.getTeacher().id()));
                dbSlot.setStatus(TimetableSlot.TimetableStatus.DRAFT);

                dbSlots.add(dbSlot);
            }
        }

        slotRepo.saveAll(dbSlots);
    }

    @Transactional
    public void publishSessionSchedule(Integer sessionId) {
        // 1. Clear out any historically published schedule for this session
        slotRepo.deletePublishedBySessionId(sessionId);

        // 2. Promote current drafts to published status
        int updatedCount = slotRepo.publishDraftsBySessionId(sessionId);

        // 3. Guard clause: Ensure we actually published something
        if (updatedCount == 0) {
            throw new IllegalStateException("No draft schedule found to publish for this session.");
        }
    }

    @Transactional
    public void addManualSlot(TimetableSlotUpdateRequestDTO dto) {
        Teacher teacher = teacherRepo.findById(dto.teacherId()).orElseThrow();
        Session session = sessionRepo.findById(dto.sessionId()).orElseThrow();
        Room room = roomRepo.findById(dto.roomId()).orElseThrow();
        Subject subject = subjectRepo.findById(dto.subjectId()).orElseThrow();
        ClassPeriod period = periodRepo.findById(dto.classPeriodId()).orElseThrow();

        boolean isLabBlock = dto.requiresLab() != null && dto.requiresLab();

        // Pass null so it generates a [-1L] exclusion list
        validationService.validateManualPlacement(teacher, session, room, subject, isLabBlock, dto.dayOfWeek(), period, null);

        TimetableSlot slot = new TimetableSlot();
        slot.setDayOfWeek(dto.dayOfWeek());
        slot.setClassPeriod(period);
        slot.setRoom(room);
        slot.setSession(session);
        slot.setSubject(subject);
        slot.setTeacher(teacher);
        slot.setRequiresLab(isLabBlock);
        slot.setStatus(TimetableSlot.TimetableStatus.DRAFT);

        slotRepo.save(slot);
    }

    @Transactional
    public void updateManualSlot(Long slotId, TimetableSlotUpdateRequestDTO dto) {
        TimetableSlot slot = slotRepo.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Timetable slot not found"));

        Teacher teacher = teacherRepo.findById(dto.teacherId()).orElseThrow();
        Session session = sessionRepo.findById(dto.sessionId()).orElseThrow();
        Room room = roomRepo.findById(dto.roomId()).orElseThrow();
        Subject subject = subjectRepo.findById(dto.subjectId()).orElseThrow();
        ClassPeriod period = periodRepo.findById(dto.classPeriodId()).orElseThrow();

        boolean isLabBlock = dto.requiresLab() != null && dto.requiresLab();

        // Validate while explicitly excluding the current slot from double-booking checks
        validationService.validateManualPlacement(teacher, session, room, subject, isLabBlock, dto.dayOfWeek(), period, List.of(slotId));

        slot.setDayOfWeek(dto.dayOfWeek());
        slot.setClassPeriod(period);
        slot.setRoom(room);
        slot.setSession(session);
        slot.setSubject(subject);
        slot.setTeacher(teacher);
        slot.setRequiresLab(isLabBlock);

        slotRepo.save(slot);
    }

    @Transactional
    public void swapSlots(Long slotId1, Long slotId2) {
        TimetableSlot slot1 = slotRepo.findById(slotId1).orElseThrow();
        TimetableSlot slot2 = slotRepo.findById(slotId2).orElseThrow();

        DayOfWeek day1 = slot1.getDayOfWeek();
        ClassPeriod period1 = slot1.getClassPeriod();
        Room room1 = slot1.getRoom();

        DayOfWeek day2 = slot2.getDayOfWeek();
        ClassPeriod period2 = slot2.getClassPeriod();
        Room room2 = slot2.getRoom();

        // By excluding BOTH IDs, we mathematically simulate pulling them entirely off
        // the board before attempting to place them in each other's spaces.
        List<Long> swappingIds = List.of(slotId1, slotId2);

        validationService.validateManualPlacement(slot1.getTeacher(), slot1.getSession(), room1, slot1.getSubject(), slot1.getRequiresLab(), day2, period2, swappingIds);
        validationService.validateManualPlacement(slot2.getTeacher(), slot2.getSession(), room2, slot2.getSubject(), slot2.getRequiresLab(), day1, period1, swappingIds);

        slot1.setDayOfWeek(day2);
        slot1.setClassPeriod(period2);

        slot2.setDayOfWeek(day1);
        slot2.setClassPeriod(period1);

        slotRepo.saveAll(List.of(slot1, slot2));
    }

    @Transactional
    public void deleteManualSlot(Long slotId) {
        slotRepo.deleteById(slotId);
    }

    @Transactional
    public void wipeAllDrafts() {
        slotRepo.deleteAllDrafts();
    }

    @Transactional
    public void wipeAllPublished() {
        slotRepo.deleteAllPublished();
    }

    @Transactional
    public void wipePublishedBySession(Integer sessionId) {
        slotRepo.deletePublishedBySessionId(sessionId);
    }

}