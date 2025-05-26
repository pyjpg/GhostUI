import React, { useState } from "react";

type RagResponse = {
  answer: string;
  source: string;
  hallucinated: boolean;
  error?: string;
};

type Message = {
  sender: "user" | "bot";
  text: string;
  hallucinated?: boolean;
  source?: string;
};

const RagChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Sorry, something went wrong.",
            hallucinated: true,
            source: "llm_fallback",
          },
        ]);
      } else {
        const data: RagResponse = await response.json();

        // Log full response object
        console.log("RAG response data:", data);

        const answerText = data.answer;

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: answerText,
            hallucinated: data.hallucinated,
            source: data.source,
          },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Network error: ${error.message}` },
      ]);
    }

    setLoading(false);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900">
      <div className="mb-4 space-y-3 px-2">
        {messages.length === 0 && (
          <p className="text-zinc-500 text-center py-8">Ask me anything about the page!</p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              }`}
            >
              <div>{msg.text}</div>

              {/* Show hallucination warning */}
              {msg.hallucinated && (
                <div className="mt-2 text-xs text-yellow-800 bg-yellow-100 dark:bg-yellow-700 dark:text-yellow-200 p-1 rounded">
                  ⚠️ This answer is a fallback and may not be accurate.
                </div>
              )}

              {/* Show source info */}
              {msg.source && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Source: {msg.source}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question and press Enter"
          className="w-full border border-gray-300 dark:border-zinc-700 rounded-md p-2 resize-none dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className={`mt-2 w-full py-2 rounded-md text-white ${
            loading || !input.trim()
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default RagChat;