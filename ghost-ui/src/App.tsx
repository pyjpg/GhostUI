import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CommandPalette from './components/CommandPalette';
import MemorySaver from './components/MemorySaver';
import DocumentPage from './pages/DocumentPage';
import { PDFViewer } from '@react-pdf/renderer';
import PDFDoc from './components/pdf';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors">
      <CommandPalette />
      <MemorySaver />
      <Navbar title="Memory Testing Platform" />

      <main>
        <Routes>
          <Route path="/docs/:docId" element={<DocumentPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
