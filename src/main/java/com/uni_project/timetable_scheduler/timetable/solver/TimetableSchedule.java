package com.uni_project.timetable_scheduler.timetable.solver;

import ai.timefold.solver.core.api.domain.solution.PlanningEntityCollectionProperty;
import ai.timefold.solver.core.api.domain.solution.PlanningScore;
import ai.timefold.solver.core.api.domain.solution.PlanningSolution;
import ai.timefold.solver.core.api.domain.solution.ProblemFactCollectionProperty;
import ai.timefold.solver.core.api.domain.valuerange.ValueRangeProvider;
import ai.timefold.solver.core.api.score.HardSoftScore;
import com.uni_project.timetable_scheduler.timetable.solver.fact.RoomFact;
import com.uni_project.timetable_scheduler.timetable.solver.fact.TimeslotFact;

import java.util.List;

@PlanningSolution
public class TimetableSchedule {

    @ProblemFactCollectionProperty
    @ValueRangeProvider(id = "timeslotRange")
    private List<TimeslotFact> timeslots;

    @ProblemFactCollectionProperty
    @ValueRangeProvider(id = "roomRange")
    private List<RoomFact> rooms;

    @PlanningEntityCollectionProperty
    private List<TimeSlot> slots;

    @PlanningScore
    private HardSoftScore score;

    public TimetableSchedule() {}

    public TimetableSchedule(List<TimeSlot> slots, List<RoomFact> rooms, List<TimeslotFact> timeslots) {
        this.slots = slots;
        this.rooms = rooms;
        this.timeslots = timeslots;
    }

    public List<TimeslotFact> getTimeslots() {
        return timeslots;
    }

    public void setTimeslots(List<TimeslotFact> timeslots) {
        this.timeslots = timeslots;
    }

    public List<RoomFact> getRooms() {
        return rooms;
    }

    public void setRooms(List<RoomFact> rooms) {
        this.rooms = rooms;
    }

    public List<TimeSlot> getSlots() {
        return slots;
    }

    public void setSlots(List<TimeSlot> slots) {
        this.slots = slots;
    }

    public HardSoftScore getScore() {
        return score;
    }

    public void setScore(HardSoftScore score) {
        this.score = score;
    }
}
