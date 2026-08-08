package com.uni_project.timetable_scheduler.timetable.service;

import com.uni_project.timetable_scheduler.class_period.ClassPeriod;
import com.uni_project.timetable_scheduler.room.Room;
import com.uni_project.timetable_scheduler.session.Session;
import com.uni_project.timetable_scheduler.subject.Subject;
import com.uni_project.timetable_scheduler.teacher.Teacher;
import com.uni_project.timetable_scheduler.timetable.entities.TimetableSlot;
import com.uni_project.timetable_scheduler.timetable.repos.TeacherAvailabilityRepository;
import com.uni_project.timetable_scheduler.timetable.repos.TimetableSlotRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.Collection;
import java.util.List;

@Service
public class TimetableValidationService {

    private final TimetableSlotRepository slotRepo;
    private final TeacherAvailabilityRepository availabilityRepo;

    public TimetableValidationService(TimetableSlotRepository slotRepo, TeacherAvailabilityRepository availabilityRepo) {
        this.slotRepo = slotRepo;
        this.availabilityRepo = availabilityRepo;
    }

    // 1. Added excludeSlotIds parameter
    public void validateManualPlacement(Teacher teacher, Session session, Room room, Subject subject, DayOfWeek day, ClassPeriod period, Collection<Long> excludeSlotIds) {

        // Safety fallback for empty NOT IN clauses
        Collection<Long> excludes = (excludeSlotIds == null || excludeSlotIds.isEmpty()) ? List.of(-1L) : excludeSlotIds;

        if (session.getTotalStudent() > room.getCapacity()) {
            throw new IllegalArgumentException("Room capacity is too small for this session.");
        }

        // if dynamic weight for lab assigned is implemented, this need to be fixed
        if (Boolean.TRUE.equals(subject.getLabSubject()) && room.getRoomType() != Room.RoomType.LAB) {
            throw new IllegalArgumentException("Lab subjects must be in a LAB room.");
        }

        if (teacher.getTeacherType() == Teacher.TeacherType.PART_TIME) {
            boolean isAvailable = availabilityRepo.getTeacherAvailabilityByTeacherId(teacher.getId()).stream()
                    .anyMatch(ta -> ta.getDayOfWeek() == day && ta.getClassPeriod().getId().equals(period.getId()));
            if (!isAvailable) {
                throw new IllegalArgumentException("Teacher is not available for this session block.");
            }
        }

        List<TimetableSlot> potentialSlots = slotRepo.findPotentialConflicts(
                teacher.getId(), session.getId(), room.getId(), day, period.getId(), excludes
        );

        int aggregatedStudentCount = session.getTotalStudent();

        for (TimetableSlot existing :  potentialSlots) {

            // 1. Session Conflict Check
            if (existing.getSession().getId().equals(session.getId())) {
                boolean bothAreElectives = existing.getSubject().getSubjectType() == Subject.SubjectType.ELECTIVE &&
                       subject.getSubjectType() == Subject.SubjectType.ELECTIVE;

                if (!bothAreElectives) {
                    throw new IllegalArgumentException("Session '" + session.getName() + "' is double-booked (Only concurrent electives are allowed).");
                }
            }

            // 2. Teacher Conflict Check
            if (existing.getTeacher().getId().equals(teacher.getId())) {
                boolean isSharedClass = existing.getSubject().getId().equals(subject.getId()) &&
                        existing.getRoom().getId().equals(room.getId());

                if (!isSharedClass) {
                    throw new IllegalArgumentException("Teacher '" + teacher.getName() + "' is double-booked with a different class or room.");
                }
            }

            // 3. Room Conflict Check
            if (existing.getRoom().getId().equals(room.getId())) {
                boolean isSharedClass = existing.getSubject().getId().equals(subject.getId()) &&
                        existing.getTeacher().getId().equals(teacher.getId());

                if (!isSharedClass) {
                    throw new IllegalArgumentException("Room '" + room.getName() + "' is double-booked by another class.");
                } else {
                    aggregatedStudentCount += existing.getSession().getTotalStudent();
                }
            }

            if (aggregatedStudentCount > room.getCapacity() && subject.getSubjectType() != Subject.SubjectType.ELECTIVE) {
                throw new IllegalArgumentException("Combined session sizes (" + aggregatedStudentCount + ") exceed Room '" + room.getName() + "' capacity (" + room.getCapacity() + ").");
            }
        }
    }

        /*
        for (TimetableSlot existing : potentialConflicts) {

            // 3. Room Conflict Check
            if (existing.getRoom().getId().equals(room.getId())) {
                boolean isSharedClass = existing.getSubject().getId().equals(subject.getId()) &&
                                        existing.getTeacher().getId().equals(teacher.getId());
                if (!isSharedClass) {
                    throw new IllegalArgumentException("Room '" + room.getName() + "' is double-booked by another class.");
                } else {
                    // It is a valid shared class! Add this existing session's students to our aggregate count
                    aggregatedStudentCount += existing.getSession().getTotalStudent();
                }
            }
        }

        // 4. Aggregated Room Capacity Check
        if (aggregatedStudentCount > room.getCapacity()) {
            throw new IllegalArgumentException("Combined session sizes (" + aggregatedStudentCount + ") exceed Room '" + room.getName() + "' capacity (" + room.getCapacity() + ").");
        }
         */
}