package com.uni_project.timetable_scheduler.timetable.solver.fact;

import com.uni_project.timetable_scheduler.room.Room;

public record RoomFact(
        Integer id,
        Integer capacity,
        Room.RoomType roomType
) {
}
