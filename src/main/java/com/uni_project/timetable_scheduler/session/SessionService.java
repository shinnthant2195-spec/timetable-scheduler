package com.uni_project.timetable_scheduler.session;

import com.uni_project.timetable_scheduler.major.MajorRepository;
import com.uni_project.timetable_scheduler.session.dto.SessionCreationDTO;
import com.uni_project.timetable_scheduler.session.mapper.SessionMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SessionService {

    private final SessionRepository sessionRepo;
    private final SessionMapper sessionMapper;
    private final MajorRepository majorRepo;

    public SessionService(SessionRepository sessionRepo,  SessionMapper sessionMapper,  MajorRepository majorRepo) {
        this.sessionRepo = sessionRepo;
        this.sessionMapper = sessionMapper;
        this.majorRepo = majorRepo;
    }

    public List<Session> getAllSessions() {
        return  sessionRepo.findAll();
    }

    public Session createSessionFromDTO(SessionCreationDTO dto) {
        Session session = sessionMapper.createSessionFromDTO(dto);

        if (dto.majorId() != null) {
            session.setMajor(majorRepo.getReferenceById(dto.majorId()));
        }

        return sessionRepo.save(session);
    }

    public void deleteSession(Integer id) {
       sessionRepo.deleteById(id);
    }

    public Session updateSession(Integer id, SessionCreationDTO dto) {
        Session session = sessionRepo.findById(id).orElseThrow();

        sessionMapper.updateSessionFromDTO(dto, session);

        if (dto.majorId() != null) {
            session.setMajor(majorRepo.getReferenceById(dto.majorId()));
        }
        return sessionRepo.save(session);
    }

}
