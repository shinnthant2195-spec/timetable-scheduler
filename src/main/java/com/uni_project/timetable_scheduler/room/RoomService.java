package com.uni_project.timetable_scheduler.room;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<Room> findAll() {
        return  roomRepository.findAll();
    }

    public Room addRoom(Room room) {
        return roomRepository.save(room);
    }

    public void deleteRoom(Integer id) {
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
