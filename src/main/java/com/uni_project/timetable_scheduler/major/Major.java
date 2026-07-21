package com.uni_project.timetable_scheduler.major;

import jakarta.persistence.*;

@Entity
public class Major {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer academicYear;

    @Column(nullable = false)
    private Integer semester;

    public Major() {}

    public Major(String id, String name, Integer academicYear, Integer semester) {
        this.id = id;
        this.name = name;
        this.academicYear = academicYear;
        this.semester = semester;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }
}
