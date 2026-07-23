package com.uni_project.timetable_scheduler.timetable.service;

import ai.timefold.solver.core.api.solver.SolverManager;
import ai.timefold.solver.core.api.solver.SolverStatus;
import com.uni_project.timetable_scheduler.class_period.ClassPeriod;
import com.uni_project.timetable_scheduler.class_period.ClassPeriodRepository;
import com.uni_project.timetable_scheduler.room.RoomRepository;
import com.uni_project.timetable_scheduler.session.Session;
import com.uni_project.timetable_scheduler.session.SessionRepository;
import com.uni_project.timetable_scheduler.subject.Subject;
import com.uni_project.timetable_scheduler.subject.SubjectRepository;
import com.uni_project.timetable_scheduler.teacher.Teacher;
import com.uni_project.timetable_scheduler.teacher.TeacherRepository;
import com.uni_project.timetable_scheduler.timetable.entities.TeacherAvailability;
import com.uni_project.timetable_scheduler.timetable.entities.TimetableSlot;
import com.uni_project.timetable_scheduler.timetable.repos.TeacherAvailabilityRepository;
import com.uni_project.timetable_scheduler.timetable.repos.TimetableSlotRepository;
import com.uni_project.timetable_scheduler.timetable.solver.TimeSlot;
import com.uni_project.timetable_scheduler.timetable.solver.TimetableSchedule;
import com.uni_project.timetable_scheduler.timetable.solver.fact.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
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

    public TimefoldSolverService(
            SolverManager<TimetableSchedule> solverManager, TimetableSlotRepository slotRepo,
            SessionRepository sessionRepo, TeacherRepository teacherRepo, RoomRepository roomRepo,
            ClassPeriodRepository periodRepo, SubjectRepository subjectRepo,
            TeacherAvailabilityRepository availabilityRepo) {
        this.solverManager = solverManager;
        this.slotRepo = slotRepo;
        this.sessionRepo = sessionRepo;
        this.teacherRepo = teacherRepo;
        this.roomRepo = roomRepo;
        this.periodRepo = periodRepo;
        this.subjectRepo = subjectRepo;
        this.availabilityRepo = availabilityRepo;
    }

    public SolverStatus getSolverStatus() {
        return solverManager.getSolverStatus(TENANT_ID);
    }

    @Transactional(readOnly = true)
    public void generateGlobalScheduleAsync(List<String> excludedTeacherIds) {
        // 1. Fetch Master Data
        List<Session> sessions = sessionRepo.findAll();
        List<ClassPeriod> periods = periodRepo.findAll().stream()
                .filter(p -> p.getType() == ClassPeriod.PeriodType.LECTURE)
                .sorted(Comparator.comparing(ClassPeriod::getStartTime))
                .toList();
        List<DayOfWeek> days = Arrays.asList(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY);

        // 2. Flatten Timeslot Grid
        List<TimeslotFact> timeslotFacts = new ArrayList<>();
        int pIndex = 1;
        for (ClassPeriod p : periods) {
            for (DayOfWeek d : days) {
                timeslotFacts.add(new TimeslotFact(d.name() + "-" + p.getId(), d, p.getId(), pIndex));
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

        // 5. Build Curriculum Payload
        List<TimeSlot> unassignedSlots = new ArrayList<>();
        long slotIdCounter = 1L;

        for (Session session : sessions) {
            SessionFact sessionFact = new SessionFact(session.getId(), session.getTotalStudent());

            Set<Subject> requiredSubjects = session.getSubjects();

            for (Subject subject : requiredSubjects) {
                SubjectFact subjectFact = new SubjectFact(subject.getId(), subject.getLabSubject());
                List<Teacher> validTeachers = allTeachers.stream()
                        .filter(t -> t.getTeacherSubjects().stream().anyMatch(ts -> ts.getSubject().getId().equals(subject.getId())))
                        .toList();

                if (validTeachers.isEmpty()) {
                    throw new IllegalStateException("No available teacher for subject: " + subject.getName());
                }

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
                    unassignedSlots.add(new TimeSlot(
                            slotIdCounter++, sessionFact, subjectFact, teacherFact));
                }
            }
        }

        TimetableSchedule problem = new TimetableSchedule(unassignedSlots, roomFacts, timeslotFacts);

        // 6. Launch Asynchronous Solver Thread
        solverManager.solve(TENANT_ID, problem, this::saveSolution);
    }

    @Transactional
    protected void saveSolution(TimetableSchedule solution) {
        slotRepo.deleteAllDrafts(); // Wipe old drafts before saving new ones

        List<TimetableSlot> dbSlots = new ArrayList<>();

        for (TimeSlot aiSlot : solution.getSlots()) {
            TimetableSlot dbSlot = new TimetableSlot();

            dbSlot.setDayOfWeek(aiSlot.getTimeslot().dayOfWeek());
            // getReferenceById prevents N+1 SELECT queries during this mapping phase!
            dbSlot.setClassPeriod(periodRepo.getReferenceById(aiSlot.getTimeslot().classPeriodId()));
            dbSlot.setRoom(roomRepo.getReferenceById(aiSlot.getRoom().id()));
            dbSlot.setSession(sessionRepo.getReferenceById(aiSlot.getSession().id()));
            dbSlot.setSubject(subjectRepo.getReferenceById(aiSlot.getSubject().id()));
            dbSlot.setTeacher(teacherRepo.getReferenceById(aiSlot.getTeacher().id()));
            dbSlot.setStatus(TimetableSlot.TimetableStatus.DRAFT);

            dbSlots.add(dbSlot);
        }

        slotRepo.saveAll(dbSlots);
    }
}