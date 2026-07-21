package com.uni_project.timetable_scheduler.timetable.dto;

import java.time.DayOfWeek;

public record AvailabilityDTO(
        DayOfWeek dayOfWeek,
        Long classPeriodId
) {
}
