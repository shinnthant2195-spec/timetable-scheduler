package com.uni_project.timetable_scheduler.timetable.entities;

import com.uni_project.timetable_scheduler.class_period.ClassPeriod;
import com.uni_project.timetable_scheduler.room.Room;
import com.uni_project.timetable_scheduler.session.Session;
import com.uni_project.timetable_scheduler.subject.Subject;
import com.uni_project.timetable_scheduler.teacher.Teacher;
import jakarta.persistence.*;
import java.time.DayOfWeek;

@Entity
@Table(name = "timetable_slot")
public class TimetableSlot {

    public enum TimetableStatus {
        DRAFT, PUBLISHED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    private DayOfWeek dayOfWeek;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_period_id")
    private ClassPeriod classPeriod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    private Boolean requiresLab = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimetableStatus status = TimetableStatus.DRAFT;

    // Getters and Setters omitted for brevity...
    // Please generate standard getters/setters for all fields!

    public Long getId() {
        return id;
    }
    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }
    public ClassPeriod getClassPeriod() {
        return classPeriod;
    }
    public Room getRoom() {
        return room;
    }
    public Session getSession() {
        return session;
    }
    public Subject getSubject() {
        return subject;
    }
    public Teacher getTeacher() {
        return teacher;
    }
    public Boolean getRequiresLab() {return requiresLab; }
    public TimetableStatus getStatus() {return status; }

    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public void setClassPeriod(ClassPeriod classPeriod) { this.classPeriod = classPeriod; }
    public void setRoom(Room room) { this.room = room; }
    public void setSession(Session session) { this.session = session; }
    public void setSubject(Subject subject) { this.subject = subject; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }
    public void setRequiresLab(Boolean requiresLab) { this.requiresLab = requiresLab; }
    public void setStatus(TimetableStatus status) { this.status = status; }
}