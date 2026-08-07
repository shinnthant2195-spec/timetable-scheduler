package com.uni_project.timetable_scheduler.timetable.repos;

import com.uni_project.timetable_scheduler.timetable.dto.TimetableSlotResponseDTO;
import com.uni_project.timetable_scheduler.timetable.entities.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.Collection;
import java.util.List;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {

    boolean existsByTeacherIdAndDayOfWeekAndClassPeriodIdAndIdNotIn(String teacherId, DayOfWeek day, Long periodId, Collection<Long> ids);
    boolean existsBySessionIdAndDayOfWeekAndClassPeriodIdAndIdNotIn(Integer sessionId, DayOfWeek day, Long periodId, Collection<Long> ids);
    boolean existsByRoomIdAndDayOfWeekAndClassPeriodIdAndIdNotIn(Integer roomId, DayOfWeek day, Long periodId, Collection<Long> ids);

    // Wipes only the drafts when we run a new AI generation
    @Modifying
    @Query("DELETE FROM TimetableSlot t WHERE t.status = 'DRAFT'")
    void deleteAllDrafts();

    // Wipes drafts for a specific session
    @Modifying
    @Query("DELETE FROM TimetableSlot t WHERE t.session.id = :sessionId AND t.status = 'DRAFT'")
    void deleteDraftsBySessionId(@Param("sessionId") Integer sessionId);

    // Highly optimized fetch for the React Grid (Avoids N+1 Query Problem)
    @Query("SELECT new com.uni_project.timetable_scheduler.timetable.dto.TimetableSlotResponseDTO(" +
            "t.id, t.dayOfWeek, t.classPeriod.id, t.subject.id, t.subject.subjectCode, t.subject.name, t.teacher.id, t.teacher.name, t.room.id, t.room.name, t.status) " +
            "FROM TimetableSlot t WHERE t.session.id = :sessionId")
    List<TimetableSlotResponseDTO> getSessionTimetable(@Param("sessionId") Integer sessionId);

    // Delete timeslot when a subject is removed.
    @Modifying
    @Query("DELETE FROM TimetableSlot t WHERE t.subject.id = :subjectId AND t.status = 'DRAFT'")
    void deleteDraftsBySubjectId(@Param("subjectId") Integer subjectId);

    @Modifying
    @Query("DELETE FROM TimetableSlot t WHERE t.teacher.id = :teacherId AND t.status = 'DRAFT'")
    void deleteDraftsByTeacherId(@Param("teacherId") String teacherId);

    // 1. Wipe previously published slots to make room for the new ones
    @Modifying
    @Query("DELETE FROM TimetableSlot t WHERE t.session.id = :sessionId AND t.status = 'PUBLISHED'")
    void deletePublishedBySessionId(@Param("sessionId") Integer sessionId);

    // 2. Enterprise Bulk Update: Promote Drafts to Published
    @Modifying
    @Query("UPDATE TimetableSlot t SET t.status = 'PUBLISHED' WHERE t.session.id = :sessionId AND t.status = 'DRAFT'")
    int publishDraftsBySessionId(@Param("sessionId") Integer sessionId);

    // Global Entity Usage Checks
    boolean existsByTeacherId(String teacherId);
    boolean existsBySubjectId(Integer subjectId);
    boolean existsByRoomId(Integer roomId);
    boolean existsBySessionId(Integer sessionId);
    boolean existsByClassPeriodId(Long classPeriodId);

    @Modifying
    @Query("DELETE FROM TimetableSlot t WHERE t.status = 'PUBLISHED'")
    void deleteAllPublished();

}