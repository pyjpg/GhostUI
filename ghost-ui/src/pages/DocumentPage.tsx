// src/pages/DocumentPage.tsx
import { useParams } from 'react-router-dom';
import { mockDocuments } from '../data/documents';
import type { Document } from '../types/Document';
import { PDFViewer } from '@react-pdf/renderer';
import PDFDoc from '../components/pdf';

const DocumentPage = () => {
  const { docId } = useParams<{ docId: string }>();

  const document: Document | undefined = mockDocuments.find(doc => doc.id === docId);

  if (!document) {
    return <div className="p-8 text-center text-red-600">Document not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">{document.title}</h1>
      <PDFViewer width="100%" height="800px">
        <PDFDoc document={document} />
      </PDFViewer>
    </div>
  );
};

export default DocumentPage;