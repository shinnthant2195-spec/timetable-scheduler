package com.uni_project.timetable_scheduler.department;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {

    boolean existsByNameIgnoreCase(String name);
}
