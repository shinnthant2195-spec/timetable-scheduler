package com.uni_project.timetable_scheduler.subject;

import com.uni_project.timetable_scheduler.subject.dto.SubjectLabelDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {

    @Query("SELECT new com.uni_project.timetable_scheduler.subject.dto.SubjectLabelDTO(" +
            "s.id, s.name, s.subjectCode)" +
            "FROM Subject s")
    List<SubjectLabelDTO> findAllSubjectLabel();

}
