// src/pages/DocumentPage.tsx
import { useParams } from 'react-router-dom';
import { mockDocuments } from '../data/documents';
import DocumentViewer from '../components/DocumentViewer';
import type { Document } from '../types/Document';

const DocumentPage = () => {
  const { docId } = useParams<{ docId: string }>();

  const document: Document | undefined = mockDocuments.find(doc => doc.id === docId);

  if (!document) {
    return <div className="p-8 text-center text-red-600">Document not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <DocumentViewer document={document} onClose={() => {}} />
    </div>
  );
};

export default DocumentPage;
