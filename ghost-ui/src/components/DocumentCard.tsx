import { FC } from 'react';
import { FileText, Eye, Download } from 'lucide-react';
import { Document } from '../types/Document';

interface Props {
  document: Document;
  onView: (doc: Document) => void;
}

const DocumentCard = ({ document, onView }) => (
  <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
            {document.title}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            {document.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-3">
            {document.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <FileText className="w-8 h-8 text-zinc-400 ml-4" />
      </div>
      
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        <span>{document.type} • {document.size}</span>
        <span>{document.category}</span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onView(document)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

export default DocumentCard;
