package com.uni_project.timetable_scheduler.timetable.solver.fact;

import com.uni_project.timetable_scheduler.subject.Subject;

public record SubjectFact(
        Integer id,
        Boolean isLabSubject,
        Subject.SubjectType subjectType
) {
}
