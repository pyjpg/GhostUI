import { useEffect, useState } from "react";
import RagChat from "./RagChat";

const tabs = ["Memory", "Ask", "Chat"];

type ScrapedMemory = {
  title: string;
  bodyText: string;
  links: string[];
  url: string;
  timestamp: number;
};

// Mock scrape function for demo
const scrapePage = () => ({
  title: document.title || "Current Page",
  bodyText: document.body.innerText.slice(0, 500) + "...",
  links: Array.from(document.querySelectorAll('a')).map(a => a.href).slice(0, 5),
  url: window.location.href,
  timestamp: Date.now()
});

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true); // Start open for demo
  const [activeTab, setActiveTab] = useState(2); // Start on Chat tab
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [query, setQuery] = useState("");

  const [scrapedPreview, setScrapedPreview] = useState<ScrapedMemory | null>(null);
  const [savedMemories, setSavedMemories] = useState<ScrapedMemory[]>([]);

  const askItems = [
    "Ask AI: How do I center a div?",
    "Search documentation", 
    "Search Stack Overflow",
  ];

  const memoryItems = savedMemories.map((mem) => `🧠 ${mem.title} (${new URL(mem.url).hostname})`);
  const items = activeTab === 0 ? memoryItems : askItems;

  // Handle shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
      if (!isOpen) return;

      if (e.key === "j") {
        setHighlightedIndex((prev) => (prev + 1) % items.length);
      }
      if (e.key === "k") {
        setHighlightedIndex((prev) => (prev - 1 + items.length) % items.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items.length]);

  // Scrape current page when Memory tab opens
  useEffect(() => {
    if (isOpen && activeTab === 0) {
      const scraped = scrapePage();
      setScrapedPreview(scraped);
    }
  }, [isOpen, activeTab]);

  const handleSaveMemory = async () => {
    if (scrapedPreview) {
      // Prevent duplicates locally
      if (!savedMemories.some((mem) => mem.url === scrapedPreview.url)) {
        try {
          const response = await fetch("http://127.0.0.1:8000/memory/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(scrapedPreview),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to save memory:", errorData);
            return;
          }

          const data = await response.json();
          console.log("✅ Saved new memory (backend response):", data);

          // Add to local saved memories only on successful save
          setSavedMemories((prev) => [...prev, scrapedPreview]);
        } catch (err) {
          console.error("❌ Error saving memory:", err);
        }
      } else {
        console.log("⚠️ Memory for this page already saved:", scrapedPreview.url);
      }
    } else {
      console.log("❌ No preview data to save.");
    }
  }; 

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-4">
        {/* Tabs */}
        <div className="flex mb-4 space-x-2">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(index);
                setHighlightedIndex(0);
              }}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                index === activeTab
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Conditional Content Based on Active Tab */}
        {activeTab === 2 ? (
          // Chat Tab - Show RagChat Component
          <div>
            <RagChat />
          </div>
        ) : (
          <>
            {/* Input for Memory and Ask tabs */}
            <input
              autoFocus
              type="text"
              disabled={activeTab === 0}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                activeTab === 0
                  ? "Viewing memory from this page..."
                  : "Ask a question..."
              }
              className={`w-full mb-4 border rounded-md px-4 py-2 focus:outline-none transition ${
                activeTab === 0
                  ? "bg-gray-200 dark:bg-zinc-800 cursor-not-allowed text-zinc-500"
                  : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              } border-gray-300 dark:border-zinc-700`}
            />

            {/* Save Button (Memory only) */}
            {activeTab === 0 && (
              <button
                onClick={handleSaveMemory}
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
              >
                Save This Page to Memory
              </button>
            )}

            {/* Items List for Memory and Ask tabs */}
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {items.length === 0 ? (
                <li className="text-zinc-500 text-center">No items yet.</li>
              ) : (
                items.map((item, index) => (
                  <li
                    key={index}
                    className={`px-4 py-2 rounded-md cursor-pointer transition-all ${
                      index === highlightedIndex
                        ? "bg-zinc-800 text-white"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {item}
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default CommandPalette;