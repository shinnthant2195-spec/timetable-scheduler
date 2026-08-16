package com.uni_project.timetable_scheduler.subject.dto;

public record SubjectLabelDTO(
        Integer id,
        String name,
        String subjectCode,
        Integer labPeriods
) {
}
