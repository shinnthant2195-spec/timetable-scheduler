package com.uni_project.timetable_scheduler.timetable.solver.fact;

import com.uni_project.timetable_scheduler.teacher.Teacher;

import java.util.Set;

public record TeacherFact(
        String id,
        Teacher.TeacherType teacherType,
        Set<String> unavailableTimeslotIds // e.g., "MONDAY-1", "TUESDAY-3"
) {
}
