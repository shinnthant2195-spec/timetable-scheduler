package com.uni_project.timetable_scheduler.major;

import com.uni_project.timetable_scheduler.exception.EntityInUseException;
import com.uni_project.timetable_scheduler.session.SessionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MajorService {

    private final MajorRepository majorRepo;
    private final SessionRepository sessionRepo;

    public MajorService(MajorRepository majorRepo,  SessionRepository sessionRepo) {
        this.majorRepo = majorRepo;
        this.sessionRepo = sessionRepo;
    }

    public List<Major> getAllMajors() {
        return majorRepo.findAll();
    }

    public Major addMajor(Major major) {
        return majorRepo.save(major);
    }

    public void deleteMajor(String id) {
        if (sessionRepo.existsByMajorId(id)) {
            throw new EntityInUseException("Cannot delete Major. It is currently assigned to one or more active student Sessions.");
        }

        majorRepo.deleteById(id);
    }

    public Major updateMajor(String id, Major major) {
        Major m = majorRepo.findById(id).orElseThrow();
        m.setName(major.getName());
        m.setAcademicYear(major.getAcademicYear());
        m.setSemester(major.getSemester());
        return majorRepo.save(m);
    }

}
