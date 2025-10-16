import { ObjectStorageService } from '../objectStorage';
import mammoth from 'mammoth';

/**
 * Service for extracting text content from uploaded files in object storage.
 * Supports PDF, DOCX, and plain text files.
 */
export class FileExtractorService {
  private objectStorageService: ObjectStorageService;

  constructor() {
    this.objectStorageService = new ObjectStorageService();
  }

  /**
   * Fetches a file from object storage and returns it as a buffer.
   */
  private async fetchFileBuffer(fileUrl: string): Promise<Buffer> {
    try {
      // Convert the fileUrl to an object path
      const objectPath = fileUrl.startsWith('/objects/') 
        ? fileUrl 
        : this.objectStorageService.normalizeObjectEntityPath(fileUrl);

      if (!objectPath.startsWith('/objects/')) {
        throw new Error(`Invalid file URL: ${fileUrl}`);
      }

      // Get the file from object storage
      const objectFile = await this.objectStorageService.getObjectEntityFile(objectPath);

      // Create a readable stream and convert to buffer
      const stream = objectFile.createReadStream();
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      console.error('Error fetching file from storage:', error);
      throw new Error(`Failed to fetch file: ${fileUrl}`);
    }
  }

  /**
   * Determines file type from URL or content type.
   */
  private getFileType(fileUrl: string): string {
    const url = fileUrl.toLowerCase();
    if (url.includes('.pdf')) return 'pdf';
    if (url.includes('.docx') || url.includes('.doc')) return 'docx';
    if (url.includes('.txt')) return 'txt';
    return 'unknown';
  }

  /**
   * Extracts text from a PDF file buffer.
   */
  private async extractPdfText(buffer: Buffer): Promise<string> {
    let parser: any = null;
    try {
      // Use dynamic import to load pdf-parse
      const { PDFParse } = await import('pdf-parse');
      parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text.trim();
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to extract text from PDF');
    } finally {
      if (parser) {
        try {
          await parser.destroy();
        } catch (destroyError) {
          console.error('Error destroying PDF parser:', destroyError);
        }
      }
    }
  }

  /**
   * Extracts text from a DOCX file buffer.
   */
  private async extractDocxText(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    } catch (error) {
      console.error('Error extracting DOCX text:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  }

  /**
   * Extracts text from a plain text file buffer.
   */
  private extractPlainText(buffer: Buffer): string {
    return buffer.toString('utf-8').trim();
  }

  /**
   * Main method: Fetches a file from object storage and extracts its text content.
   * Returns the extracted text or an error message if extraction fails.
   */
  async extractTextFromFile(fileUrl: string): Promise<string> {
    if (!fileUrl) {
      return '';
    }

    try {
      const fileType = this.getFileType(fileUrl);
      const buffer = await this.fetchFileBuffer(fileUrl);

      switch (fileType) {
        case 'pdf':
          return await this.extractPdfText(buffer);
        
        case 'docx':
          return await this.extractDocxText(buffer);
        
        case 'txt':
          return this.extractPlainText(buffer);
        
        default:
          // Try plain text as fallback
          try {
            return this.extractPlainText(buffer);
          } catch {
            return `[File attached: ${fileUrl} - unable to extract text content]`;
          }
      }
    } catch (error) {
      console.error(`Error extracting text from file ${fileUrl}:`, error);
      return `[File attached: ${fileUrl} - extraction failed]`;
    }
  }

  /**
   * Extracts text from multiple files in parallel.
   */
  async extractTextFromFiles(fileUrls: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    await Promise.all(
      fileUrls.map(async (url) => {
        results[url] = await this.extractTextFromFile(url);
      })
    );

    return results;
  }
}
