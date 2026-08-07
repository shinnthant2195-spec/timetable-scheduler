package com.uni_project.timetable_scheduler.timetable.dto;
import java.time.DayOfWeek;

public record TimetableSlotUpdateRequestDTO(
        DayOfWeek dayOfWeek,
        Long classPeriodId,
        Integer roomId,
        Integer sessionId,
        Integer subjectId,
        String teacherId
) {}