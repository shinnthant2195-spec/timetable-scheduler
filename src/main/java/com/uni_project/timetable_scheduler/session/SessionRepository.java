package com.uni_project.timetable_scheduler.session;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionRepository extends JpaRepository<Session, Integer> {

    @Modifying
    @Query(value = "DELETE FROM session_subject WHERE subject_id = :subjectId", nativeQuery = true)
    void removeSubjectAssignmentBulk(@Param("subjectId") Integer subjectId);

    boolean existsByMajorId(String majorId);
}
