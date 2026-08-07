package com.uni_project.timetable_scheduler.teacher;

import com.uni_project.timetable_scheduler.department.Department;
import com.uni_project.timetable_scheduler.subject.Subject;
import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teacher", indexes = {
        @Index(name = "idx_teacher_name", columnList = "name")
})
public class Teacher {
    public enum Gender {
        MALE, FEMALE
    }

    public enum TeacherType {
        PART_TIME, FULL_TIME
    }

    @Id
    private String id;

    @Version
    private Long version;

    @Column(nullable = false)
    private String name;

    @Column(nullable = true)
    private String profileUrl;

    @Column(nullable = false)
    private Gender gender;

    @Column(nullable = false)
    private String nrc;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private List<TeacherSubject> teacherSubjects = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeacherType teacherType;

    @Column(nullable = false)
    private String phoneContact;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    public Teacher() {}

    public Teacher(String id, String name, String profileUrl, Gender gender, String nrc, List<TeacherSubject> teacherSubjects, TeacherType teacherType, String phoneContact, String email, String address) {
        this.id = id;
        this.name = name;
        this.profileUrl = profileUrl;
        this.gender = gender;
        this.nrc = nrc;
        this.teacherSubjects = teacherSubjects;
        this.teacherType = teacherType;
        this.phoneContact = phoneContact;
        this.email = email;
        this.address = address;
    }

    public void addSubject(Subject subject) {
        TeacherSubject ts = new TeacherSubject(subject, this);
        teacherSubjects.add(ts);
    }

    public void clearSubjects() {
        teacherSubjects.clear();
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
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

    public String getProfileUrl() {
        return profileUrl;
    }

    public void setProfileUrl(String profileUrl) {
        this.profileUrl = profileUrl;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getNrc() {
        return nrc;
    }

    public void setNrc(String nrc) {
        this.nrc = nrc;
    }

    public List<TeacherSubject> getTeacherSubjects() {
        return teacherSubjects;
    }

    public void setTeacherSubjects(List<TeacherSubject> teacherSubjects) {
        this.teacherSubjects = teacherSubjects;
    }

    public TeacherType getTeacherType() {
        return teacherType;
    }

    public void setTeacherType(TeacherType teacherType) {
        this.teacherType = teacherType;
    }

    public String getPhoneContact() {
        return phoneContact;
    }

    public void setPhoneContact(String phoneContact) {
        this.phoneContact = phoneContact;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }
}
