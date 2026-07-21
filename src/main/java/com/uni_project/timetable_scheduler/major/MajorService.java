package com.uni_project.timetable_scheduler.major;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MajorService {

    private final MajorRepository majorRepo;

    public MajorService(MajorRepository majorRepo) {
        this.majorRepo = majorRepo;
    }

    public List<Major> getAllMajors() {
        return majorRepo.findAll();
    }

    public Major addMajor(Major major) {
        return majorRepo.save(major);
    }

    public void deleteMajor(String id) {
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
