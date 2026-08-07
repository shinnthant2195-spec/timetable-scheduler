package com.uni_project.timetable_scheduler.class_period;

import com.uni_project.timetable_scheduler.exception.EntityInUseException;
import com.uni_project.timetable_scheduler.timetable.repos.TeacherAvailabilityRepository;
import com.uni_project.timetable_scheduler.timetable.repos.TimetableSlotRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClassPeriodService {
    private final ClassPeriodRepository classPeriodRepo;
    private final TeacherAvailabilityRepository teacherAvailabilityRepo;
    private final TimetableSlotRepository slotRepo;

    public ClassPeriodService(
            ClassPeriodRepository classPeriodRepo,
            TeacherAvailabilityRepository teacherAvailabilityRepo,
            TimetableSlotRepository slotRepo
            ) {
        this.classPeriodRepo = classPeriodRepo;
        this.teacherAvailabilityRepo = teacherAvailabilityRepo;
        this.slotRepo = slotRepo;
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
        if (slotRepo.existsByClassPeriodId(id)) {
            throw new EntityInUseException("Cannot delete class period. It contains active Draft or Published timetable slots.");
        }

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
