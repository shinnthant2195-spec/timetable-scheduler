package com.uni_project.timetable_scheduler.timetable.solver;

import ai.timefold.solver.core.api.domain.common.PlanningId;
import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;
import com.uni_project.timetable_scheduler.timetable.solver.fact.*;

@PlanningEntity
public class TimeSlot {

    @PlanningId
    private Long id;

    private SessionFact session;
    private SubjectFact subject;
    private TeacherFact teacher;

    @PlanningVariable(valueRangeProviderRefs = "timeslotRange")
    private TimeslotFact timeslot;

    @PlanningVariable(valueRangeProviderRefs = "roomRange")
    private RoomFact room;

    public TimeSlot() {}

    public TimeSlot(Long id, SessionFact session, SubjectFact subject, TeacherFact teacher) {
        this.id = id;
        this.session = session;
        this.subject = subject;
        this.teacher = teacher;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SessionFact getSession() {
        return session;
    }

    public void setSession(SessionFact session) {
        this.session = session;
    }

    public SubjectFact getSubject() {
        return subject;
    }

    public void setSubject(SubjectFact subject) {
        this.subject = subject;
    }

    public TeacherFact getTeacher() {
        return teacher;
    }

    public void setTeacher(TeacherFact teacher) {
        this.teacher = teacher;
    }

    public TimeslotFact getTimeslot() {
        return timeslot;
    }

    public void setTimeslot(TimeslotFact timeslot) {
        this.timeslot = timeslot;
    }

    public RoomFact getRoom() {
        return room;
    }

    public void setRoom(RoomFact room) {
        this.room = room;
    }
}
