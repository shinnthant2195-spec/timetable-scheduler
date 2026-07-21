package com.uni_project.timetable_scheduler.class_period;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassPeriodRepository extends JpaRepository<ClassPeriod, Long>{
}
