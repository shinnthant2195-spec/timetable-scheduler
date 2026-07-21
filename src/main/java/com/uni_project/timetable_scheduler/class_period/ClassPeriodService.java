package com.uni_project.timetable_scheduler.class_period;

import com.uni_project.timetable_scheduler.timetable.repos.TeacherAvailabilityRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClassPeriodService {
    private final ClassPeriodRepository classPeriodRepo;
    private final TeacherAvailabilityRepository teacherAvailabilityRepo;

    public ClassPeriodService(
            ClassPeriodRepository classPeriodRepo,
            TeacherAvailabilityRepository teacherAvailabilityRepo
            ) {
        this.classPeriodRepo = classPeriodRepo;
        this.teacherAvailabilityRepo = teacherAvailabilityRepo;
    }

    @Transactional(readOnly = true)
    public List<ClassPeriod> getClassPeriods() {
        return classPeriodRepo.findAll();
    }

    @Transactional
    public ClassPeriod addClassPeriod(ClassPeriod classPeriod) {
        return classPeriodRepo.save(classPeriod);
    }

    @Transactional
    public void deleteClassPeriod(Long id) {
        teacherAvailabilityRepo.deleteByClassPeriodIdBulk(id);
        classPeriodRepo.deleteById(id);
    }

    @Transactional
    public ClassPeriod updateClassPeriod(Long id, ClassPeriod classPeriod) {
        ClassPeriod cp = classPeriodRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Class Period Not Found!"));

        cp.setName(classPeriod.getName());
        cp.setStartTime(classPeriod.getStartTime());
        cp.setEndTime(classPeriod.getEndTime());
        cp.setType(classPeriod.getType());
        return classPeriodRepo.save(cp);
    }


}
