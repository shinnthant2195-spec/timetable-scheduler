package com.uni_project.timetable_scheduler.session.dto;

public record SessionCreationDTO(
        String name,
        String majorId,
        Integer totalStudent
) {
}
