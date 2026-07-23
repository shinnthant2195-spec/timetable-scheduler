package com.uni_project.timetable_scheduler.timetable.controllers;

import com.uni_project.timetable_scheduler.timetable.dto.GenerationRequestDTO;
import com.uni_project.timetable_scheduler.timetable.service.TimefoldSolverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimefoldSolverService solverService;

    public TimetableController(TimefoldSolverService solverService) {
        this.solverService = solverService;
    }

    @PostMapping("/generate/all")
    public ResponseEntity<Map<String, String>> generateGlobalSchedule(@RequestBody GenerationRequestDTO request) {
        solverService.generateGlobalScheduleAsync(request.excludedTeacherIds());
        return ResponseEntity.accepted().body(Map.of("message", "AI Solver has started processing in the background."));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getSolverStatus() {
        String status = solverService.getSolverStatus().name();
        return ResponseEntity.ok(Map.of("status", status));
    }
}