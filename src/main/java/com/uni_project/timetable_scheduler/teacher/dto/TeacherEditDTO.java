package com.uni_project.timetable_scheduler.teacher.dto;

import com.uni_project.timetable_scheduler.teacher.Teacher;

import java.util.List;

public record TeacherEditDTO(
        String name,
        Teacher.Gender gender,
        String nrc,
        List<Integer> subjectIds,
        Teacher.TeacherType teacherType,
        String phoneContact,
        String email,
        String address
) {
}