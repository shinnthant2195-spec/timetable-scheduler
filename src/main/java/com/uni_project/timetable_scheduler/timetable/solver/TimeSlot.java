package com.uni_project.timetable_scheduler.timetable.solver;

import ai.timefold.solver.core.api.domain.common.PlanningId;
import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;
import com.uni_project.timetable_scheduler.timetable.solver.fact.*;

import java.util.List;

@PlanningEntity
public class TimeSlot {

    @PlanningId
    private Long id;

    private List<SessionFact> sessions;
    private SubjectFact subject;
    private TeacherFact teacher;

    @PlanningVariable(valueRangeProviderRefs = "timeslotRange")
    private TimeslotFact timeslot;

    @PlanningVariable(valueRangeProviderRefs = "roomRange")
    private RoomFact room;

    public TimeSlot() {}

    public TimeSlot(Long id, List<SessionFact> sessions, SubjectFact subject, TeacherFact teacher) {
        this.id = id;
        this.sessions = sessions;
        this.subject = subject;
        this.teacher = teacher;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<SessionFact> getSessions() {
        return sessions;
    }

    public void setSessions(List<SessionFact> sessions) {
        this.sessions = sessions;
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

    public int getTotalStudentCount() {
        if (sessions == null) return 0;
        return sessions.stream().mapToInt(SessionFact::totalStudent).sum();
    }
}
