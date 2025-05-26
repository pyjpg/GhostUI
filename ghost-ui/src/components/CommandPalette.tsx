import React, { useState, useEffect, useRef } from "react";

type ScrapedMemory = {
  title: string;
  bodyText: string;
  links: string[];
  url: string;
  timestamp: number;
};

type Message = {
  sender: "user" | "bot";
  text: string;
  hallucinated?: boolean;
  source?: string;
  error?: boolean;
};

type RagResponse = {
  answer: string;
  source: string;
  hallucinated: boolean;
  error?: string;
};

// Mock scrape function for demo - in real app this would scrape the actual page
const scrapePage = () => ({
  title: "Current Page Demo",
  bodyText: "This is a demo of scraped content from the current page. In a real implementation, this would contain the actual page content extracted from the DOM. This could include article content, documentation text, or any other textual information available on the page.",
  links: ["https://example.com", "https://docs.example.com", "https://help.example.com"],
  url: window.location.href || "https://current-page.com/demo",
  timestamp: Date.now()
});

// Real API functions
const saveMemoryToAPI = async (memoryData: ScrapedMemory): Promise<{ status: string; message: string }> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/memory/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memoryData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving memory:', error);
    throw new Error(`Failed to save memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const queryRAG = async (question: string): Promise<RagResponse> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/rag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle case where API returns an error field
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      answer: data.answer,
      source: data.source,
      hallucinated: data.hallucinated,
    };
  } catch (error) {
    console.error('Error querying RAG:', error);
    throw new Error(`Failed to query RAG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const RagChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setLoading(true);
    setInput("");

    try {
      const data = await queryRAG(userMessage);
      
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.answer,
          hallucinated: data.hallucinated,
          source: data.source,
          error: false,
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { 
          sender: "bot", 
          text: `Error: ${error.message}`,
          error: true,
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 px-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">💬</div>
            <p className="text-gray-500 dark:text-gray-400">Ask me anything about the saved pages!</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-md"
                  : msg.error
                  ? "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 rounded-bl-md border border-red-200 dark:border-red-800"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {msg.hallucinated && !msg.error && (
                <div className="mt-2 text-xs text-amber-800 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-200 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                  ⚠️ This answer is a fallback and may not be accurate.
                </div>
              )}

              {msg.source && !msg.error && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 opacity-70">
                  Source: {msg.source.replace(/_/g, ' ')}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="relative">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question and press Enter"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 pr-12 resize-none bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`absolute right-2 top-2 p-2 rounded-lg transition-all ${
              loading || !input.trim()
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(2);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [scrapedPreview, setScrapedPreview] = useState<ScrapedMemory | null>(null);
  const [savedMemories, setSavedMemories] = useState<ScrapedMemory[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const tabs = ["Memory", "Ask", "Chat"];
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const askItems = [
    "Ask AI: How do I center a div?",
    "Search documentation", 
    "Search Stack Overflow",
    "Find React best practices",
    "Explain this code pattern"
  ];

  const memoryItems = savedMemories.map((mem) => 
    `🧠 ${mem.title} (${new URL(mem.url).hostname})`
  );
  
  const items = activeTab === 0 ? memoryItems : askItems;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        if (!isOpen) {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }
      
      if (e.key === "Escape") {
        setIsOpen(false);
      }
      
      if (!isOpen) return;

      // Tab switching with numbers 1-3
      if (e.key >= "1" && e.key <= "3") {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        setActiveTab(tabIndex);
        setHighlightedIndex(0);
      }

      // Movement with Ctrl+Arrow keys
      if (e.ctrlKey) {
        const step = 20;
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            setPosition(prev => ({ ...prev, x: prev.x - step }));
            break;
          case 'ArrowRight':
            e.preventDefault();
            setPosition(prev => ({ ...prev, x: prev.x + step }));
            break;
          case 'ArrowUp':
            e.preventDefault();
            setPosition(prev => ({ ...prev, y: prev.y - step }));
            break;
          case 'ArrowDown':
            e.preventDefault();
            setPosition(prev => ({ ...prev, y: prev.y + step }));
            break;
          case 'r':
            e.preventDefault();
            setPosition({ x: 0, y: 0 });
            break;
        }
      }

      // Tab navigation (only when not in Chat tab)
      if (activeTab !== 2) {
        if (e.key === "ArrowDown" && items.length > 0) {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % items.length);
        }
        if (e.key === "ArrowUp" && items.length > 0) {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + items.length) % items.length);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items.length, activeTab]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Scrape current page when Memory tab opens
  useEffect(() => {
    if (isOpen && activeTab === 0) {
      const scraped = scrapePage();
      setScrapedPreview(scraped);
    }
  }, [isOpen, activeTab]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && activeTab !== 2) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, activeTab]);

  const handleSaveMemory = async () => {
    if (!scrapedPreview) return;

    // Check if already saved
    if (savedMemories.some((mem) => mem.url === scrapedPreview.url)) {
      setSaveStatus('error');
      setSaveMessage('This page is already saved in memory');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setSaveStatus('saving');
    setSaveMessage('');

    try {
      const result = await saveMemoryToAPI(scrapedPreview);
      
      if (result.status === 'success') {
        setSavedMemories((prev) => [...prev, scrapedPreview]);
        setSaveStatus('success');
        setSaveMessage(result.message);
        console.log("✅ Saved new memory:", scrapedPreview.title);
      } else {
        throw new Error(result.message || 'Unknown error occurred');
      }
    } catch (error: any) {
      setSaveStatus('error');
      setSaveMessage(error.message);
      console.error("❌ Failed to save memory:", error);
    }

    // Reset status after 3 seconds
    setTimeout(() => {
      setSaveStatus('idle');
      setSaveMessage('');
    }, 3000);
  };

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setHighlightedIndex(0);
    setQuery("");
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  // Show trigger hint and shortcuts when closed
  if (!isOpen) {
    return (
      <>
        {/* Detached shortcuts at top */}
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/10">
            <div className="flex items-center space-x-4">
              <span>Press <kbd className="bg-white/20 px-2 py-1 rounded text-xs">⌘K</kbd> to open</span>
              <span className="text-gray-400">•</span>
              <span><kbd className="bg-white/20 px-1 py-0.5 rounded text-xs">1-3</kbd> tabs</span>
              <span><kbd className="bg-white/20 px-1 py-0.5 rounded text-xs">Ctrl+↑↓←→</kbd> move</span>
            </div>
          </div>
        </div>
        
        {/* Trigger hint at bottom */}
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
            Command Palette Available
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Detached shortcuts at top - always visible when open */}
      <div className="fixed top-4 left-4 z-60">
        <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/20">
          <div className="flex items-center space-x-4">
            <span><kbd className="bg-white/20 px-1 py-0.5 rounded text-xs">1-3</kbd> tabs</span>
            <span><kbd className="bg-white/20 px-1 py-0.5 rounded text-xs">↑↓</kbd> navigate</span>
            <span><kbd className="bg-white/20 px-1 py-0.5 rounded text-xs">Ctrl+↑↓←→</kbd> move</span>
            <span><kbd className="bg-white/20 px-1 py-0.5 rounded text-xs">Ctrl+R</kbd> reset position</span>
            <span><kbd className="bg-white/20 px-1 py-0.5 rounded text-xs">Esc</kbd> close</span>
          </div>
        </div>
      </div>

      <div 
        className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[1px] flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div 
          ref={paletteRef}
          className={`w-full max-w-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/30 dark:border-gray-700/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Header with tabs and drag handle */}
          <div className="flex items-center justify-between border-b border-gray-200/30 dark:border-gray-700/30 bg-gray-50/20 dark:bg-gray-800/20 backdrop-blur-sm px-4 py-3 drag-handle">
            <div className="flex items-center space-x-3">
              {/* Drag handle icon */}
              <div className="text-gray-400 cursor-grab">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1">
                {tabs.map((tab, index) => (
                  <button
                    key={tab}
                    onClick={() => handleTabClick(index)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      index === activeTab
                        ? "bg-white/60 dark:bg-gray-700/60 text-gray-900 dark:text-white shadow-sm backdrop-blur-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-gray-700/20"
                    }`}
                  >
                    {tab}
                    <span className="ml-2 text-xs text-gray-400">{index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/20 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 2 ? (
              <RagChat />
            ) : (
              <>
                {/* Search Input */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    disabled={activeTab === 0}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      activeTab === 0
                        ? "Viewing memory from this page..."
                        : "Ask a question or search..."
                    }
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border backdrop-blur-sm transition-all ${
                      activeTab === 0
                        ? "bg-gray-100/40 dark:bg-gray-800/40 border-gray-200/30 dark:border-gray-700/30 text-gray-500 cursor-not-allowed"
                        : "bg-white/40 dark:bg-gray-800/40 border-gray-300/30 dark:border-gray-600/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                    }`}
                  />
                </div>

                {/* Memory Tab - Save Button and Preview */}
                {activeTab === 0 && (
                  <div className="mb-6 space-y-4">
                    {/* Page Preview */}
                    {scrapedPreview && (
                      <div className="bg-gray-50/30 dark:bg-gray-800/20 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-blue-100/60 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {scrapedPreview.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                              {scrapedPreview.bodyText}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-500">
                              <span className="truncate">{new URL(scrapedPreview.url).hostname}</span>
                              <span className="mx-2">•</span>
                              <span>{scrapedPreview.links.length} links found</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={handleSaveMemory}
                      disabled={saveStatus === 'saving'}
                      className={`w-full px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-center space-x-2 border ${
                        saveStatus === 'saving'
                          ? "bg-gray-400/60 text-white cursor-not-allowed border-gray-300/20"
                          : saveStatus === 'success'
                          ? "bg-green-500/70 text-white border-green-400/20"
                          : saveStatus === 'error'
                          ? "bg-red-500/70 text-white border-red-400/20"
                          : "bg-blue-500/70 backdrop-blur-sm text-white hover:bg-blue-600/70 border-blue-400/20"
                      }`}
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : saveStatus === 'success' ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Saved Successfully!</span>
                        </>
                      ) : saveStatus === 'error' ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Error Saving</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                          </svg>
                          <span>Save This Page to Memory</span>
                        </>
                      )}
                    </button>

                    {/* Save Status Message */}
                    {saveMessage && (
                      <div className={`text-sm p-3 rounded-lg ${
                        saveStatus === 'success' 
                          ? 'bg-green-100/60 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200/30 dark:border-green-800/30'
                          : 'bg-red-100/60 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200/30 dark:border-red-800/30'
                      }`}>
                        {saveMessage}
                      </div>
                    )}
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-2xl mb-2">
                        {activeTab === 0 ? "🧠" : "🔍"}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">
                        {activeTab === 0 ? "No saved memories yet." : "No items to show."}
                      </p>
                    </div>
                  ) : (
                    items.map((item, index) => (
                      <button
                        key={index}
                        className={`w-full text-left px-4 py-3 rounded-xl cursor-pointer transition-all ${
                          index === highlightedIndex
                            ? "bg-blue-50/50 dark:bg-blue-900/15 backdrop-blur-sm border-2 border-blue-200/40 dark:border-blue-700/40"
                            : "bg-gray-50/30 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-gray-100/40 dark:hover:bg-gray-700/30 border-2 border-transparent"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-lg">
                            {item.startsWith('🧠') ? '🧠' : '🔍'}
                          </div>
                          <div className="flex-1">
                            <div className="text-gray-900 dark:text-gray-100 font-medium">
                              {item.replace(/^🧠\s/, '')}
                            </div>
                            {activeTab === 0 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Saved recently
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CommandPalette;