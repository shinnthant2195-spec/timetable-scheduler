package com.uni_project.timetable_scheduler.timetable.solver;

import ai.timefold.solver.core.api.score.HardSoftScore;
import ai.timefold.solver.core.api.score.stream.*;
import com.uni_project.timetable_scheduler.room.Room;
import com.uni_project.timetable_scheduler.teacher.Teacher;

import java.util.List;

public class TimetableConstraintProvider implements ConstraintProvider {

    @Override
    public Constraint[] defineConstraints(ConstraintFactory factory) {
        return new Constraint[]{
                // Hard Constraints
                roomCapacity(factory),
                labRoomRequired(factory),
                teacherConflict(factory),
                sessionConflict(factory),
                roomConflict(factory),
                teacherUnavailable(factory),

                // Soft Constraints
                partTimeTeacherCompression(factory),
                studentClassCompression(factory),
                subjectFatigue(factory),
                roomStability(factory)
        };
    }

    // ==========================================
    // HARD CONSTRAINTS (Must not be broken)
    // ==========================================

    private Constraint roomCapacity(ConstraintFactory factory) {
        return factory.forEach(TimetableSlot.class)
                .filter(slot -> slot.getSession().totalStudent() > slot.getRoom().capacity())
                .penalize(HardSoftScore.ONE_HARD,
                        slot -> slot.getSession().totalStudent() - slot.getRoom().capacity())
                .asConstraint("Room capacity too small");
    }

    private Constraint labRoomRequired(ConstraintFactory factory) {
        return factory.forEach(TimetableSlot.class)
                .filter(slot -> Boolean.TRUE.equals(slot.getSubject().isLabSubject()) &&
                        slot.getRoom().roomType() != Room.RoomType.LAB)
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Lab subject require Lab room");
    }

    private Constraint teacherConflict(ConstraintFactory factory) {
        return factory.forEachUniquePair(TimetableSlot.class,
                Joiners.equal(TimetableSlot::getTeacher),
                Joiners.equal(TimetableSlot::getTimeslot))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Teacher double-booking");
    }

    private Constraint sessionConflict(ConstraintFactory factory) {
        return factory.forEachUniquePair(TimetableSlot.class,
                Joiners.equal(TimetableSlot::getSession),
                Joiners.equal(TimetableSlot::getTimeslot))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Session double-booking");
    }

    private Constraint roomConflict(ConstraintFactory factory) {
        return factory.forEachUniquePair(TimetableSlot.class,
                Joiners.equal(TimetableSlot::getRoom),
                Joiners.equal(TimetableSlot::getTimeslot))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Room  double-booking");
    }

    private Constraint teacherUnavailable(ConstraintFactory factory) {
        return factory.forEach(TimetableSlot.class)
                .filter(slot -> slot.getTeacher().unavailableTimeslotIds().contains(slot.getTeacher().id()))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Teacher unavailable for this timeslot");
    }

    // ================================
    // SOFT CONSTRAINT
    // ================================

    private Constraint partTimeTeacherCompression(ConstraintFactory factory) {
        return factory.forEach(TimetableSlot.class)
                .filter(slot -> slot.getTeacher().teacherType() == Teacher.TeacherType.PART_TIME)
                .groupBy(TimetableSlot::getTeacher,
                        slot -> slot.getTimeslot().dayOfWeek(),
                        ConstraintCollectors.toList())
                .penalize(HardSoftScore.ONE_SOFT,
                        (teacher, day, slotList) -> calculateGaps(slotList))
                .asConstraint("Compress Part-time Teacher schedules");
    }

    private Constraint studentClassCompression(ConstraintFactory factory) {
        return factory.forEach(TimetableSlot.class)
                .groupBy(TimetableSlot::getSession,
                        slot -> slot.getTimeslot().dayOfWeek(),
                        ConstraintCollectors.toList())
                .penalize(HardSoftScore.ONE_SOFT,
                        (session, day, slotList) -> calculateGaps(slotList))
                .asConstraint("Compress Student schedules (Minimize empty gaps)");
    }

    private Constraint subjectFatigue(ConstraintFactory factory) {
        return factory.forEach(TimetableSlot.class)
                .groupBy(TimetableSlot::getSession,
                        TimetableSlot::getSubject,
                        slot -> slot.getTimeslot().dayOfWeek(),
                        ConstraintCollectors.count())
                .filter((session, subject, day, count) -> count > 3)
                .penalize(HardSoftScore.ONE_SOFT,
                        (session, subject, day, count) -> count - 3)
                .asConstraint("Subject fatigue (Max 3 periods per day)");
    }

    private Constraint roomStability(ConstraintFactory factory) {
        return factory.forEachUniquePair(TimetableSlot.class,
                Joiners.equal(TimetableSlot::getSession),
                Joiners.equal(slot -> slot.getTimeslot().dayOfWeek()))
                .filter((slot1, slot2) -> slot1.getRoom() != slot2.getRoom())
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Room stability for students");
    }

    private int calculateGaps(List<TimetableSlot> slots) {
        if (slots.size() <= 1) return 0;

        int minIndex = slots.stream().mapToInt(s -> s.getTimeslot().periodIndex()).min().orElse(0);
        int maxIndex = slots.stream().mapToInt(s -> s.getTimeslot().periodIndex()).max().orElse(0);

        return (maxIndex - minIndex + 1) - slots.size();
    }
}
