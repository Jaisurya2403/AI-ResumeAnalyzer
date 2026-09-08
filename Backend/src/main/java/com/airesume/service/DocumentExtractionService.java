package com.airesume.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class DocumentExtractionService {

    public enum DocumentType {
        PDF,
        WORD_DOCX,
        WORD_DOC,
        IMAGE,
        PLAIN_TEXT,
        UNKNOWN
    }

    public DocumentType detectDocumentType(String fileName, byte[] data) {
        if (fileName == null) return DocumentType.UNKNOWN;
        String lower = fileName.toLowerCase();

        if (lower.endsWith(".pdf")) {
            return DocumentType.PDF;
        } else if (lower.endsWith(".docx") || lower.endsWith(".odt")) {
            return DocumentType.WORD_DOCX;
        } else if (lower.endsWith(".doc")) {
            return DocumentType.WORD_DOC;
        } else if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")
                || lower.endsWith(".webp") || lower.endsWith(".bmp") || lower.endsWith(".tiff")
                || lower.endsWith(".tif") || lower.endsWith(".gif")) {
            return DocumentType.IMAGE;
        } else if (lower.endsWith(".txt") || lower.endsWith(".rtf") || lower.endsWith(".md")
                || lower.endsWith(".html") || lower.endsWith(".htm") || lower.endsWith(".json")
                || lower.endsWith(".csv")) {
            return DocumentType.PLAIN_TEXT;
        }

        // Magic number sniff
        if (data != null && data.length > 4) {
            if (data[0] == '%' && data[1] == 'P' && data[2] == 'D' && data[3] == 'F') {
                return DocumentType.PDF;
            }
            if (data[0] == 'P' && data[1] == 'K' && data[2] == 0x03 && data[3] == 0x04) {
                return DocumentType.WORD_DOCX;
            }
            if ((data[0] & 0xFF) == 0x89 && data[1] == 'P' && data[2] == 'N' && data[3] == 'G') {
                return DocumentType.IMAGE;
            }
            if ((data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8) {
                return DocumentType.IMAGE;
            }
        }

        return DocumentType.PLAIN_TEXT;
    }

    public String extractText(byte[] fileBytes, String fileName) {
        if (fileBytes == null || fileBytes.length == 0) {
            return "";
        }

        DocumentType type = detectDocumentType(fileName, fileBytes);

        switch (type) {
            case PDF:
                return extractTextFromPdf(fileBytes);
            case WORD_DOCX:
                return extractTextFromDocx(fileBytes);
            case WORD_DOC:
                return extractTextFromBinaryDoc(fileBytes);
            case PLAIN_TEXT:
                return extractTextFromPlainText(fileBytes, fileName);
            case IMAGE:
                return "";
            default:
                return extractTextFromPlainText(fileBytes, fileName);
        }
    }

    public String extractTextFromPdf(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(document).trim();
        } catch (IOException e) {
            System.err.println("Error extracting PDF text: " + e.getMessage());
            return "";
        }
    }

    public String extractTextFromDocx(byte[] docxBytes) {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(docxBytes);
             ZipInputStream zis = new ZipInputStream(bais)) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if ("word/document.xml".equalsIgnoreCase(entry.getName())) {
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[4096];
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        baos.write(buffer, 0, len);
                    }
                    String xml = baos.toString(StandardCharsets.UTF_8);
                    
                    String text = xml.replaceAll("</w:p>", "\n")
                                     .replaceAll("</w:tr>", "\n")
                                     .replaceAll("<[^>]+>", " ")
                                     .replaceAll("&amp;", "&")
                                     .replaceAll("&lt;", "<")
                                     .replaceAll("&gt;", ">")
                                     .replaceAll("&quot;", "\"")
                                     .replaceAll("&apos;", "'")
                                     .replaceAll("[ \\t]+", " ")
                                     .trim();
                    return text;
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting text from DOCX: " + e.getMessage());
        }
        return extractTextFromBinaryDoc(docxBytes);
    }

    public String extractTextFromBinaryDoc(byte[] docBytes) {
        StringBuilder sb = new StringBuilder();
        boolean inWord = false;
        for (int i = 0; i < docBytes.length; i++) {
            byte b = docBytes[i];
            if ((b >= 32 && b <= 126) || b == '\n' || b == '\r' || b == '\t') {
                sb.append((char) b);
                inWord = true;
            } else if (inWord) {
                sb.append(' ');
                inWord = false;
            }
        }
        return sb.toString().replaceAll("\\s+", " ").trim();
    }

    public String extractTextFromPlainText(byte[] bytes, String fileName) {
        try {
            String text = new String(bytes, StandardCharsets.UTF_8);
            if (fileName != null && fileName.toLowerCase().endsWith(".rtf")) {
                text = text.replaceAll("\\\\[a-zA-Z0-9]+ ?", " ")
                           .replaceAll("[{}\\\\]", " ");
            } else if (fileName != null && (fileName.toLowerCase().endsWith(".html") || fileName.toLowerCase().endsWith(".htm"))) {
                text = text.replaceAll("<[^>]+>", " ");
            }
            return text.replaceAll("\\s+", " ").trim();
        } catch (Exception e) {
            return new String(bytes, StandardCharsets.ISO_8859_1).trim();
        }
    }
}
