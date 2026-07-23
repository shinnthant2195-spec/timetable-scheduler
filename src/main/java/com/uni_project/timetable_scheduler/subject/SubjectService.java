package com.uni_project.timetable_scheduler.subject;

import com.uni_project.timetable_scheduler.major.Major;
import com.uni_project.timetable_scheduler.major.MajorRepository;
import com.uni_project.timetable_scheduler.subject.dto.SubjectLabelDTO;
import com.uni_project.timetable_scheduler.subject.dto.SubjectRequestDTO;
import com.uni_project.timetable_scheduler.subject.dto.SubjectResponseDTO;
import com.uni_project.timetable_scheduler.subject.mapper.SubjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepo;
    private final MajorRepository majorRepo;
    private final SubjectMapper subjectMapper;

    public SubjectService(SubjectRepository subjectRepo, MajorRepository majorRepo, SubjectMapper subjectMapper) {
        this.subjectRepo = subjectRepo;
        this.majorRepo = majorRepo;
        this.subjectMapper = subjectMapper;
    }

    public Page<SubjectResponseDTO> findAllSubjects(String sortBy, String sortDir, Integer page, Integer size) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(Sort.Direction.ASC, sortBy)
                : Sort.by(Sort.Direction.DESC, sortBy);

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Subject> subjectPage = subjectRepo.findAll(pageable);

        return subjectPage.map(s -> new SubjectResponseDTO(
                s.getId(),
                s.getSubjectCode(),
                s.getName(),
                s.getSubjectType().name(),
                s.getLabSubject(),
                s.getTotalWeeklyPeriod()
        ));
    }

    public List<SubjectLabelDTO> findAllSubjectLabels() {
        return subjectRepo.findAllSubjectLabel();
    }

    @Transactional
    public Subject addSubject(SubjectRequestDTO dto) {
        Subject subject = subjectMapper.createSubjectFromDTO(dto);
        return subjectRepo.save(subject);
    }

    @Transactional
    public void deleteSubject(Integer id) {
        subjectRepo.deleteById(id);
    }

    @Transactional
    public Subject updateSubject(Integer id, SubjectRequestDTO dto) {
        Subject s = subjectRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Major with id " + id + " not found"));

        subjectMapper.updateSubjectFromDTO(dto, s);
        return subjectRepo.save(s);
    }

}
