export interface Document {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'DOC' | 'TXT';
  size: string;
  category: string;
  tags: string[];
  lastModified: string;
  filename: string;
  pdfPath: string; 
}