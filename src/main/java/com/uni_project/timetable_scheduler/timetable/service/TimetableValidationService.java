package com.uni_project.timetable_scheduler.timetable.service;

import com.uni_project.timetable_scheduler.class_period.ClassPeriod;
import com.uni_project.timetable_scheduler.room.Room;
import com.uni_project.timetable_scheduler.session.Session;
import com.uni_project.timetable_scheduler.subject.Subject;
import com.uni_project.timetable_scheduler.teacher.Teacher;
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

        // 2. Applied the new NotIn queries
        if (slotRepo.existsByTeacherIdAndDayOfWeekAndClassPeriodIdAndIdNotIn(teacher.getId(), day, period.getId(), excludes)) {
            throw new IllegalArgumentException("Teacher is double-booked.");
        }
        if (slotRepo.existsBySessionIdAndDayOfWeekAndClassPeriodIdAndIdNotIn(session.getId(), day, period.getId(), excludes)) {
            throw new IllegalArgumentException("Session cohort is double-booked.");
        }
        if (slotRepo.existsByRoomIdAndDayOfWeekAndClassPeriodIdAndIdNotIn(room.getId(), day, period.getId(), excludes)) {
            throw new IllegalArgumentException("Room is double-booked.");
        }
    }
}