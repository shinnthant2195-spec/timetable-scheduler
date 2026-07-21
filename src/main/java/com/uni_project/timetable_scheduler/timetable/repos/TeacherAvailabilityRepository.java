package com.uni_project.timetable_scheduler.timetable.repos;

import com.uni_project.timetable_scheduler.teacher.Teacher;
import com.uni_project.timetable_scheduler.timetable.entities.TeacherAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherAvailabilityRepository extends JpaRepository<TeacherAvailability, Long> {

    List<TeacherAvailability> getTeacherAvailabilityByTeacherId(String teacherId);

    @Modifying
    @Query("DELETE FROM TeacherAvailability ta WHERE ta.teacher.id = :teacherId")
    void deleteByTeacherIdBulk(@Param("teacherId") String teacherId);

    @Modifying
    @Query("DELETE FROM TeacherAvailability ta WHERE ta.classPeriod.id = :periodId")
    void deleteByClassPeriodIdBulk(@Param("periodId") Long periodId);
}
