import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

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
  error?: boolean;
};

const RagChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const queryRAG = async (question: string): Promise<RagResponse> => {
    try {
      const response = await fetch("http://127.0.0.1:8000/rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return {
        answer: data.answer,
        source: data.source,
        hallucinated: data.hallucinated,
      };
    } catch (error) {
      console.error("Error querying RAG:", error);
      throw new Error(
        `Failed to query RAG: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

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
    <div className="flex flex-col max-h-[calc(100vh-100px)] h-full">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 px-2 pb-24 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">💬</div>
            <p className="text-gray-500 dark:text-gray-400">
              Ask me anything about the saved pages!
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex transition-all duration-300 ease-in-out ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
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
              <div className="prose dark:prose-invert max-w-none text-sm text-left">
                <ReactMarkdown
                  components={{
                    ul: ({ children }) => (
                      <ul className="list-none space-y-1">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start">{children}</li>
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>

              {msg.hallucinated && !msg.error && (
                <div className="mt-2 inline-flex items-center text-xs font-medium text-amber-800 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-200 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  ⚠️ This answer is a fallback and may not be accurate.
                </div>
              )}

              {msg.source && !msg.error && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 opacity-70">
                  Source: {msg.source.replace(/_/g, " ")}
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
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RagChat;
