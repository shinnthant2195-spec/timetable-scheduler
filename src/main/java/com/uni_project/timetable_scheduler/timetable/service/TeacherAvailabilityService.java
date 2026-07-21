package com.uni_project.timetable_scheduler.timetable.service;

import com.uni_project.timetable_scheduler.class_period.ClassPeriodRepository;
import com.uni_project.timetable_scheduler.teacher.Teacher;
import com.uni_project.timetable_scheduler.teacher.TeacherRepository;
import com.uni_project.timetable_scheduler.timetable.dto.AvailabilityDTO;
import com.uni_project.timetable_scheduler.timetable.entities.TeacherAvailability;
import com.uni_project.timetable_scheduler.timetable.repos.TeacherAvailabilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeacherAvailabilityService {

    private final TeacherAvailabilityRepository  teacherAvailabilityRepo;
    private final TeacherRepository teacherRepo;
    private final ClassPeriodRepository classPeriodRepo;

    public TeacherAvailabilityService(
            TeacherAvailabilityRepository teacherAvailabilityRepo,
            TeacherRepository teacherRepo,
            ClassPeriodRepository classPeriodRepo
    ) {
        this.teacherAvailabilityRepo = teacherAvailabilityRepo;
        this.teacherRepo = teacherRepo;
        this.classPeriodRepo = classPeriodRepo;
    }

    public List<AvailabilityDTO> getTeacherAvailability(String teacherId) {
        return teacherAvailabilityRepo.getTeacherAvailabilityByTeacherId(teacherId).stream()
                .map(ta -> new AvailabilityDTO(ta.getDayOfWeek(), ta.getClassPeriod().getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveTeacherAvailability(String teacherId, List<AvailabilityDTO> dto) {
        Teacher teacher = teacherRepo.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher with Id: " +  teacherId + " not found"));

        // Wipe all the availability data for a specific teacher.
        teacherAvailabilityRepo.deleteByTeacherIdBulk(teacherId);

        if (dto == null || dto.isEmpty()) return;

        List<TeacherAvailability> teacherAvailabilityList = dto.stream()
                .map(a -> new TeacherAvailability(teacher, a.dayOfWeek(), classPeriodRepo.getReferenceById(a.classPeriodId()))).collect(Collectors.toList());

        teacherAvailabilityRepo.saveAll(teacherAvailabilityList);
    }
}
