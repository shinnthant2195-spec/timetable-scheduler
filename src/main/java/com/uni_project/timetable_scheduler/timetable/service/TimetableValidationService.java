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

@Service
public class TimetableValidationService {

    private final TimetableSlotRepository slotRepo;
    private final TeacherAvailabilityRepository availabilityRepo;

    public TimetableValidationService(TimetableSlotRepository slotRepo, TeacherAvailabilityRepository availabilityRepo) {
        this.slotRepo = slotRepo;
        this.availabilityRepo = availabilityRepo;
    }

    public void validateManualPlacement(Teacher teacher, Session session, Room room, Subject subject, DayOfWeek day, ClassPeriod period) {

        // Check is the session's total students exceed the room capacity.
        if (session.getTotalStudent() > room.getCapacity()) {
            throw new IllegalArgumentException("Room capacity is too small for this session.");
        }

        // Check if the newly assigned is lab when the subject is lab subject.
        if (Boolean.TRUE.equals(subject.getLabSubject()) && room.getRoomType() != Room.RoomType.LAB) {
            throw new IllegalArgumentException("Lab subjects must be in a LAB room.");
        }

        // Check if the part-time teacher is available at the new day/period block.
        if (teacher.getTeacherType() == Teacher.TeacherType.PART_TIME) {
            boolean isAvailable = availabilityRepo.getTeacherAvailabilityByTeacherId(teacher.getId()).stream()
                    .anyMatch(ta -> ta.getDayOfWeek() == day && ta.getClassPeriod().getId().equals(period.getId()));
            if (!isAvailable) {
                throw new  IllegalArgumentException("Teacher is not available for this session.");
            }
        }

        // Check if the teacher is already teaching at other day/period block.
        if (slotRepo.existsByTeacherIdAndDayOfWeekAndClassPeriodId(teacher.getId(), day, period.getId())) {
            throw new IllegalArgumentException("Teacher is double-booked.");
        }


        if (slotRepo.existsBySessionIdAndDayOfWeekAndClassPeriodId(session.getId(), day, period.getId())) {
            throw new IllegalArgumentException("Session is double-booked.");
        }

        if (slotRepo.existsByRoomIdAndDayOfWeekAndClassPeriodId(room.getId(), day, period.getId())) {
            throw new IllegalArgumentException("Room is double-booked.");
        }
    }
}
