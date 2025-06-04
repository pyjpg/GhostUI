import type { Document } from '../types/Document';

const PDF_FILES = [
  { filename: 'GOVUK_2010.pdf', id: 'govuk-guide', title: '2010 Legislations' },
  { filename: 'ElecSafeP.pdf', id: 'ElecSafeP', title: 'Electirical safety' }, 
  { filename: 'ADF1.pdf', id: 'ADF1', title: 'Access to buildings rules' },
];

export const documents: Document[] = PDF_FILES.map((file) => ({
  id: file.id,
  title: file.title,
  description: `PDF Document: ${file.filename}`,
  type: 'PDF' as const,
  size: '1.2 MB', 
  category: 'Test',
  tags: ['test', 'pdf'],
  lastModified: '2024-03-15',
  filename: file.filename,
  pdfPath: `/data/${file.filename}` 
}));