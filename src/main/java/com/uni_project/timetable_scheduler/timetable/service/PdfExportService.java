package com.uni_project.timetable_scheduler.timetable.service;

import com.uni_project.timetable_scheduler.class_period.ClassPeriod;
import com.uni_project.timetable_scheduler.class_period.ClassPeriodRepository;
import com.uni_project.timetable_scheduler.session.Session;
import com.uni_project.timetable_scheduler.session.SessionRepository;
import com.uni_project.timetable_scheduler.timetable.dto.TimetableSlotResponseDTO;
import com.uni_project.timetable_scheduler.timetable.repos.TimetableSlotRepository;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class PdfExportService {

    private final TemplateEngine templateEngine;
    private final TimetableSlotRepository slotRepo;
    private final SessionRepository sessionRepo;
    private final ClassPeriodRepository periodRepo;

    public PdfExportService(TemplateEngine templateEngine, TimetableSlotRepository slotRepo, SessionRepository sessionRepo,  ClassPeriodRepository periodRepo) {
        this.templateEngine = templateEngine;
        this.slotRepo = slotRepo;
        this.sessionRepo = sessionRepo;
        this.periodRepo = periodRepo;
    }

    public record LegendItem(String code, String name, String teacher) {}

    public record PeriodWrapper(Long id, String name, String timeRange, String type, List<Character> verticalName) {}

    public byte[] generateTimetablePdf(Integer sessionId) throws Exception {
        Session session = sessionRepo.findById(sessionId).orElseThrow();
        List<TimetableSlotResponseDTO> slots = slotRepo.getSessionTimetable(sessionId);

        // Fetch and sort periods for the Y-Axis
        List<ClassPeriod> rawPeriods = periodRepo.findAll().stream()
                .sorted(Comparator.comparing(ClassPeriod::getStartTime))
                .toList();

        // 1. Calculate boundaries for Extra Curricular Activities
        LocalTime lunchEndTime = rawPeriods.stream()
                .filter(p -> p.getType() == ClassPeriod.PeriodType.LUNCH)
                .map(ClassPeriod::getEndTime)
                .findFirst()
                .orElse(LocalTime.of(12, 0));

        List<ClassPeriod> afternoonLecturePeriods = rawPeriods.stream()
                .filter(p -> p.getType() == ClassPeriod.PeriodType.LECTURE && !p.getStartTime().isBefore(lunchEndTime))
                .toList();

        Long firstAfternoonPeriodId = afternoonLecturePeriods.isEmpty() ? -1L : afternoonLecturePeriods.getFirst().getId();
        int afternoonLectureCount = afternoonLecturePeriods.size();

        List<PeriodWrapper> periods = rawPeriods.stream().map(p -> {
            String safeName = p.getName() != null ? p.getName().trim() : "";
            List<Character> verticalChars = safeName.chars().mapToObj(c -> (char) c).toList();

            return new PeriodWrapper(
                    p.getId(),
                    safeName,
                    p.getStartTime() + " - " + p.getEndTime(),
                    p.getType().name(),
                    verticalChars
            );
        }).toList();

        // 2. Generate Unique Legend Data
        List<LegendItem> legend = slots.stream()
                .map(s -> new LegendItem(s.subjectCode(), s.subjectName(), s.teacherName()))
                .distinct()
                .sorted(Comparator.comparing(LegendItem::code))
                .toList();

        // Define Days for the Y-Axis
        List<String> days = List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY");

        // Pass all data to the HTML template
        Context context = new Context();
        context.setVariable("sessionName", session.getName());
        context.setVariable("majorName", session.getMajor() != null ? session.getMajor().getName() : "Unassigned");
        context.setVariable("slots", slots);
        context.setVariable("periods", periods);
        context.setVariable("days", days);
        context.setVariable("lunchEndTime", lunchEndTime);
        context.setVariable("firstAfternoonPeriodId", firstAfternoonPeriodId);
        context.setVariable("afternoonLectureCount", afternoonLectureCount);
        context.setVariable("legend", legend);

        // Process the HTML
        String htmlContent = templateEngine.process("timetable-pdf-template", context);

        // Convert HTML to PDF
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);
            return outputStream.toByteArray();
        }
    }

    public byte[] generateAllTimetablesZip() throws Exception {
        List<Session> sessions = sessionRepo.findAll();

        try(ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ZipOutputStream zos = new ZipOutputStream(baos)) {

            for (Session session : sessions) {
                List<TimetableSlotResponseDTO> slots = slotRepo.getSessionTimetable(session.getId());
                if (slots.isEmpty()) continue;

                byte[] pdfBytes = generateTimetablePdf(session.getId());

                String fileName = session.getName().replaceAll("[^a-zA-Z0-9.-]", "_") + "_Timetable.pdf";
                ZipEntry entry = new ZipEntry(fileName);
                zos.putNextEntry(entry);
                zos.write(pdfBytes);
                zos.closeEntry();
            }

            zos.finish();
            return baos.toByteArray();
        }
    }
}
