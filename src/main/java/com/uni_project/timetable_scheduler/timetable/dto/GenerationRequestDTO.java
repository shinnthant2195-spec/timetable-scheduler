package com.uni_project.timetable_scheduler.timetable.dto;

import java.util.List;

public record GenerationRequestDTO(
        List<String> excludedTeacherIds // Array of IDs from your React dropdown
) {}