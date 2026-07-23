package com.uni_project.timetable_scheduler.teacher.dto;

import com.uni_project.timetable_scheduler.teacher.Teacher;

import java.util.List;

public record TeacherCreationDTO(
        String id,
        String name,
        String profileUrl,
        Teacher.Gender gender,
        String nrc,
        List<Integer> subjectIds,
        Teacher.TeacherType teacherType,
        String phoneContact,
        String email,
        String address,
        Integer department
) {
}
