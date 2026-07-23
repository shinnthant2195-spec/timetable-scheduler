package com.uni_project.timetable_scheduler.session.dto;

import java.util.List;

public record SessionCreationDTO(
        String name,
        String majorId,
        Integer totalStudent,
        List<Integer> subjectIds
) {
}
