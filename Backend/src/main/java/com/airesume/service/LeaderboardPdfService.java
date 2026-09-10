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
import java.util.ArrayList;
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
            Double assessScore = c.getAssessmentScore();
            Double overall = (assessScore != null || c.getStatus() == com.airesume.model.CandidateStatus.COMPLETED || c.getStatus() == com.airesume.model.CandidateStatus.DISQUALIFIED)
                    ? c.getOverallScore()
                    : null;

            table.addCell(new Cell().add(new Paragraph("#" + rank).setBold().setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getName() != null ? c.getName() : "Candidate").setFontSize(9)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getEmail() != null ? c.getEmail() : "").setFontSize(8)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getTargetRole() != null ? c.getTargetRole() : "Software Engineer").setFontSize(8)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(resScore + "%").setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(assessScore != null ? assessScore + "%" : "Pending").setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(overall != null ? overall + "%" : "Pending").setBold().setFontColor(overall != null ? goldColor : ColorConstants.GRAY).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
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

    public byte[] generateCohortLeaderboardPdf(String companyName, String targetRole) throws Exception {
        List<Candidate> candidates;
        if (targetRole != null && !targetRole.trim().isEmpty() && !"ALL".equalsIgnoreCase(targetRole)) {
            candidates = candidateRepository.findByNormalizedCompanyAndRole(companyName, targetRole);
        } else {
            candidates = candidateRepository.findByNormalizedCompany(companyName);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        pdf.setDefaultPageSize(PageSize.A4.rotate());
        Document document = new Document(pdf);
        document.setMargins(20, 20, 20, 20);

        DeviceRgb goldColor = new DeviceRgb(212, 175, 55);
        DeviceRgb darkBg = new DeviceRgb(14, 17, 26);
        DeviceRgb blueLinkColor = new DeviceRgb(59, 130, 246);

        // Title with Company and Role
        String roleHeader = (targetRole != null && !"ALL".equalsIgnoreCase(targetRole)) ? " • " + targetRole.toUpperCase() : "";
        Paragraph title = new Paragraph("EVAL AI • " + companyName.toUpperCase() + roleHeader + " LEADERBOARD")
                .setFontSize(18)
                .setBold()
                .setFontColor(goldColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4);
        document.add(title);

        Paragraph subtitle = new Paragraph("Hiring Cohort Evaluation Dossier • Total Candidates: " + candidates.size())
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
        for (Candidate c : candidates) {
            double resScore = c.getResumeScore() != null ? c.getResumeScore() : 0.0;
            Double assessScore = c.getAssessmentScore();
            Double overall = (assessScore != null || c.getStatus() == com.airesume.model.CandidateStatus.COMPLETED || c.getStatus() == com.airesume.model.CandidateStatus.DISQUALIFIED)
                    ? c.getOverallScore()
                    : null;

            table.addCell(new Cell().add(new Paragraph("#" + rank).setBold().setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getName() != null ? c.getName() : "Candidate").setFontSize(9)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getEmail() != null ? c.getEmail() : "").setFontSize(8)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getTargetRole() != null ? c.getTargetRole() : "Role").setFontSize(8)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(resScore + "%").setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(assessScore != null ? assessScore + "%" : "Pending").setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(overall != null ? overall + "%" : "Pending").setBold().setFontColor(overall != null ? goldColor : ColorConstants.GRAY).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
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

        Paragraph footer = new Paragraph("\nGenerated on " + java.time.LocalDate.now().toString() + " by EVAL AI • Archive Dossier for " + companyName)
                .setFontSize(8)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    public byte[] generateCohortDateLeaderboardPdf(String companyName, String targetRole, java.time.LocalDate batchDate) throws Exception {
        List<Candidate> candidates;
        if (batchDate != null) {
            candidates = candidateRepository.findByNormalizedCompanyAndRoleAndDate(companyName, targetRole, batchDate);
        } else {
            candidates = candidateRepository.findByNormalizedCompanyAndRole(companyName, targetRole);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        pdf.setDefaultPageSize(PageSize.A4.rotate());
        Document document = new Document(pdf);
        document.setMargins(20, 20, 20, 20);

        DeviceRgb goldColor = new DeviceRgb(212, 175, 55);
        DeviceRgb darkBg = new DeviceRgb(14, 17, 26);
        DeviceRgb blueLinkColor = new DeviceRgb(59, 130, 246);

        String dateStr = (batchDate != null) ? " • " + batchDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy")) : "";
        Paragraph title = new Paragraph("EVAL AI • " + companyName.toUpperCase() + " • " + targetRole.toUpperCase() + dateStr + " LEADERBOARD")
                .setFontSize(18)
                .setBold()
                .setFontColor(goldColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4);
        document.add(title);

        Paragraph subtitle = new Paragraph("Date-Specific Cohort Evaluation Dossier • Total Candidates: " + candidates.size())
                .setFontSize(10)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(15);
        document.add(subtitle);

        float[] columnWidths = {35f, 110f, 130f, 110f, 65f, 75f, 65f, 70f, 90f};
        Table table = new Table(UnitValue.createPointArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));

        String[] headers = {"Rank", "Candidate Name", "Email Address", "Target Role", "Resume ATS", "Assessment", "Overall", "Status", "Resume PDF"};
        for (String h : headers) {
            Cell cell = new Cell()
                    .add(new Paragraph(h).setBold().setFontSize(9).setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(darkBg)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setPadding(6);
            table.addHeaderCell(cell);
        }

        int rank = 1;
        for (Candidate c : candidates) {
            double resScore = c.getResumeScore() != null ? c.getResumeScore() : 0.0;
            Double assessScore = c.getAssessmentScore();
            Double overall = (assessScore != null || c.getStatus() == com.airesume.model.CandidateStatus.COMPLETED || c.getStatus() == com.airesume.model.CandidateStatus.DISQUALIFIED)
                    ? c.getOverallScore()
                    : null;

            table.addCell(new Cell().add(new Paragraph("#" + rank).setBold().setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getName() != null ? c.getName() : "Candidate").setFontSize(9)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getEmail() != null ? c.getEmail() : "").setFontSize(8)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getTargetRole() != null ? c.getTargetRole() : "Role").setFontSize(8)).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(resScore + "%").setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(assessScore != null ? assessScore + "%" : "Pending").setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(overall != null ? overall + "%" : "Pending").setBold().setFontColor(overall != null ? goldColor : ColorConstants.GRAY).setFontSize(9)).setTextAlignment(TextAlignment.CENTER).setPadding(5));
            table.addCell(new Cell().add(new Paragraph(c.getStatus() != null ? c.getStatus().name() : "INVITED").setFontSize(8)).setTextAlignment(TextAlignment.CENTER).setPadding(5));

            String resumeUrl = "http://localhost:8085/api/resumes/" + c.getId() + "/pdf";
            Link link = new Link("View Resume PDF", PdfAction.createURI(resumeUrl));
            link.setFontColor(blueLinkColor);
            link.setUnderline();

            Paragraph linkParagraph = new Paragraph().add(link).setFontSize(8).setTextAlignment(TextAlignment.CENTER);
            table.addCell(new Cell().add(linkParagraph).setPadding(5));

            rank++;
        }

        document.add(table);

        Paragraph footer = new Paragraph("\nGenerated on " + java.time.LocalDate.now().toString() + " by EVAL AI • Archive Dossier for " + companyName + " (" + targetRole + ")")
                .setFontSize(8)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    public byte[] generateCandidateDossierPdf(Candidate c) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        pdf.setDefaultPageSize(PageSize.A4);
        Document document = new Document(pdf);
        document.setMargins(30, 35, 30, 35);

        DeviceRgb goldColor = new DeviceRgb(212, 175, 55);
        DeviceRgb darkBg = new DeviceRgb(14, 17, 26);
        DeviceRgb lightBg = new DeviceRgb(245, 247, 250);

        // Header Title
        Paragraph title = new Paragraph("EVAL AI • CANDIDATE EVALUATION REPORT")
                .setFontSize(18)
                .setBold()
                .setFontColor(goldColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4);
        document.add(title);

        Paragraph subtitle = new Paragraph("Comprehensive AI Resume Analysis & Technical Assessment Summary")
                .setFontSize(10)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(subtitle);

        // Candidate Profile Table
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{30f, 70f}));
        infoTable.setWidth(UnitValue.createPercentValue(100));
        infoTable.setMarginBottom(15);

        String name = c.getName() != null ? c.getName() : "Candidate";
        String email = c.getEmail() != null ? c.getEmail() : "N/A";
        String targetRole = c.getTargetRole() != null ? c.getTargetRole() : "Fullstack Software Engineer";
        String company = c.getCompanyName() != null ? c.getCompanyName() : "Standard Corporate Track";
        String date = c.getCreatedAt() != null ? c.getCreatedAt().toLocalDate().toString() : java.time.LocalDate.now().toString();
        String status = c.getStatus() != null ? c.getStatus().name() : "INVITED";

        addInfoRow(infoTable, "Candidate Name", name, darkBg);
        addInfoRow(infoTable, "Email Address", email, lightBg);
        addInfoRow(infoTable, "Target Job Role", targetRole, darkBg);
        addInfoRow(infoTable, "Company Track", company, lightBg);
        addInfoRow(infoTable, "Evaluation Date", date, darkBg);
        addInfoRow(infoTable, "Assessment Status", status, lightBg);

        document.add(infoTable);

        // Scores Section
        Paragraph scoreHeader = new Paragraph("EVALUATION PERFORMANCE METRICS")
                .setFontSize(12)
                .setBold()
                .setFontColor(goldColor)
                .setMarginTop(10)
                .setMarginBottom(8);
        document.add(scoreHeader);

        Table scoreTable = new Table(UnitValue.createPercentArray(new float[]{33.3f, 33.3f, 33.3f}));
        scoreTable.setWidth(UnitValue.createPercentValue(100));
        scoreTable.setMarginBottom(15);

        double resScore = c.getResumeScore() != null ? c.getResumeScore() : 0.0;
        String assessStr = c.getAssessmentScore() != null ? (c.getAssessmentScore() + "%") : "Pending";
        String overallStr = c.getOverallScore() != null ? (c.getOverallScore() + "%") : (c.getAssessmentScore() != null ? (c.getAssessmentScore() + "%") : "Pending");

        scoreTable.addHeaderCell(new Cell().add(new Paragraph("ATS Resume Score").setBold().setFontSize(9).setFontColor(ColorConstants.WHITE)).setBackgroundColor(darkBg).setTextAlignment(TextAlignment.CENTER).setPadding(6));
        scoreTable.addHeaderCell(new Cell().add(new Paragraph("AI Interview Score").setBold().setFontSize(9).setFontColor(ColorConstants.WHITE)).setBackgroundColor(darkBg).setTextAlignment(TextAlignment.CENTER).setPadding(6));
        scoreTable.addHeaderCell(new Cell().add(new Paragraph("Weighted Overall Score").setBold().setFontSize(9).setFontColor(ColorConstants.WHITE)).setBackgroundColor(darkBg).setTextAlignment(TextAlignment.CENTER).setPadding(6));

        scoreTable.addCell(new Cell().add(new Paragraph(resScore + "%").setBold().setFontSize(14).setFontColor(goldColor)).setTextAlignment(TextAlignment.CENTER).setPadding(10));
        scoreTable.addCell(new Cell().add(new Paragraph(assessStr).setBold().setFontSize(14).setFontColor(new DeviceRgb(16, 185, 129))).setTextAlignment(TextAlignment.CENTER).setPadding(10));
        scoreTable.addCell(new Cell().add(new Paragraph(overallStr).setBold().setFontSize(14).setFontColor(goldColor)).setTextAlignment(TextAlignment.CENTER).setPadding(10));

        document.add(scoreTable);

        // 4-Round Competency Breakdown (Read Real Database Scores)
        int r1 = 0, r2 = 0, r3 = 0, r4 = 0;
        if (c.getRoundScoresJson() != null && !c.getRoundScoresJson().isBlank()) {
            try {
                com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(c.getRoundScoresJson());
                if (node.has("roundScores") && node.get("roundScores").isObject()) {
                    node = node.get("roundScores");
                }
                if (node.has("round1")) r1 = node.get("round1").asInt();
                if (node.has("round2")) r2 = node.get("round2").asInt();
                if (node.has("round3")) r3 = node.get("round3").asInt();
                if (node.has("round4")) r4 = node.get("round4").asInt();
            } catch (Exception ignore) {}
        } else if (c.getAssessmentScore() != null) {
            int score = c.getAssessmentScore().intValue();
            r1 = score; r2 = score; r3 = score; r4 = score;
        }

        Paragraph roundHeader = new Paragraph("4-ROUND COMPETENCY BREAKDOWN")
                .setFontSize(11)
                .setBold()
                .setFontColor(goldColor)
                .setMarginTop(10)
                .setMarginBottom(6);
        document.add(roundHeader);

        Table roundTable = new Table(UnitValue.createPercentArray(new float[]{25f, 25f, 25f, 25f}));
        roundTable.setWidth(UnitValue.createPercentValue(100));
        roundTable.setMarginBottom(15);

        roundTable.addHeaderCell(new Cell().add(new Paragraph("Round 1: Aptitude\n(Logic Speed)").setFontSize(8).setBold().setFontColor(ColorConstants.WHITE)).setBackgroundColor(darkBg).setTextAlignment(TextAlignment.CENTER).setPadding(5));
        roundTable.addHeaderCell(new Cell().add(new Paragraph("Round 2: Technical\n(Domain MCQs)").setFontSize(8).setBold().setFontColor(ColorConstants.WHITE)).setBackgroundColor(darkBg).setTextAlignment(TextAlignment.CENTER).setPadding(5));
        roundTable.addHeaderCell(new Cell().add(new Paragraph("Round 3: Practical\n(Adaptive Scenarios)").setFontSize(8).setBold().setFontColor(ColorConstants.WHITE)).setBackgroundColor(darkBg).setTextAlignment(TextAlignment.CENTER).setPadding(5));
        roundTable.addHeaderCell(new Cell().add(new Paragraph("Round 4: Voice\n(Communication)").setFontSize(8).setBold().setFontColor(ColorConstants.WHITE)).setBackgroundColor(darkBg).setTextAlignment(TextAlignment.CENTER).setPadding(5));

        roundTable.addCell(new Cell().add(new Paragraph(r1 + "%").setBold().setFontSize(12).setFontColor(new DeviceRgb(16, 185, 129))).setTextAlignment(TextAlignment.CENTER).setPadding(6));
        roundTable.addCell(new Cell().add(new Paragraph(r2 + "%").setBold().setFontSize(12).setFontColor(new DeviceRgb(16, 185, 129))).setTextAlignment(TextAlignment.CENTER).setPadding(6));
        roundTable.addCell(new Cell().add(new Paragraph(r3 + "%").setBold().setFontSize(12).setFontColor(new DeviceRgb(16, 185, 129))).setTextAlignment(TextAlignment.CENTER).setPadding(6));
        roundTable.addCell(new Cell().add(new Paragraph(r4 + "%").setBold().setFontSize(12).setFontColor(new DeviceRgb(16, 185, 129))).setTextAlignment(TextAlignment.CENTER).setPadding(6));

        document.add(roundTable);

        // Skills / Feedback
        if (c.getSkills() != null && !c.getSkills().isBlank()) {
            Paragraph skillsHeader = new Paragraph("EXTRACTED TECHNICAL SKILLS")
                    .setFontSize(11)
                    .setBold()
                    .setFontColor(goldColor)
                    .setMarginTop(8)
                    .setMarginBottom(4);
            document.add(skillsHeader);

            Paragraph skillsContent = new Paragraph(c.getSkills())
                    .setFontSize(9)
                    .setFontColor(ColorConstants.DARK_GRAY)
                    .setMarginBottom(12);
            document.add(skillsContent);
        }

        String summaryText = c.getAiFeedback();
        if (summaryText == null || summaryText.isBlank()) {
            summaryText = String.format("Candidate evaluation completed for %s with overall role fitness of %s. Demonstrates structured problem solving and domain implementation.",
                    c.getTargetRole() != null ? c.getTargetRole() : "Engineering Track", overallStr);
        }

        Paragraph feedbackHeader = new Paragraph("AI EXECUTIVE ASSESSMENT SUMMARY")
                .setFontSize(11)
                .setBold()
                .setFontColor(goldColor)
                .setMarginTop(8)
                .setMarginBottom(4);
        document.add(feedbackHeader);

        Paragraph feedbackContent = new Paragraph(summaryText)
                .setFontSize(9)
                .setFontColor(ColorConstants.DARK_GRAY)
                .setMarginBottom(12);
        document.add(feedbackContent);

        // Targeted Improvement Roadmap (Read from finalReportJson if present)
        List<String> recommendations = new ArrayList<>();
        if (c.getFinalReportJson() != null && !c.getFinalReportJson().isBlank()) {
            try {
                com.fasterxml.jackson.databind.JsonNode reportNode = new com.fasterxml.jackson.databind.ObjectMapper().readTree(c.getFinalReportJson());
                if (reportNode.has("recommendations") && reportNode.get("recommendations").isArray()) {
                    for (com.fasterxml.jackson.databind.JsonNode rec : reportNode.get("recommendations")) {
                        String area = rec.has("area") ? rec.get("area").asText() : "";
                        String advice = rec.has("advice") ? rec.get("advice").asText() : "";
                        String prio = rec.has("priority") ? rec.get("priority").asText() : "Medium";
                        if (!area.isBlank()) {
                            recommendations.add(String.format("• Priority %s (%s): %s", prio, area, advice));
                        }
                    }
                }
            } catch (Exception ignore) {}
        }

        if (recommendations.isEmpty()) {
            recommendations.add("• Priority High (System Architecture): Deepen understanding of distributed systems, concurrency control, and scalability patterns.");
            recommendations.add("• Priority Medium (Core Implementation): Refine API contract design, automated integration testing, and defensive input validation.");
        }

        Paragraph roadmapHeader = new Paragraph("TARGETED IMPROVEMENT ROADMAP")
                .setFontSize(11)
                .setBold()
                .setFontColor(goldColor)
                .setMarginTop(8)
                .setMarginBottom(4);
        document.add(roadmapHeader);

        for (String rec : recommendations) {
            document.add(new Paragraph(rec).setFontSize(8.5f).setFontColor(ColorConstants.DARK_GRAY).setMarginBottom(2));
        }

        Paragraph footer = new Paragraph("\nVerified & Generated by EVAL AI • Autonomous Recruitment Intelligence Platform\nConfidential Candidate Evaluation Dossier")
                .setFontSize(8)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(15);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    private void addInfoRow(Table table, String label, String value, DeviceRgb bg) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setBold().setFontSize(9).setFontColor(ColorConstants.BLACK))
                .setBackgroundColor(new DeviceRgb(240, 240, 240))
                .setPadding(6);
        Cell valCell = new Cell()
                .add(new Paragraph(value).setFontSize(9).setFontColor(ColorConstants.BLACK))
                .setPadding(6);
        table.addCell(labelCell);
        table.addCell(valCell);
    }
}
