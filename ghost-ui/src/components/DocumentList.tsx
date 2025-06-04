import { Link } from 'react-router-dom';
import { documents } from '../data/documents';

const DocumentList = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Available Documents</h2>
      <div className="grid gap-4">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            to={`/docs/${doc.id}`}
            className="block p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-medium text-blue-600">{doc.title}</h3>
            <p className="text-gray-600 text-sm">{doc.description}</p>
            <p className="text-gray-500 text-xs">Size: {doc.size}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;