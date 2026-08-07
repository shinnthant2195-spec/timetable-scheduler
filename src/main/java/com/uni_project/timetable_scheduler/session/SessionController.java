package com.uni_project.timetable_scheduler.session;

import com.uni_project.timetable_scheduler.session.dto.SessionCreationDTO;
import com.uni_project.timetable_scheduler.session.dto.SessionResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/session")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    public ResponseEntity<List<SessionResponseDTO>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @PostMapping
    public ResponseEntity<Session> createSession(@RequestBody SessionCreationDTO dto) {
        return ResponseEntity.ok(sessionService.createSessionFromDTO(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteSession(@PathVariable("id") Integer id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Session> updateSession(@PathVariable("id") Integer id, @RequestBody SessionCreationDTO dto) {
        return ResponseEntity.ok(sessionService.updateSession(id, dto));
    }
}
