package com.uni_project.timetable_scheduler.timetable.solver.fact;

import java.time.DayOfWeek;

public record TimeslotFact(
        String id, // e.g., "MONDAY-1" (Combines Day and Period ID)
        DayOfWeek dayOfWeek,
        Long classPeriodId,
        int periodIndex
) {
}
