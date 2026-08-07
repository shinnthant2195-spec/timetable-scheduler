package com.uni_project.timetable_scheduler.room;

import com.uni_project.timetable_scheduler.exception.EntityInUseException;
import com.uni_project.timetable_scheduler.timetable.repos.TimetableSlotRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final TimetableSlotRepository slotRepo;

    public RoomService(RoomRepository roomRepository,  TimetableSlotRepository timetableSlotRepo) {
        this.roomRepository = roomRepository;
        this.slotRepo = timetableSlotRepo;
    }

    public List<Room> findAll() {
        return  roomRepository.findAll();
    }

    public Room addRoom(Room room) {
        return roomRepository.save(room);
    }

    public void deleteRoom(Integer id) {
        if (slotRepo.existsByRoomId(id)) {
            throw new EntityInUseException("Cannot delete room. It is actively scheduled in a Draft or Published timetable.");
        }
        roomRepository.deleteById(id);
    }

    public Room updateRoom(Integer id, Room room) {
        Room r = roomRepository.findById(id).orElseThrow();

        r.setName(room.getName());
        r.setFloor(room.getFloor());
        r.setCapacity(room.getCapacity());
        r.setRoomType(room.getRoomType());
        return roomRepository.save(r);
    }

}
