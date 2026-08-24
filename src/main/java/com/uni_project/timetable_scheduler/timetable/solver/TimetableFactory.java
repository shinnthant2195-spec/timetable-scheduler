package com.uni_project.timetable_scheduler.timetable.solver;

import com.uni_project.timetable_scheduler.class_period.ClassPeriod;
import com.uni_project.timetable_scheduler.class_period.ClassPeriodRepository;
import com.uni_project.timetable_scheduler.room.RoomRepository;
import com.uni_project.timetable_scheduler.session.Session;
import com.uni_project.timetable_scheduler.session.SessionRepository;
import com.uni_project.timetable_scheduler.subject.Subject;
import com.uni_project.timetable_scheduler.teacher.Teacher;
import com.uni_project.timetable_scheduler.teacher.TeacherRepository;
import com.uni_project.timetable_scheduler.timetable.entities.TeacherAvailability;
import com.uni_project.timetable_scheduler.timetable.repos.TeacherAvailabilityRepository;
import com.uni_project.timetable_scheduler.timetable.solver.fact.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TimetableFactory {

    private final SessionRepository sessionRepo;
    private final ClassPeriodRepository periodRepo;
    private final TeacherRepository teacherRepo;
    private final RoomRepository roomRepo;
    private final TeacherAvailabilityRepository availabilityRepo;

    public TimetableFactory(SessionRepository sessionRepo, ClassPeriodRepository periodRepo, TeacherRepository teacherRepo, RoomRepository roomRepo, TeacherAvailabilityRepository availabilityRepo) {
        this.sessionRepo = sessionRepo;
        this.periodRepo = periodRepo;
        this.teacherRepo = teacherRepo;
        this.roomRepo = roomRepo;
        this.availabilityRepo = availabilityRepo;
    }

    private List<TimeslotFact> createTimeslotFacts(LocalTime lunchEndTime, List<ClassPeriod> periods, List<DayOfWeek> days) {
        List<TimeslotFact> timeslotFacts = new ArrayList<>();
        int index = 1;
        for (ClassPeriod period : periods) {
            for (DayOfWeek day : days) {

                // Search Space Pruning to skip WEDNESDAY Afternoon for Extra Curricular
                if (day == DayOfWeek.WEDNESDAY && period.getStartTime().isBefore(lunchEndTime)) {
                    continue;
                }
                timeslotFacts.add(new TimeslotFact(
                        day.name() + "-" + period.getId(),
                        day,
                        period.getId(),
                        index,
                        period.getStartTime().isBefore(lunchEndTime)
                ));
                index++;
            }
        }
        return  timeslotFacts;
    }

    @Transactional(readOnly = true)
    public TimetableSchedule populateTimeslots(List<String> excludedTeacherIds) {

        List<Session> sessions = sessionRepo.findAll(); // Pass
        List<ClassPeriod> periods = periodRepo.findAll(); // Pass

        // Forget to Filter LECTURE periods
        List<DayOfWeek> days = List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY);

        // Find Lunch End Time for Search Space Pruning (leaving WED Evening)
        LocalTime lunchEndTime = periods.stream()
                .filter(p -> p.getType() == ClassPeriod.PeriodType.LUNCH)
                .map(ClassPeriod::getEndTime)
                .findFirst()
                .orElse(LocalTime.of(12, 0));

        // Getting All Search-Space-Pruned SlotFacts
        List<TimeslotFact> timeslotFacts = createTimeslotFacts(lunchEndTime, periods, days);

        // Get RoomFacts
        List<RoomFact> roomFacts = roomRepo.findAll().stream()
                .map(r -> new RoomFact(r.getId(), r.getCapacity(), r.getRoomType()))
                .toList();

        // Fetch All Teachers
        List<Teacher> allTeachers = teacherRepo.findAll();

        // Filter Teacher from excluded list (which are got from Timetable Scheduling's excluded Teacher Select Box)\
        if (excludedTeacherIds != null && !excludedTeacherIds.isEmpty()) {
            allTeachers.removeIf(t -> excludedTeacherIds.contains(t.getId()));
        }
        Map<String, Integer> teacherWorkload = new HashMap<>();
        allTeachers.forEach(t -> teacherWorkload.put(t.getId(), 0));

        // Fetch Teacher Availability
        List<TeacherAvailability> allAvailabilities =  availabilityRepo.findAll();

        // Mapping Subject(key) and Session(values)
        Map<Subject, List<Session>> subjectSessionMap = new HashMap<>();
        for (Session session : sessions) {
            for (Subject subject : session.getSubjects()) {
                subjectSessionMap.computeIfAbsent(subject, s -> new ArrayList<>()).add(session);
            }
        }

        // List of TimeSlot to give TimetableSchedule as a PlanningEntityCollectionProperty
        List<TimeSlot> unassignedSlots = new ArrayList<>();

        // ID for each TimeSlot
        long slotIdCounter = 1L;

        // Add one TimeSlot at a time
        for (Map.Entry<Subject, List<Session>> entry : subjectSessionMap.entrySet()) {
            Subject subject = entry.getKey();

            // Create a list of SessionFact to give TimeSlot as a parameter
            List<SessionFact> sessionFacts = entry.getValue().stream()
                    .map(s -> new SessionFact(s.getId(), s.getTotalStudent()))
                    .toList();

            // Create a SubjectFact to give TimeSlot as a parameter
            SubjectFact subjectFact = new SubjectFact(subject.getId(), subject.getLabPeriods(), subject.getSubjectType());

            // Find all the teachers being able to teach the current subject.
            List<Teacher> validTeachers = allTeachers.stream()
                    .filter(t -> t.getTeacherSubjects().stream()
                            .anyMatch(ts -> ts.getSubject().getId().equals(subject.getId())))
                    .toList();

            if (validTeachers.isEmpty()) {
                throw new IllegalStateException("No available teacher for subject: " + subject.getName());
            }

            // Count for lab room requirement
            int count = subject.getLabPeriods() != null ? subject.getLabPeriods() : 0;

            // Loop for each weekly period of the subject
            for (int i = 0; i < subject.getTotalWeeklyPeriod(); i++) {

                // Get the valid teacher of the least amount of workload.
                Teacher assignedTeacher = validTeachers.stream()
                                .min(Comparator.comparing(t -> teacherWorkload.get(t.getId())))
                        .orElseThrow();
                teacherWorkload.put(assignedTeacher.getId(), teacherWorkload.get(assignedTeacher.getId()) + 1);

                // BlockTimeslots to give TeacherFact as a parameter
                Set<String> blockedTimeslots = new HashSet<>();

                if (assignedTeacher.getTeacherType() == Teacher.TeacherType.PART_TIME) {

                    // Get available slots ids of the teacher
                    Set<String> availableTimeSlotIds = allAvailabilities.stream()
                            .filter(a -> a.getTeacher().getId().equals(assignedTeacher.getId()))
                            .map(a -> a.getDayOfWeek().name() + "-" + a.getClassPeriod().getId())
                            .collect(Collectors.toSet());

                    // Find the unavailable slots ids and add into blockedTimeSlots
                    timeslotFacts.forEach(tf -> {
                        if (!availableTimeSlotIds.contains(tf.id())) blockedTimeslots.add(tf.id());
                    });
                }

                TeacherFact teacherFact = new TeacherFact(assignedTeacher.getId(), assignedTeacher.getTeacherType(), blockedTimeslots);

                TimeSlot aiSlot = new TimeSlot(slotIdCounter++, sessionFacts, subjectFact, teacherFact);
                aiSlot.setRequiresLab(i < count);
                unassignedSlots.add(aiSlot);
            }
        }
        return new TimetableSchedule(unassignedSlots, roomFacts, timeslotFacts);
    }
}
