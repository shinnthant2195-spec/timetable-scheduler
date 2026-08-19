package com.uni_project.timetable_scheduler.timetable.solver;

import ai.timefold.solver.core.api.score.HardSoftScore;
import ai.timefold.solver.core.api.score.stream.*;
import com.uni_project.timetable_scheduler.room.Room;
import com.uni_project.timetable_scheduler.subject.Subject;
import com.uni_project.timetable_scheduler.teacher.Teacher;
import com.uni_project.timetable_scheduler.timetable.solver.fact.SessionFact;
import ai.timefold.solver.core.api.score.stream.uni.UniConstraintCollector;

import java.util.Collections;
import java.util.List;

public class TimetableConstraintProvider implements ConstraintProvider {

    @Override
    public Constraint[] defineConstraints(ConstraintFactory factory) {
        return new Constraint[] {
                // Hard Constraints
                roomCapacity(factory),
                labRoomRequired(factory),
                teacherConflict(factory),
                sessionConflict(factory),
                roomConflict(factory),
                teacherUnavailable(factory),

                // Soft Constraints
                consecutiveSubjectBlocks(factory),
                teacherConsecutiveFatigue(factory),
                partTimeTeacherCompression(factory),
                studentClassCompression(factory),
                subjectFatigue(factory),
                // roomStability(factory),
                groupElectivesConcurrently(factory)
        };
    }

    // Enterprise Pattern: Lightweight Carrier Record for Constraint Streams
    private record SlotSessionWrapper(TimeSlot slot, SessionFact session) {}

    // ==========================================
    // HARD CONSTRAINTS (Must not be broken)`
    // ==========================================

    private Constraint roomCapacity(ConstraintFactory factory) {
        return factory.forEach(TimeSlot.class)
                .filter(slot -> slot.getSubject().subjectType() != Subject.SubjectType.ELECTIVE)
                .filter(slot -> slot.getTotalStudentCount() > slot.getRoom().capacity())
                .penalize(HardSoftScore.ONE_HARD,
                        slot -> slot.getTotalStudentCount() - slot.getRoom().capacity())
                .asConstraint("Room Capacity Too Small");
    }

    private Constraint labRoomRequired(ConstraintFactory factory) {
        return factory.forEach(TimeSlot.class)
                .filter(slot -> Boolean.TRUE.equals(slot.getRequiresLab()) &&
                        slot.getRoom().roomType() != Room.RoomType.LAB)
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Lab Subject Require Lab Room");
    }

    private Constraint teacherConflict(ConstraintFactory factory) {
        return factory.forEachUniquePair(TimeSlot.class,
                        Joiners.equal(TimeSlot::getTeacher),
                        Joiners.equal(TimeSlot::getTimeslot))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Teacher double-booking");
    }

    private Constraint sessionConflict(ConstraintFactory factory) {
        return factory.forEachUniquePair(TimeSlot.class,
                        // O(1) Object Reference Joiner
                        Joiners.equal(TimeSlot::getTimeslot))
                // Do these slots share the same student cohort?
                .filter((slotA, slotB) -> !Collections.disjoint(slotA.getSessions(), slotB.getSessions()))
                // ENTERPRISE RULE: Penalize all double-bookings UNLESS both subjects are concurrent electives
                .filter((slotA, slotB) -> !(slotA.getSubject().subjectType() == Subject.SubjectType.ELECTIVE &&
                        slotB.getSubject().subjectType() == Subject.SubjectType.ELECTIVE))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Session double-booking");
    }

    private Constraint roomConflict(ConstraintFactory factory) {
        return factory.forEachUniquePair(TimeSlot.class,
                        Joiners.equal(TimeSlot::getRoom),
                        Joiners.equal(TimeSlot::getTimeslot))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Room double-booking");
    }

    private Constraint teacherUnavailable(ConstraintFactory factory) {
        return factory.forEach(TimeSlot.class)
                .filter(slot -> slot.getTeacher().unavailableTimeslotIds().contains(slot.getTimeslot().id()))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Teacher unavailable for this timeslot");

    }

    // ================================
    // SOFT CONSTRAINT
    // ================================

    private Constraint consecutiveSubjectBlocks(ConstraintFactory factory) {
        return factory.forEachUniquePair(TimeSlot.class,
                Joiners.equal(TimeSlot::getSubject),
                Joiners.equal(TimeSlot::getRoom),
                Joiners.equal(slot -> slot.getTimeslot().dayOfWeek()),
                        Joiners.equal(slot -> slot.getTimeslot().isMorning()))
                .filter((slot1, slot2) -> Math.abs(slot1.getTimeslot().periodIndex() - slot2.getTimeslot().periodIndex()) == 1)
                .reward(HardSoftScore.ONE_SOFT)
                .asConstraint("Reward consecutive periods for the same subject");
    }

    public Constraint teacherConsecutiveFatigue(ConstraintFactory factory) {
        // We group every timeslot a teacher has on a specific day into a List.
        // We then pass that list to our custom utility method to count consecutive streaks.
        return factory.forEach(TimeSlot.class)
                .groupBy(TimeSlot::getTeacher,
                        slot -> slot.getTimeslot().dayOfWeek(),
                        ConstraintCollectors.toList())
                .penalize(HardSoftScore.ONE_SOFT,
                        (teacher, day, slotList) -> calculateConsecutiveOverload(slotList, 3))
                .asConstraint("Teacher fatigue (Max 3 consecutive periods)");
    }

    private Constraint partTimeTeacherCompression(ConstraintFactory factory) {
        // 1. Declare the output as Integer, matching what the collector actually finds
        UniConstraintCollector<TimeSlot, ?, Integer> minCollector =
                ConstraintCollectors.min((TimeSlot slot) -> slot.getTimeslot().periodIndex());

        UniConstraintCollector<TimeSlot, ?, Integer> maxCollector =
                ConstraintCollectors.max((TimeSlot slot) -> slot.getTimeslot().periodIndex());

        UniConstraintCollector<TimeSlot, ?, Long> countCollector =
                ConstraintCollectors.count();

        return factory.forEach(TimeSlot.class)
                .filter(slot -> slot.getTeacher().teacherType() == Teacher.TeacherType.PART_TIME)
                .groupBy(TimeSlot::getTeacher,
                        slot -> slot.getTimeslot().dayOfWeek(),
                        ConstraintCollectors.compose(
                                minCollector,
                                maxCollector,
                                countCollector,
                                // 2. Receive the raw Integers directly!
                                (Integer min, Integer max, Long count) -> {
                                    if (min == null || max == null) return 0;
                                    return Math.max(0, (max - min + 1) - count.intValue());
                                }
                        ))
                .filter((teacher, day, gapCount) -> gapCount != null && gapCount > 0)
                .penalize(HardSoftScore.ONE_SOFT, (teacher, day, gapCount) -> gapCount)
                .asConstraint("Compress Part-time Teacher schedules");
    }

    public Constraint studentClassCompression(ConstraintFactory factory) {
        // 1. Declare the output as Integer
        UniConstraintCollector<SlotSessionWrapper, ?, Integer> minCollector =
                ConstraintCollectors.min((SlotSessionWrapper wrapper) -> wrapper.slot().getTimeslot().periodIndex());

        UniConstraintCollector<SlotSessionWrapper, ?, Integer> maxCollector =
                ConstraintCollectors.max((SlotSessionWrapper wrapper) -> wrapper.slot().getTimeslot().periodIndex());

        UniConstraintCollector<SlotSessionWrapper, ?, Long> countCollector =
                ConstraintCollectors.count();

        return factory.forEach(TimeSlot.class)
                .flattenLast(slot -> slot.getSessions().stream()
                        .map(session -> new SlotSessionWrapper(slot, session))
                        .toList())
                .groupBy(SlotSessionWrapper::session,
                        wrapper -> wrapper.slot().getTimeslot().dayOfWeek(),
                        ConstraintCollectors.compose(
                                minCollector,
                                maxCollector,
                                countCollector,
                                // 2. Receive the raw Integers directly!
                                (Integer min, Integer max, Long count) -> {
                                    if (min == null || max == null) return 0;
                                    return Math.max(0, (max - min + 1) - count.intValue());
                                }
                        ))
                .filter((session, day, gapCount) -> gapCount != null && gapCount > 0)
                .penalize(HardSoftScore.ONE_SOFT, (session, day, gapCount) -> gapCount)
                .asConstraint("Compress Student schedules (Minimize empty gaps)");
    }

    public Constraint subjectFatigue(ConstraintFactory factory) {
        return factory.forEach(TimeSlot.class)
                .flattenLast(slot -> slot.getSessions().stream()
                        .map(session -> new SlotSessionWrapper(slot, session))
                        .toList())
                .groupBy(
                        SlotSessionWrapper::session,
                        wrapper -> wrapper.slot.getSubject(),
                        wrapper -> wrapper.slot.getTimeslot().dayOfWeek(),
                        ConstraintCollectors.count())
                .filter((session, subject, day, count) -> count > 2)
                .penalize(HardSoftScore.ONE_SOFT,
                        (session, subject, day, count) -> count - 2)
                .asConstraint("Subject fatigue (Max 2 periods per day)");
    }

    /*
    public Constraint roomStability(ConstraintFactory factory) {
        return factory.forEachUniquePair(TimeSlot.class,
                Joiners.equal(slot -> slot.getTimeslot().dayOfWeek()))
                .filter((slot1, slot2) -> slot1.getRoom() != slot2.getRoom() &&
                        !Collections.disjoint(slot1.getSessions(), slot2.getSessions()))
                .penalize(HardSoftScore.ONE_SOFT)
                .asConstraint("Room Stability Constraints");
    }

     */

    public Constraint groupElectivesConcurrently(ConstraintFactory factory) {
        return factory.forEachUniquePair(TimeSlot.class)
                .filter((slot1, slot2) -> slot1.getSubject().subjectType() == Subject.SubjectType.ELECTIVE &&
                        slot2.getSubject().subjectType() == Subject.SubjectType.ELECTIVE)
                .filter((slot1, slot2) -> !Collections.disjoint(slot1.getSessions(), slot2.getSessions()))
                .filter((slot1, slot2) -> !slot1.getTimeslot().equals(slot2.getTimeslot()))
                .penalize(HardSoftScore.ONE_SOFT)
                .asConstraint("Group Electives into Concurrent Blocks");
    }

    // ================================
    // UTILITY METHODS
    // ================================

    /*
    private int calculateGaps(List<TimeSlot> slots) {
        if (slots.size() <= 1) return 0;

        int minIndex = Integer.MAX_VALUE;
        int maxIndex = Integer.MIN_VALUE;

        for (TimeSlot slot : slots) {
            int index = slot.getTimeslot().periodIndex();
            if (index < minIndex) minIndex = index;
            if (index > maxIndex) maxIndex = index;
        }

        int gapCount = (maxIndex - minIndex + 1) - slots.size();
        return Math.max(0, gapCount);
    }

     */


    private int calculateConsecutiveOverload(List<TimeSlot> slots, int maxConsecutive) {
        // If they have 3 or fewer classes total that day, fatigue is mathematically impossible
        if (slots.size() <= maxConsecutive) return 0;

        // Extract and sort the period indexes (e.g., [1, 2, 3, 5, 6])
        List<Integer> indexes = slots.stream()
                .map(slot -> slot.getTimeslot().periodIndex())
                .sorted()
                .toList();

        int penalty = 0;
        int currentStreak = 1;

        // Iterate through the sorted indexes to detect unbroken chains
        for (int i = 1; i < indexes.size(); i++) {
            if (indexes.get(i) - indexes.get(i - 1) == 1) {
                currentStreak++;
                if (currentStreak > maxConsecutive) {
                    penalty++; // 1 penalty point for every extra consecutive period over the limit
                }
            } else {
                // The streak is broken (e.g., a lunch break), reset the counter
                currentStreak = 1;
            }
        }
        return penalty;
    }

}
