package com.uni_project.timetable_scheduler.session.dto;

import com.uni_project.timetable_scheduler.subject.dto.SubjectLabelDTO;

import java.util.List;

public record SessionResponseDTO(
        Integer id,
        String name,
        String majorId,
        String majorName,
        Integer totalStudent,
        List<SubjectLabelDTO> subjects
){
}
