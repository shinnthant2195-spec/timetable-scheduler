package com.uni_project.timetable_scheduler.major;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/major")
public class MajorController {

    private final MajorService majorService;

    public MajorController(MajorService majorService) {
        this.majorService = majorService;
    }

    @GetMapping
    public ResponseEntity<List<Major>> getAllMajors() {
        return ResponseEntity.ok(majorService.getAllMajors());
    }

    @PostMapping
    public ResponseEntity<Major> createMajor(@RequestBody Major major) {
        return ResponseEntity.ok(majorService.addMajor(major));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object>  deleteMajor(@PathVariable String id) {
        majorService.deleteMajor(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Major> updateMajor(@PathVariable String id, @RequestBody Major major) {
        return ResponseEntity.ok(majorService.updateMajor(id, major));
    }
}
