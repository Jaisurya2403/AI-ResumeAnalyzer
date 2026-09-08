import * as pdfjsLib from 'pdfjs-dist';

// Set up worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export const pdfParser = {
  async extractTextFromPDF(file) {
    if (!file) throw new Error("No file provided");

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
  }
};
