import React, { useEffect, useState } from "react";

type ScrapedMemory = {
  title: string;
  bodyText: string;
  links: string[];
  url: string;
  timestamp: number;
};

const scrapePage = (): ScrapedMemory => ({
  title: document.title || "Untitled Page",
  bodyText: document.body.innerText.slice(0, 1000),
  links: Array.from(document.links).map((link) => link.href),
  url: window.location.href,
  timestamp: Date.now(),
});

const saveMemoryToAPI = async (
  memoryData: ScrapedMemory
): Promise<{ status: string; message: string }> => {
  const response = await fetch("http://127.0.0.1:8000/memory/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(memoryData),
  });

  if (!response.ok) {
    throw new Error(`Failed to save memory: ${response.status}`);
  }

  return await response.json();
};

const MemorySaver: React.FC = () => {
  const [scrapedPreview, setScrapedPreview] = useState<ScrapedMemory | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  useEffect(() => {
    const scraped = scrapePage();
    setScrapedPreview(scraped);
  }, []);

 const handleSave = async () => {
  if (!scrapedPreview) return;
  setSaveStatus("saving");
  try {
    const res = await saveMemoryToAPI(scrapedPreview);
    const success = res.status === "success";
    setSaveStatus(success ? "success" : "error");
    setSaveMessage(res.message);

    if (success) {
      setSavedItems((prev) => {
        const newTitle = `🧠 ${scrapedPreview.title}`;
        // Check if the title is already saved
        if (prev.includes(newTitle)) {
          return prev; // no duplicates, return unchanged
        }
        return [newTitle, ...prev]; // add new item at the front
      });
    }
  } catch (err: any) {
    setSaveStatus("error");
    setSaveMessage(err.message);
  } finally {
    setTimeout(() => setSaveStatus("idle"), 3000);
  }
};
 

  return (
    <div className="space-y-6">
      {/* Preview */}
      {scrapedPreview && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
          <h3 className="font-semibold text-lg">{scrapedPreview.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {scrapedPreview.bodyText}
          </p>
          <div className="text-xs text-gray-500 mt-1">
            {new URL(scrapedPreview.url).hostname} • {scrapedPreview.links.length} links
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saveStatus === "saving"}
        className={`w-full px-4 py-2 rounded-md font-medium transition ${
          saveStatus === "saving"
            ? "bg-gray-400 text-white"
            : saveStatus === "success"
            ? "bg-green-500 text-white"
            : saveStatus === "error"
            ? "bg-red-500 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {saveStatus === "saving"
          ? "Saving..."
          : saveStatus === "success"
          ? "Saved!"
          : saveStatus === "error"
          ? "Error"
          : "Save This Page"}
      </button>
      {saveMessage && <p className="text-xs text-gray-500">{saveMessage}</p>}

      {/* Saved Items List */}
      <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {savedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-2xl mb-2">🧠</div>
            <p className="text-gray-500 dark:text-gray-400">No saved memories yet.</p>
          </div>
        ) : (
          savedItems.map((item, index) => (
            <button
              key={index}
              className={`w-full text-left px-4 py-3 rounded-xl cursor-pointer transition-all ${
                index === highlightedIndex
                  ? "bg-blue-50/50 dark:bg-blue-900/15 backdrop-blur-sm border-2 border-blue-200/40 dark:border-blue-700/40"
                  : "bg-gray-50/30 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-gray-100/40 dark:hover:bg-gray-700/30 border-2 border-transparent"
              }`}
              onClick={() => setHighlightedIndex(index)}
            >
              <div className="flex items-center space-x-3">
                <div className="text-lg">🧠</div>
                <div className="flex-1">
                  <div className="text-gray-900 dark:text-gray-100 font-medium">
                    {item.replace(/^🧠\s/, "")}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Saved recently
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default MemorySaver;
