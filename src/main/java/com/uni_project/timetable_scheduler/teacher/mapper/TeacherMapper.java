package com.uni_project.timetable_scheduler.teacher.mapper;

import com.uni_project.timetable_scheduler.subject.dto.SubjectLabelDTO;
import com.uni_project.timetable_scheduler.teacher.Teacher;
import com.uni_project.timetable_scheduler.teacher.TeacherSubject;
import com.uni_project.timetable_scheduler.teacher.dto.TeacherCreationDTO;
import com.uni_project.timetable_scheduler.teacher.dto.TeacherDetailDTO;
import com.uni_project.timetable_scheduler.teacher.dto.TeacherEditDTO;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TeacherMapper {

    @Mapping(target = "teacherSubjects", ignore = true)
    Teacher createTeacherFromDto(TeacherCreationDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "teacherSubjects", source = "subjectIds", ignore = true)
    void updateTeacherFromDto(TeacherEditDTO dto, @MappingTarget Teacher teacher);

    @Mapping(source = "teacherSubjects", target = "subjects", qualifiedByName = "mapTeacherSubjectsToDTOs")
    TeacherDetailDTO toDetailsDTO(Teacher teacher);

    @Named("mapTeacherSubjectsToDTOs")
    default List<SubjectLabelDTO> mapTeacherSubjectsToDTOs (List<TeacherSubject> teacherSubjects) {
        if (teacherSubjects == null || teacherSubjects.isEmpty()) return null;

        return teacherSubjects.stream()
                .map(TeacherSubject::getSubject)
                .map(s -> new SubjectLabelDTO(
                        s.getId(),
                        s.getName(),
                        s.getSubjectCode()
                )).toList();
    }
}
