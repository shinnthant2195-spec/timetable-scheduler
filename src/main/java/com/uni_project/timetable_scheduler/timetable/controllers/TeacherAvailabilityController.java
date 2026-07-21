package com.uni_project.timetable_scheduler.timetable.controllers;

import com.uni_project.timetable_scheduler.timetable.dto.AvailabilityDTO;
import com.uni_project.timetable_scheduler.timetable.entities.TeacherAvailability;
import com.uni_project.timetable_scheduler.timetable.service.TeacherAvailabilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher-availability")
public class TeacherAvailabilityController {

    private final TeacherAvailabilityService teacherAvailabilityService;

    public TeacherAvailabilityController(TeacherAvailabilityService teacherAvailabilityService) {
        this.teacherAvailabilityService = teacherAvailabilityService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<AvailabilityDTO>> getTeacherAvailability(@PathVariable("id") String id)
    {
        return ResponseEntity.ok(teacherAvailabilityService.getTeacherAvailability(id));
    }

    @PostMapping("/{id}")
    public ResponseEntity<Map<String, String>> saveTeacherAvailability(@PathVariable("id") String teacherId, @RequestBody List<AvailabilityDTO> dto) {
        teacherAvailabilityService.saveTeacherAvailability(teacherId, dto);
        return ResponseEntity.ok(Map.of("message", "Teacher availability grid successfully updated."));
    }
}
