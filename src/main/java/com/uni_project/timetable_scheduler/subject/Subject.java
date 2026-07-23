package com.uni_project.timetable_scheduler.subject;

import com.uni_project.timetable_scheduler.teacher.TeacherSubject;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Subject {

    public enum SubjectType {
        MAJOR, MINOR, ELECTIVE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String subjectCode;

    @Column(nullable = false)
    private String name;

    @Column(name = "total_weekly_period", nullable = false)
    private Integer totalWeeklyPeriod;

    @Enumerated(EnumType.STRING)
    @Column(name = "subject_type", nullable = false)
    private  SubjectType subjectType;

    @Column(name = "is_lab_sub", nullable = false)
    private Boolean isLabSubject;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeacherSubject> teacherSubjects = new ArrayList<>();

    public Subject() {}

    public Subject(String subjectCode, String name, Integer totalWeeklyPeriod, SubjectType subjectType, Boolean isLabSubject) {
        this.subjectCode = subjectCode;
        this.name = name;
        this.totalWeeklyPeriod = totalWeeklyPeriod;
        this.subjectType = subjectType;
        this.isLabSubject = isLabSubject;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getTotalWeeklyPeriod() {
        return totalWeeklyPeriod;
    }

    public void setTotalWeeklyPeriod(Integer totalWeeklyPeriod) {
        this.totalWeeklyPeriod = totalWeeklyPeriod;
    }

    public SubjectType getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectType subjectType) {
        this.subjectType = subjectType;
    }

    public Boolean getLabSubject() {
        return isLabSubject;
    }

    public void setLabSubject(Boolean labSubject) {
        isLabSubject = labSubject;
    }

    public List<TeacherSubject> getTeacherSubjects() {
        return teacherSubjects;
    }

    public void setTeacherSubjects(List<TeacherSubject> teacherSubjects) {
        this.teacherSubjects = teacherSubjects;
    }
}
