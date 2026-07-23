package com.uni_project.timetable_scheduler.session.mapper;

import com.uni_project.timetable_scheduler.session.Session;
import com.uni_project.timetable_scheduler.session.dto.SessionCreationDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SessionMapper {

    @Mapping(target = "major", ignore = true)
    @Mapping(target = "subjects", ignore = true)
    Session createSessionFromDTO(SessionCreationDTO dto);

    @Mapping(target = "major", ignore = true)
    @Mapping(target = "subjects", ignore = true)
    void updateSessionFromDTO(SessionCreationDTO dto, @MappingTarget Session session);
}
