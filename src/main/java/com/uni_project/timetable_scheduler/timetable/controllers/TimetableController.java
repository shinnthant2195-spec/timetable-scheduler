package com.uni_project.timetable_scheduler.timetable.controllers;

import com.uni_project.timetable_scheduler.timetable.dto.GenerationRequestDTO;
import com.uni_project.timetable_scheduler.timetable.dto.TimetableSlotResponseDTO;
import com.uni_project.timetable_scheduler.timetable.dto.TimetableSlotSwapRequestDTO;
import com.uni_project.timetable_scheduler.timetable.dto.TimetableSlotUpdateRequestDTO;
import com.uni_project.timetable_scheduler.timetable.repos.TimetableSlotRepository;
import com.uni_project.timetable_scheduler.timetable.service.TimefoldSolverService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimefoldSolverService solverService;
    private final TimetableSlotRepository  slotRepo;

    public TimetableController(TimefoldSolverService solverService,  TimetableSlotRepository timetableSlotRepo) {
        this.solverService = solverService;
        this.slotRepo = timetableSlotRepo;
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

    // --- Fetch UI Data ---
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<TimetableSlotResponseDTO>> getSessionTimetable(@PathVariable Integer sessionId) {
        return ResponseEntity.ok(slotRepo.getSessionTimetable(sessionId));
    }

    // --- Clear UI Data ---
    @Transactional
    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Map<String, String>> clearSessionTimetable(@PathVariable Integer sessionId) {
        slotRepo.deleteDraftsBySessionId(sessionId);
        return ResponseEntity.ok(Map.of("message", "Timetable wiped for session."));
    }

    // --- Publish UI Data ---
    @PostMapping("/session/{sessionId}/publish")
    public ResponseEntity<Map<String, String>> publishSessionSchedule(@PathVariable Integer sessionId) {
        try {
            solverService.publishSessionSchedule(sessionId);
            return ResponseEntity.ok(Map.of("message", "Schedule successfully published and is now live."));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/slot")
    public ResponseEntity<Map<String, String>> addManualSlot(@RequestBody TimetableSlotUpdateRequestDTO request) {
        solverService.addManualSlot(request);
        return ResponseEntity.ok(Map.of("message", "Slot manually added to the schedule."));
    }

    @PutMapping("/slot/{id}")
    public ResponseEntity<Map<String, String>> updateManualSlot(@PathVariable Long id, @RequestBody TimetableSlotUpdateRequestDTO request) {
        solverService.updateManualSlot(id, request);
        return ResponseEntity.ok(Map.of("message", "Slot successfully updated."));
    }

    @PostMapping("/slot/swap")
    public ResponseEntity<Map<String, String>> swapSlots(@RequestBody TimetableSlotSwapRequestDTO request) {
        solverService.swapSlots(request.slotId1(), request.slotId2());
        return ResponseEntity.ok(Map.of("message", "Slots successfully swapped."));
    }

    @DeleteMapping("/slot/{id}")
    public ResponseEntity<Map<String, String>> deleteSlot(@PathVariable Long id) {
        solverService.deleteManualSlot(id);
        return ResponseEntity.ok(Map.of("message", "Slot removed from schedule."));
    }

    @DeleteMapping("/drafts/all")
    public ResponseEntity<Map<String, String>> clearAllDrafts() {
        solverService.wipeAllDrafts();
        return ResponseEntity.ok(Map.of("message", "All global drafts wiped successfully."));
    }

    @DeleteMapping("/published/all")
    public ResponseEntity<Map<String, String>> clearAllPublished() {
        solverService.wipeAllPublished();
        return ResponseEntity.ok(Map.of("message", "All global published schedules wiped successfully."));
    }

    @DeleteMapping("/session/{sessionId}/published")
    public ResponseEntity<Map<String, String>> clearPublishedBySession(@PathVariable Integer sessionId) {
        solverService.wipePublishedBySession(sessionId);
        return ResponseEntity.ok(Map.of("message", "Published timetable wiped for session."));
    }
}