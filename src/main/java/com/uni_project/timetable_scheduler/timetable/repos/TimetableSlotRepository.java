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
            "t.id, t.dayOfWeek, cp.id, t.subject.id, t.subject.subjectCode, t.subject.name, " +
            "t.subject.subjectType, t.requiresLab, " +
            "t.teacher.id, t.teacher.name, r.id, r.name, t.status) " +
            "FROM TimetableSlot t " +
            "LEFT JOIN t.classPeriod cp " + // LEFT JOIN prevents null exclusion
            "LEFT JOIN t.room r " +         // LEFT JOIN prevents null exclusion
            "WHERE t.session.id = :sessionId")
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

    // Updated Query: Change `sessionId` to `sessionIds` (Collection) to check multiple cohorts at once
    @Query("SELECT t FROM TimetableSlot t " +
            "WHERE t.dayOfWeek = :day AND t.classPeriod.id = :periodId " +
            "AND t.id NOT IN :excludes " +
            "AND (t.teacher.id = :teacherId OR t.session.id IN :sessionIds OR t.room.id = :roomId)")
    List<TimetableSlot> findPotentialConflicts(
            @Param("teacherId") String teacherId,
            @Param("sessionIds") Collection<Integer> sessionIds,
            @Param("roomId") Integer roomId,
            @Param("day") DayOfWeek day,
            @Param("periodId") Long periodId,
            @Param("excludes") Collection<Long> excludes
    );

    // Finds all slots that make up a "Linked Block" (shared subject)
    @Query("SELECT t FROM TimetableSlot t WHERE t.subject.id = :subjectId " +
            "AND t.teacher.id = :teacherId " +
            "AND (t.room.id = :roomId OR (t.room IS NULL AND :roomId IS NULL)) " +
            "AND (t.dayOfWeek = :dayOfWeek OR (t.dayOfWeek IS NULL AND :dayOfWeek IS NULL)) " +
            "AND (t.classPeriod.id = :periodId OR (t.classPeriod IS NULL AND :periodId IS NULL)) " +
            "AND t.status = 'DRAFT'")
    List<TimetableSlot> findLinkedBlocks(
            @Param("subjectId") Integer subjectId,
            @Param("teacherId") String teacherId,
            @Param("roomId") Integer roomId,
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("periodId") Long periodId
    );



}