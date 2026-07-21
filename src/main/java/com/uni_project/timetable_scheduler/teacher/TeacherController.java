package com.uni_project.timetable_scheduler.teacher;

import com.uni_project.timetable_scheduler.teacher.dto.TeacherCreationDTO;
import com.uni_project.timetable_scheduler.teacher.dto.TeacherDetailDTO;
import com.uni_project.timetable_scheduler.teacher.dto.TeacherEditDTO;
import com.uni_project.timetable_scheduler.teacher.dto.TeacherSummaryDTO;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;


@RestController
@RequestMapping("api/teacher")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping
    public ResponseEntity<Page<TeacherSummaryDTO>> getTeacherSummaries(
            @RequestParam(required = false) Integer subjectId,
            @RequestParam(required = false) Integer majorId,
            @RequestParam(required = false) Teacher.Gender gender,
            @RequestParam(required = false) Teacher.TeacherType teacherType,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "15") Integer size
    ) {
        return ResponseEntity.ok(teacherService.getTeacherSummaries(
                subjectId, majorId, gender, teacherType, sortBy, sortDir, page, size
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherDetailDTO> getTeacherDetail(@PathVariable("id") String id) {
        return ResponseEntity.ok(teacherService.getTeacherDetail(id));
    }

    @PostMapping("/add")
    public ResponseEntity<Map<String, String>> addTeacher(@RequestBody TeacherCreationDTO teacher){
        Teacher savedTeacher = teacherService.addTeacher(teacher);
        return ResponseEntity.ok(Map.of("message", "Teacher successfully added", "id", savedTeacher.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteTeacher(@PathVariable("id") String id){
        teacherService.deleteTeacher(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateTeacher(@PathVariable("id") String id, @RequestBody TeacherEditDTO dto) {
        teacherService.updateTeacher(id, dto);
        return ResponseEntity.ok(Map.of("message", "Teacher successfully updated", "id", id));
    }

    @PostMapping("/{id}/upload-img")
    public ResponseEntity<Object> uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file){
        teacherService.uploadImage(id, file);
        return  ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/delete-img")
    public ResponseEntity<Object> deleteImage(@PathVariable String id){
        teacherService.deleteImage(id);
        return  ResponseEntity.noContent().build();
    }


}
