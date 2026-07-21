package com.uni_project.timetable_scheduler.teacher;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class TeacherSpecification {
    public static Specification<Teacher> filterTeacher(
            Integer subjectId, Integer majorId, Teacher.Gender gender, Teacher.TeacherType teacherType
    ){
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (subjectId != null) {
                predicates.add(cb.equal(root.join("teacherSubjects").join("subject").get("id"), subjectId));
            }

            if (majorId != null) {
                predicates.add(root.join("teacherSubjects")
                        .join("subject")
                        .join("majors")
                        .get("id")
                        .in(majorId));
            }

            if (gender != null) {
                predicates.add(cb.equal(root.get("gender"), gender));
            }

            if (teacherType != null) {
                predicates.add(cb.equal(root.get("teacherType"), teacherType.name()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
