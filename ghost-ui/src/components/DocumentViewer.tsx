import { FC, useEffect, useState } from 'react';
import type { Document } from '../types/Document';
import { Bookmark } from 'lucide-react';

interface Props {
  document: Document;
  onClose?: () => void;
}

interface Section {
  title: string;
  content: string;
}

interface Content {
  title: string;
  sections: Section[];
}

const DocumentViewer: FC<Props> = ({ document, onClose }) => {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mock: Content = generateMockContent(document);
      setContent(mock);
      setLoading(false);
    }, 1000 + Math.random() * 1000);
  }, [document]);

  const generateMockContent = (doc: Document): Content => {
    switch (doc.id) {
      case 'govuk-guide':
        return {
          title: 'Digital Identity and Attributes Trust Framework',
          sections: [
            {
              title: 'Executive Summary',
              content:
                'The UK Digital Identity and Attributes Trust Framework (DIATF) sets out the rules for organisations that want to provide or use digital identity services...'
            },
            {
              title: 'Key Principles',
              content:
                'User control, Privacy by design, Minimisation, Transparency, Interoperability...'
            }
          ]
        };
      case 'research-paper':
        return {
          title: 'Advances in Neural Network Architectures for NLP',
          sections: [
            {
              title: 'Abstract',
              content:
                'Recent developments in transformer architectures have revolutionized natural language processing tasks...'
            },
            {
              title: 'Introduction',
              content:
                'The field of natural language processing has undergone rapid transformation...'
            }
          ]
        };
      default:
        return {
          title: doc.title,
          sections: [
            {
              title: 'Overview',
              content: 'This document contains important information relevant to the topic...'
            }
          ]
        };
    }
  };

  if (loading || !content) {
    return <div className="p-4 text-center">Loading document content...</div>;
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{content.title}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
            aria-label="Close document"
          >
            ✕
          </button>
        )}
      </header>

      {content.sections.map((section) => (
        <section key={section.title} className="mb-4">
          <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-300 mb-2">{section.title}</h3>
          <p className="text-zinc-700 dark:text-zinc-400">{section.content}</p>
        </section>
      ))}
    </div>
  );
};

export default DocumentViewer;
