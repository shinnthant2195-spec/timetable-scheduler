package com.uni_project.timetable_scheduler.subject;

import com.uni_project.timetable_scheduler.subject.dto.SubjectLabelDTO;
import com.uni_project.timetable_scheduler.subject.dto.SubjectRequestDTO;
import com.uni_project.timetable_scheduler.subject.dto.SubjectResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("api/subject")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping
    public ResponseEntity<Page<SubjectResponseDTO>> findAllSubjects(
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "15") Integer size)
    {
        return ResponseEntity.ok(subjectService.findAllSubjects(sortBy, sortDir, page, size));
    }

    // This is specifically for use in teacher registration's subject drop-down option
    @GetMapping("/label")
    public ResponseEntity<List<SubjectLabelDTO>> getAllSubjectsByMajor() {
        return ResponseEntity.ok(subjectService.findAllSubjectLabels());
    }

    @PostMapping
    public ResponseEntity<Subject> addSubject(@RequestBody SubjectRequestDTO dto) {
        return ResponseEntity.ok(subjectService.addSubject(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Integer id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Integer id, @RequestBody SubjectRequestDTO dto) {
        return ResponseEntity.ok(subjectService.updateSubject(id, dto));
    }
}
