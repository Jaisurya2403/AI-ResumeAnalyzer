package com.airesume.service;

import com.airesume.model.Candidate;
import com.airesume.repository.CandidateRepository;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.action.PdfAction;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Link;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class LeaderboardPdfService {

    @Autowired
    private CandidateRepository candidateRepository;

    public byte[] generateLeaderboardPdf() throws Exception {
        List<Candidate> candidates = candidateRepository.findAllOrderByOverallScoreDesc();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        pdf.setDefaultPageSize(PageSize.A4.rotate()); // Landscape table
        Document document = new Document(pdf);
        document.setMargins(20, 20, 20, 20);

        DeviceRgb goldColor = new DeviceRgb(212, 175, 55);
        DeviceRgb darkBg = new DeviceRgb(14, 17, 26);
        DeviceRgb blueLinkColor = new DeviceRgb(59, 130, 246);

        // Header
        Paragraph title = new Paragraph("EVAL AI • RECRUITMENT TALENT LEADERBOARD")
                .setFontSize(18)
                .setBold()
                .setFontColor(goldColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4);
        document.add(title);

        Paragraph subtitle = new Paragraph("AI-Assessed Multi-Round Performance Dossier & Candidate Rankings")
                .setFontSize(10)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(15);
        document.add(subtitle);

        // Table (9 columns including Resume PDF link)
        float[] columnWidths = {35f, 110f, 130f, 110f, 65f, 75f, 65f, 70f, 90f};
        Table table = new Table(UnitValue.createPointArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));

        // Header Row
        String[] headers = {"Rank", "Candidate Name", "Email Address", "Target Role", "Resume ATS", "Assessment", "Overall", "Status", "Resume PDF"};
        for (String h : headers) {
            Cell cell = new Cell()
                    .add(new Paragraph(h).setBold().setFontSize(9).setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(darkBg)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setPadding(6);
            table.addHeaderCell(cell);
        }

        // Data Rows
        int rank = 1;
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd, yyyy");

        for (Candidate c : candidates) {
            double resScore = c.getResumeScore() != null ? c.getResumeScore() : 0.0;
            double assessScore = c.getAssessmentScore() != null ? c.getAssessmentScore() : 0.0;
            double overall = c.getOverallScore() != null ? c.getOverallScore() : resScore;

            table.addCell(new Cell().add(new Paragraph("#" + rank).setBold().setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getName() != null ? c.getName() : "Candidate").setFontSize(9)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getEmail() != null ? c.getEmail() : "").setFontSize(8)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getTargetRole() != null ? c.getTargetRole() : "Software Engineer").setFontSize(8)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(resScore + "%").setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getAssessmentScore() != null ? assessScore + "%" : "Pending").setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(overall + "%").setBold().setFontColor(goldColor).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getStatus() != null ? c.getStatus().name() : "INVITED").setFontSize(8)).setTextAlignment(TextAlignment.CENTER).setPadding(5));

            // Clickable Resume Link
            String resumeUrl = "http://localhost:8085/api/resumes/" + c.getId() + "/pdf";
            Link link = new Link("View Resume PDF", PdfAction.createURI(resumeUrl));
            link.setFontColor(blueLinkColor);
            link.setUnderline();

            Paragraph linkParagraph = new Paragraph().add(link).setFontSize(8).setTextAlignment(TextAlignment.CENTER);
            table.addCell(new Cell().add(linkParagraph).setPadding(5));

            rank++;
        }

        document.add(table);

        Paragraph footer = new Paragraph("\nGenerated on " + java.time.LocalDate.now().toString() + " by EVAL AI Recruitment Platform • Confidential Candidate Intelligence")
                .setFontSize(8)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }
}
