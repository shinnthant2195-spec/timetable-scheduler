package com.uni_project.timetable_scheduler.teacher;

import com.uni_project.timetable_scheduler.department.DepartmentRepository;
import com.uni_project.timetable_scheduler.exception.EntityInUseException;
import com.uni_project.timetable_scheduler.storage.CloudStorageService;
import com.uni_project.timetable_scheduler.subject.SubjectRepository;
import com.uni_project.timetable_scheduler.teacher.dto.TeacherCreationDTO;
import com.uni_project.timetable_scheduler.teacher.dto.TeacherDetailDTO;
import com.uni_project.timetable_scheduler.teacher.dto.TeacherEditDTO;
import com.uni_project.timetable_scheduler.teacher.dto.TeacherSummaryDTO;
import com.uni_project.timetable_scheduler.teacher.mapper.TeacherMapper;
import com.uni_project.timetable_scheduler.timetable.repos.TeacherAvailabilityRepository;
import com.uni_project.timetable_scheduler.timetable.repos.TimetableSlotRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class TeacherService {

    private final TeacherRepository teacherRepo;
    private final TeacherMapper teacherMapper;
    private final SubjectRepository subjectRepo;
    private final CloudStorageService cloudStorageService;
    private final DepartmentRepository departmentRepo;
    private final TeacherAvailabilityRepository availabilityRepo;
    private final TimetableSlotRepository slotRepo;

    public TeacherService(
            TeacherRepository teacherRepository,
            TeacherMapper teacherMapper,
            SubjectRepository subjectRepo,
            CloudStorageService cloudStorageService,
            DepartmentRepository departmentRepo,
            TeacherAvailabilityRepository availabilityRepo,
            TimetableSlotRepository slotRepo
    ) {
        this.teacherRepo = teacherRepository;
        this.teacherMapper = teacherMapper;
        this.subjectRepo = subjectRepo;
        this.cloudStorageService = cloudStorageService;
        this.departmentRepo = departmentRepo;
        this.availabilityRepo = availabilityRepo;
        this.slotRepo = slotRepo;
    }

    @Transactional(readOnly = true)
    public Page<TeacherSummaryDTO> getTeacherSummaries(
            Integer subjectId, Integer departmentId, Integer majorId, Teacher.Gender gender, Teacher.TeacherType teacherType,
            String sortBy, String sortDir, Integer page, Integer size) {

        Sort sort = Sort.by(sortDir.equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);

        Pageable pageable = PageRequest.of(page, size, sort);

        var spec = TeacherSpecification.filterTeacher(subjectId, departmentId, majorId, gender, teacherType);

        Page<Teacher> teacherPage = teacherRepo.findAll(spec, pageable);

        /*
        // Previous returning teacher Page.
        return teacherPage.map(t -> {
            String subjectStr = t.getTeacherSubjects().stream()
                    .map(ts -> ts.getSubject().getSubjectCode())
                    .distinct()
                    .collect(Collectors.joining(", "));

            return new TeacherSummaryDTO(
                    t.getProfileUrl(),
                    t.getId(),
                    t.getName(),
                    subjectStr
            );
        });
         */

        return teacherPage.map(t -> new  TeacherSummaryDTO(
                t.getProfileUrl(),
                t.getId(),
                t.getName(),
                t.getDepartment() != null? t.getDepartment().getName() : "Unassigned"
        ));
    }

    @Transactional(readOnly = true)
    public TeacherDetailDTO getTeacherDetail(String id) {
        Teacher teacher = teacherRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher with ID '" + id + "' not found."));

        return teacherMapper.toDetailsDTO(teacher);
    }

    @Transactional
    public Teacher addTeacher(TeacherCreationDTO dto) {
        if (teacherRepo.existsById(dto.id())) {
            throw new RuntimeException("DuplicateEntry: A teacher with ID '" + dto.id() + "' already exists.");
        }

        Teacher teacher = teacherMapper.createTeacherFromDto(dto);

        if (dto.subjectIds() != null && !dto.subjectIds().isEmpty()) {
            dto.subjectIds().forEach(id -> teacher.addSubject(subjectRepo.getReferenceById(id)));
        }

        if (dto.department() != null) teacher.setDepartment(departmentRepo.getReferenceById(dto.department()));
        return teacherRepo.save(teacher);
    }

    @Transactional
    public void deleteTeacher(String id) {
        if (slotRepo.existsByTeacherId(id)) {
            throw new EntityInUseException("Cannot delete teacher. They are actively assigned to a Draft or Published timetable.");
        }
        deleteImage(id);
        availabilityRepo.deleteByTeacherIdBulk(id);
        teacherRepo.deleteById(id);
    }

    @Transactional
    public Teacher updateTeacher(String id, TeacherEditDTO dto) {
        Teacher teacher = teacherRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher with ID '" + id + "' not found."));

        teacherMapper.updateTeacherFromDto(dto, teacher);

        // Get existing subjects
        Set<Integer> existingSubjectIds = teacher.getTeacherSubjects().stream()
                .map(ts -> ts.getSubject().getId())
                .collect(Collectors.toSet());

        // Get new selected subjects
        List<Integer> incomingSubjectIds = dto.subjectIds() != null ? dto.subjectIds() : new ArrayList<>();

        // Remove subjects that the user unselected.
        teacher.getTeacherSubjects().removeIf(ts -> !incomingSubjectIds.contains(ts.getSubject().getId()));

        // Add only newly selected subjects
        incomingSubjectIds.stream()
                .filter(s -> !existingSubjectIds.contains(s))
                .forEach(subId -> teacher.addSubject(subjectRepo.getReferenceById(subId)));

        // Set new department
        if (dto.department() != null)  teacher.setDepartment(departmentRepo.getReferenceById(dto.department()));

        return teacherRepo.save(teacher);
    }

    @Transactional
    public void uploadImage(String id, MultipartFile file){
        Teacher teacher = teacherRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher with ID '" + id + "' not found."));

        String uploadUrl = cloudStorageService.uploadImage(file);
        teacher.setProfileUrl(uploadUrl);
        teacherRepo.save(teacher);
    }

    @Transactional
    public void deleteImage(String id) {
        Teacher teacher = teacherRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher with ID '" + id + "' not found."));

        if (teacher.getProfileUrl() != null) {
            cloudStorageService.deleteImage(teacher.getProfileUrl());
            teacher.setProfileUrl(null);
            teacherRepo.save(teacher);
        }
    }

}
