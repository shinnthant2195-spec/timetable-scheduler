package com.uni_project.timetable_scheduler.timetable.dto;

import com.uni_project.timetable_scheduler.timetable.entities.TimetableSlot;

import java.time.DayOfWeek;

public record TimetableSlotResponseDTO(
        Long id,
        DayOfWeek dayOfWeek,
        Long classPeriodId,
        Integer subjectId,
        String subjectCode,
        String subjectName,
        String teacherId,
        String teacherName,
        Integer roomId,
        String roomName,
        TimetableSlot.TimetableStatus status
) {
}
