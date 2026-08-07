package com.uni_project.timetable_scheduler.session;

import com.uni_project.timetable_scheduler.exception.EntityInUseException;
import com.uni_project.timetable_scheduler.major.MajorRepository;
import com.uni_project.timetable_scheduler.session.dto.SessionCreationDTO;
import com.uni_project.timetable_scheduler.session.dto.SessionResponseDTO;
import com.uni_project.timetable_scheduler.session.mapper.SessionMapper;
import com.uni_project.timetable_scheduler.subject.SubjectRepository;
import com.uni_project.timetable_scheduler.subject.dto.SubjectLabelDTO;
import com.uni_project.timetable_scheduler.timetable.repos.TimetableSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
public class SessionService {

    private final SessionRepository sessionRepo;
    private final SessionMapper sessionMapper;
    private final MajorRepository majorRepo;
    private final SubjectRepository subjectRepo;
    private final TimetableSlotRepository slotRepo;

    public SessionService(SessionRepository sessionRepo,  SessionMapper sessionMapper,  MajorRepository majorRepo, SubjectRepository subjectRepo, TimetableSlotRepository slotRepo) {
        this.sessionRepo = sessionRepo;
        this.sessionMapper = sessionMapper;
        this.majorRepo = majorRepo;
        this.subjectRepo = subjectRepo;
        this.slotRepo = slotRepo;
    }

    @Transactional(readOnly = true)
    public List<SessionResponseDTO> getAllSessions() {
        return  sessionRepo.findAll().stream().map(this::mapToDTO).toList();
    }

    private SessionResponseDTO mapToDTO(Session session) {
        List<SubjectLabelDTO> subjects = session.getSubjects().stream().map(
                s -> new SubjectLabelDTO(
                        s.getId(),
                        s.getName(),
                        s.getSubjectCode()
                )).toList();

        return new SessionResponseDTO(
                session.getId(),
                session.getName(),
                session.getMajor() != null? session.getMajor().getId() : null,
                session.getMajor() != null? session.getMajor().getName() : "Unassigned",
                session.getTotalStudent(),
                subjects
        );
    }
    /*
    private SessionResponseDTO mapToDTO(Session s) {
        List<SubjectLabelDTO> subList = s.getSubjects().stream()
                .map(sub -> new SubjectLabelDTO(sub.getId(), sub.getName(), sub.getSubjectCode()))
                .toList();

        return new SessionResponseDTO(
                s.getId(),
                s.getName(),
                s.getMajor() != null ? s.getMajor().getId() : null,
                s.getMajor() != null ? s.getMajor().getName() : "Unassigned",
                s.getTotalStudent(),
                subList
        );
    }
     */

    public Session createSessionFromDTO(SessionCreationDTO dto) {
        Session session = sessionMapper.createSessionFromDTO(dto);
        if (dto.majorId() != null) session.setMajor(majorRepo.getReferenceById(dto.majorId()));
        if (dto.subjectIds() != null) session.setSubjects(new HashSet<>(subjectRepo.findAllById(dto.subjectIds())));
        return sessionRepo.save(session);
    }

    public void deleteSession(Integer id) {
        if (slotRepo.existsBySessionId(id)) {
            throw new EntityInUseException("Cannot delete session. It is actively scheduled in a Draft or Published timetable.");
        }
       sessionRepo.deleteById(id);
    }

    public Session updateSession(Integer id, SessionCreationDTO dto) {
        Session session = sessionRepo.findById(id).orElseThrow();
        sessionMapper.updateSessionFromDTO(dto, session);
        if (dto.majorId() != null) session.setMajor(majorRepo.getReferenceById(dto.majorId()));
        if (dto.subjectIds() != null) session.setSubjects(new HashSet<>(subjectRepo.findAllById(dto.subjectIds())));
        return sessionRepo.save(session);
    }

}
