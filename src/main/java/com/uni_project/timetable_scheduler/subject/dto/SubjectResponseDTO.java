package com.uni_project.timetable_scheduler.subject.dto;

public record SubjectResponseDTO(
        Integer id,
        String subjectCode,
        String name,
        String subjectType,
        Boolean isLabSubject,
        String majors,
        Integer totalWeeklyPeriod
) {
}
