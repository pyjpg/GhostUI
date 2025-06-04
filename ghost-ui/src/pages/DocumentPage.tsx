// src/pages/DocumentPage.tsx - Simple fallback version
import { useParams } from 'react-router-dom';
import { documents } from '../data/documents';
import type { Document } from '../types/Document';

const DocumentPage = () => {
  const { docId } = useParams<{ docId: string }>();
  const document: Document | undefined = documents.find(doc => doc.id === docId);

  if (!document) {
    return <div className="p-8 text-center text-red-600">Document not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">{document.title}</h1>
      
      {/* Simple PDF embed that works without external workers */}
      <div className="w-full h-[800px] border border-gray-300 rounded-lg overflow-hidden bg-white">
        <iframe
          src={`${document.pdfPath}#view=FitH`}
          width="100%"
          height="100%"
          title={document.title}
          className="w-full h-full"
        />
      </div>
      
      {/* Fallback download link */}
      <div className="mt-4 text-center">
        <a 
          href={document.pdfPath} 
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Open PDF in new tab
        </a>
      </div>
    </div>
  );
};

export default DocumentPage;