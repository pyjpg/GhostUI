import type { Document } from '../types/Document';
export const mockDocuments: Document[] = [
 {
    id: 'govuk-guide',
    title: 'Digital Identity and Attributes Trust Framework',
    description: 'Comprehensive guide on digital identity framework and trust standards.',
    type: 'PDF',
    size: '2.3 MB',
    category: 'Government',
    tags: ['digital-identity', 'trust-framework', 'security'],
    lastModified: '2024-03-15'
  },
  {
    id: 'research-paper',
    title: 'Advances in Neural Network Architectures for NLP',
    description: 'Technical research on machine learning and neural network architectures.',
    type: 'PDF',
    size: '1.8 MB',
    category: 'Research',
    tags: ['ai', 'machine-learning', 'nlp'],
    lastModified: '2024-03-10'
  },
  {
    id: 'privacy-policy',
    title: 'Privacy Policy and Data Protection Guidelines',
    description: 'Detailed privacy policy and data protection guidelines.',
    type: 'PDF',
    size: '890 KB',
    category: 'Legal',
    tags: ['privacy', 'gdpr', 'compliance'],
    lastModified: '2024-03-08'
  },
  {
    id: 'api-spec',
    title: 'REST API Technical Specification v2.1',
    description: 'Complete API documentation with endpoints and authentication methods.',
    type: 'PDF',
    size: '1.2 MB',
    category: 'Technical',
    tags: ['api', 'documentation', 'rest'],
    lastModified: '2024-03-12'
  } 
];
