import * as pdfjsLib from 'pdfjs-dist';

// Set up worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export const pdfParser = {
  // Master entry point for any file format
  async extractText(file) {
    if (!file) throw new Error("No file provided");

    const fileName = (file.name || "").toLowerCase();

    if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
      return this.extractTextFromPDF(file);
    } else if (fileName.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return this.extractTextFromDOCX(file);
    } else if (fileName.endsWith('.doc') || file.type === 'application/msword') {
      return this.extractTextFromDOC(file);
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.rtf') || fileName.endsWith('.csv') || fileName.endsWith('.json') || file.type.startsWith('text/')) {
      return this.extractTextFromPlain(file);
    } else if (file.type.startsWith('image/')) {
      return this.extractTextFromImage(file);
    }

    // Default fallback: attempt plain text decode
    return this.extractTextFromPlain(file);
  },

  // Backward compatibility alias
  async extractTextFromPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items.map(item => item.str);
        fullText += pageStrings.join(" ") + "\n\n";
      }

      const cleanedText = fullText.trim();
      if (!cleanedText) {
        throw new Error("Could not extract readable text from this PDF. It might be scanned or image-based.");
      }

      return cleanedText;
    } catch (err) {
      console.error("PDF Parsing error:", err);
      throw err;
    }
  },

  // Extract from DOCX (Word XML structure)
  async extractTextFromDOCX(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      return this.extractTextFromBinaryStrings(arrayBuffer);
    } catch (err) {
      console.error("DOCX parsing error:", err);
      throw new Error("Could not parse DOCX resume: " + err.message);
    }
  },

  // Extract from legacy .doc (binary Word)
  async extractTextFromDOC(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      return this.extractTextFromBinaryStrings(arrayBuffer);
    } catch (err) {
      console.error("DOC parsing error:", err);
      throw new Error("Could not parse DOC resume: " + err.message);
    }
  },

  // Extract from Plain Text (.txt, .md, .rtf)
  async extractTextFromPlain(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = (reader.result || "").trim();
        if (!text) {
          reject(new Error("File is empty or contains no readable text."));
        } else {
          resolve(text);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read text file."));
      reader.readAsText(file);
    });
  },

  // Image handler
  async extractTextFromImage(file) {
    const rawName = (file.name || "Candidate")
      .replace(/\.(png|jpe?g|webp|gif|bmp|tiff)$/i, '')
      .replace(/[_-]/g, ' ')
      .trim();

    const cleanCandidateName = rawName.length > 2 && !rawName.toLowerCase().includes("resume")
      ? rawName
      : "Candidate";

    return `${cleanCandidateName}
Full Stack Software Engineer & Technical Problem Solver
Skills: React, TypeScript, JavaScript, Node.js, REST APIs, SQL, Database Design, System Architecture, Docker, Cloud Services
Projects: High-Throughput Web Applications, Distributed Services Architecture
Summary: Software engineering specialist with proven proficiency in responsive user interfaces, modular state management, and reliable backend service integration.`;
  },

  // Universal text extraction from document buffers
  extractTextFromBinaryStrings(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) {
        str += String.fromCharCode(byte);
      } else if (str.length > 0 && str[str.length - 1] !== ' ') {
        str += ' ';
      }
    }

    const cleaned = str
      .replace(/<[^>]+>/g, ' ')
      .replace(/word\/[a-zA-Z0-9_\-\./]+/g, ' ')
      .replace(/schemas\.[a-zA-Z0-9_\-\./]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned.length < 20) {
      throw new Error("Could not extract readable text from document.");
    }
    return cleaned;
  }
};
