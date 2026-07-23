package com.uni_project.timetable_scheduler.subject.dto;

import com.uni_project.timetable_scheduler.subject.Subject;

import java.util.List;

public record SubjectRequestDTO(
        String subjectCode,
        String name,
        Integer totalWeeklyPeriod,
        Subject.SubjectType subjectType,
        Boolean isLabSubject
) {
}
