import "../pdfjsWorker"; 
import React, { useEffect, useState, useRef } from "react";

import * as pdfjsLib from 'pdfjs-dist';


type ScrapedMemory = {
  title: string;
  bodyText: string;
  links: string[];
  url: string;
  timestamp: number;
  type: 'webpage' | 'pdf';
  pageCount?: number;
};

const extractPDFText = async (file: File): Promise<{ text: string; pageCount: number }> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => ('str' in item ? item.str : '')).join(' ');
    fullText += strings + '\n';
  }

  console.log('Extracted PDF Text:', fullText);
  return { text: fullText, pageCount: pdf.numPages };
};
const extractTextFromPDF = async (pdfData: Uint8Array): Promise<string> => {
  console.log("Extracting text from PDF data...");
  const pdfString = Array.from(pdfData).map(byte => String.fromCharCode(byte)).join('');

  const textMatches = pdfString.match(/\(([^)]+)\)/g) || [];
  const streamMatches = pdfString.match(/stream\s*(.*?)\s*endstream/gs) || [];

  console.log(`Found ${textMatches.length} simple text matches and ${streamMatches.length} stream blocks.`);

  let extractedText = '';

  textMatches.forEach(match => {
    const text = match.substring(1, match.length - 1);
    if (text.length > 2 && /[a-zA-Z]/.test(text)) {
      extractedText += text + ' ';
    }
  });

  streamMatches.forEach(match => {
    const streamContent = match.replace(/^stream\s*/, '').replace(/\s*endstream$/, '');
    const readableText = streamContent.match(/[A-Za-z\s]{3,}/g) || [];
    extractedText += readableText.join(' ') + ' ';
  });

  console.log("Final extracted text (first 200 chars):", extractedText.slice(0, 200));
  return extractedText.trim().slice(0, 2000);
};

const countPDFPages = (pdfData: Uint8Array): number => {
  console.log("Counting pages in PDF...");
  const pdfString = Array.from(pdfData).map(byte => String.fromCharCode(byte)).join('');
  const pageMatches = pdfString.match(/\/Type\s*\/Page[^s]/g);
  console.log("Page matches found:", pageMatches);
  return pageMatches ? pageMatches.length : 1;
};

const scrapePage = (): ScrapedMemory => ({
  title: document.title || "Untitled Page",
  bodyText: document.body.innerText.slice(0, 1000),
  links: Array.from(document.links).map((link) => link.href),
  url: window.location.href,
  timestamp: Date.now(),
  type: 'webpage'
});

const saveMemoryToAPI = async (
  memoryData: ScrapedMemory
): Promise<{ status: string; message: string }> => {
  // Simulate API call for demo
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { status: "success", message: "Memory saved successfully!" };
};

const MemorySaver: React.FC = () => {
  const [scrapedPreview, setScrapedPreview] = useState<ScrapedMemory | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [savedItems, setSavedItems] = useState<ScrapedMemory[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  const scraped = scrapePage();
  console.log("Scraped current webpage:", scraped);
  setScrapedPreview(scraped);
}, []);


  const handleSave = async () => {
  if (!scrapedPreview) return;
  console.log("Attempting to save memory:", scrapedPreview);
  setSaveStatus("saving");

  try {
    const res = await saveMemoryToAPI(scrapedPreview);
    console.log("Save result:", res);

    const success = res.status === "success";
    setSaveStatus(success ? "success" : "error");
    setSaveMessage(res.message);

    if (success) {
      setSavedItems((prev) => {
        const alreadyExists = prev.some(
          (item) => item.url === scrapedPreview.url && item.timestamp === scrapedPreview.timestamp
        );
        console.log("Already saved?", alreadyExists);
        return alreadyExists ? prev : [scrapedPreview, ...prev];
      });
    }
  } catch (err: any) {
    console.error("Error saving memory:", err);
    setSaveStatus("error");
    setSaveMessage(err.message);
  } finally {
    setTimeout(() => setSaveStatus("idle"), 3000);
  }
};

const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  console.log('[Upload Triggered]', file);
  if (!file || file.type !== 'application/pdf') {
    alert('Please select a PDF file');
    return;
  }

  setSaveStatus("saving");
  setSaveMessage("Extracting text from PDF...");
  try {
    const { text, pageCount } = await extractPDFText(file);
    console.log('[Extracted]', { textSnippet: text.slice(0, 300), pageCount });

    const pdfMemory: ScrapedMemory = {
      title: file.name.replace('.pdf', ''),
      bodyText: text || "Could not extract readable text from this PDF",
      links: [],
      url: `file://${file.name}`,
      timestamp: Date.now(),
      type: 'pdf',
      pageCount
    };

    setScrapedPreview(pdfMemory);
    setSaveStatus("success");
    setSaveMessage(`Extracted text from ${pageCount} page(s)`);

    setTimeout(async () => {
      const res = await saveMemoryToAPI(pdfMemory);
      console.log('[Save result]', res);
      if (res.status === "success") {
        setSavedItems((prev) => [pdfMemory, ...prev]);
      }
    }, 500);

  } catch (error) {
    console.error('[PDF Extraction Error]', error);
    setSaveStatus("error");
    setSaveMessage("Failed to extract text from PDF");
  }

  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};
return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Memory Saver
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Save web pages and extract text from PDFs
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            saveStatus === "saving"
              ? "bg-gray-400 text-white"
              : saveStatus === "success"
              ? "bg-green-500 text-white"
              : saveStatus === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
          }`}
        >
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "success"
            ? "Saved!"
            : saveStatus === "error"
            ? "Error"
            : "📄 Save Current Page"}
        </button>

        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handlePDFUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button className="w-full px-6 py-3 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg transition-all">
            📋 Upload PDF
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${
          saveStatus === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : saveStatus === "error"
            ? "bg-red-50 text-red-800 border border-red-200"
            : "bg-blue-50 text-blue-800 border border-blue-200"
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Preview */}
      {scrapedPreview && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Preview: {scrapedPreview.title}
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {scrapedPreview.type === 'pdf' ? '📋 PDF Document' : '🌐 Web Page'}
            {scrapedPreview.pageCount && ` • ${scrapedPreview.pageCount} pages`}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {scrapedPreview.bodyText}
          </p>
        </div>
      )}

      {/* Saved Items List */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Saved Memories ({savedItems.length})
        </h2>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {savedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">🧠</div>
              <p className="text-gray-500 dark:text-gray-400">No saved memories yet.</p>
              <p className="text-sm text-gray-400 mt-2">Save a webpage or upload a PDF to get started!</p>
            </div>
          ) : (
            savedItems.map((item, index) => {
              const isExpanded = index === expandedIndex;
              return (
                <div
                  key={`${item.url}-${item.timestamp}`}
                  className={`rounded-xl transition-all cursor-pointer border-2 ${
                    isExpanded
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                      : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl flex-shrink-0">
                        {item.type === 'pdf' ? '📋' : '🧠'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(item.timestamp).toLocaleString()}
                          {item.type === 'pdf' && item.pageCount && ` • ${item.pageCount} pages`}
                        </div>
                        {!isExpanded && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                            {item.bodyText}
                          </div>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Content:</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {item.bodyText}
                          </p>
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <strong>Source:</strong> {item.url}
                        </div>

                        {item.links.length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <strong>Links found ({item.links.length}):</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {item.links.slice(0, 5).map((link, i) => (
                                <li key={i} className="truncate">
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {link}
                                  </a>
                                </li>
                              ))}
                              {item.links.length > 5 && (
                                <li className="italic text-gray-400">
                                  +{item.links.length - 5} more links
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MemorySaver;