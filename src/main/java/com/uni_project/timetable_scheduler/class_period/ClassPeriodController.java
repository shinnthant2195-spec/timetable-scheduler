package com.uni_project.timetable_scheduler.class_period;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/period")
public class ClassPeriodController {

    private final ClassPeriodService classPeriodService;

    public ClassPeriodController(ClassPeriodService classPeriodService) {
        this.classPeriodService = classPeriodService;
    }

    @GetMapping
    public ResponseEntity<List<ClassPeriod>> getClassPeriods() {
        return ResponseEntity.ok(classPeriodService.getClassPeriods());
    }

    @PostMapping
    public ResponseEntity<ClassPeriod> createClassPeriod(@RequestBody ClassPeriod classPeriod) {
        return ResponseEntity.ok(classPeriodService.addClassPeriod(classPeriod));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteClassPeriod(@PathVariable("id") Long id) {
        classPeriodService.deleteClassPeriod(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassPeriod> updateClassPeriod(@PathVariable("id") Long id, @RequestBody ClassPeriod classPeriod) {
        return ResponseEntity.ok(classPeriodService.updateClassPeriod(id, classPeriod));
    }

}
