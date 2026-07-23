package com.uni_project.timetable_scheduler.department;

import com.uni_project.timetable_scheduler.department.dto.DepartmentRequestDTO;
import com.uni_project.timetable_scheduler.teacher.TeacherRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepo;
    private final TeacherRepository teacherRepo;

    public DepartmentService(DepartmentRepository departmentRepo,  TeacherRepository teacherRepo) {
        this.departmentRepo = departmentRepo;
        this.teacherRepo = teacherRepo;
    }

    public List<Department> getAllDepartments() {
        return departmentRepo.findAll();
    }

    @Transactional
    public Department createDepartment(DepartmentRequestDTO dto) {
        if (departmentRepo.existsByNameIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Department with the same name already exists!");
        }
        Department department = new Department(dto.name());
        return departmentRepo.save(department);
    }

    @Transactional
    public Department updateDepartment(Integer id, DepartmentRequestDTO dto) {
        Department department = departmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        if (departmentRepo.existsByNameIgnoreCase(dto.name()) && !department.getName().equalsIgnoreCase(dto.name())) {
            throw new IllegalArgumentException("Department with the same name already exists!");
        }

        department.setName(dto.name());
        return departmentRepo.save(department);
    }

    @Transactional
    public void deleteDepartment(Integer id) {
        if (teacherRepo.existsByDepartmentId(id)) {
            throw new IllegalStateException("Cannot delete this department. There are teachers currently assigned to it. Please reassign them first.");
        }

        departmentRepo.deleteById(id);
    }
}
