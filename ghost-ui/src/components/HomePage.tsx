import { FC } from 'react';
import DocumentCard from './DocumentCard';
import { Document } from '../types/Document';
import { mockDocuments } from '../data/documents';

interface Props {
  onViewDocument: (doc: Document) => void;
}

const HomePage: FC<Props> = ({ onViewDocument }) => (
  <div>
    {/* homepage layout and map over mockDocuments */}
  </div>
);

export default HomePage;
