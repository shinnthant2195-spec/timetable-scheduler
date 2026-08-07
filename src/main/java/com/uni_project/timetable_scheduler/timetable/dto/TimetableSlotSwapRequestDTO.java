package com.uni_project.timetable_scheduler.timetable.dto;

public record TimetableSlotSwapRequestDTO(
        Long slotId1,
        Long slotId2
) {}