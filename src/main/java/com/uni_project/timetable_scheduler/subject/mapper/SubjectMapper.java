package com.uni_project.timetable_scheduler.subject.mapper;

import com.uni_project.timetable_scheduler.subject.Subject;
import com.uni_project.timetable_scheduler.subject.dto.SubjectRequestDTO;
import org.mapstruct.*;


@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SubjectMapper {

    @Mapping(target = "labSubject", source = "isLabSubject")
    Subject createSubjectFromDTO(SubjectRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "labSubject", source = "isLabSubject")
    void updateSubjectFromDTO(SubjectRequestDTO dto, @MappingTarget Subject subject);

}
