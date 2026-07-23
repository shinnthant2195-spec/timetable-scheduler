package com.uni_project.timetable_scheduler.timetable.repos;

import com.uni_project.timetable_scheduler.timetable.entities.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {

    // Enterprise O(1) Validation Checks
    boolean existsByTeacherIdAndDayOfWeekAndClassPeriodId(String teacherId, DayOfWeek day, Long periodId);
    boolean existsBySessionIdAndDayOfWeekAndClassPeriodId(Integer sessionId, DayOfWeek day, Long periodId);
    boolean existsByRoomIdAndDayOfWeekAndClassPeriodId(Integer roomId, DayOfWeek day, Long periodId);

    // Wipes only the drafts when we run a new AI generation
    @Modifying
    @Query("DELETE FROM TimetableSlot t WHERE t.status = 'DRAFT'")
    void deleteAllDrafts();
}