// src/components/AIAssistant.jsx
// FIXED: stop calling api.openai.com from the browser.
// Calls YOUR backend Option-B endpoint: POST {VITE_API_URL}/api/ai/ask

import { useState } from "react";
import axios from "axios";

const base =
  (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, "");
const api = axios.create({
  baseURL: `${base}/api`,
  withCredentials: false,
});

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSend = async () => {
    const text = userInput.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setUserInput("");
    setErr("");
    setLoading(true);

    try {
      // Option B: your backend accepts a single `message` string
      const res = await api.post("/ai/ask", { message: text });
      const reply =
        res?.data?.message?.content ??
        "Sorry, I couldn't generate a response.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      const status = e?.response?.status;
      const detail =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Unknown error";
      setErr(`AI error${status ? ` (${status})` : ""}: ${detail}`);
      console.error("AI error", e?.response?.data || e);
      // Roll back user message if you want:
      // setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center text-lg hover:scale-105 transition-transform"
      >
        💬
      </button>

      {/* Assistant Box */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white shadow-xl rounded-lg border z-50 p-4 flex flex-col">
          <div className="max-h-64 overflow-y-auto mb-3 space-y-2 text-sm pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${msg.role === "user" ? "text-right" : "text-left"}`}
              >
                <strong>{msg.role === "user" ? "You" : "AI"}:</strong>{" "}
                {msg.content}
              </div>
            ))}
          </div>

          <input
            className="border p-2 rounded mb-2 w-full text-sm"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask me anything..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-primary text-white py-2 rounded hover:opacity-90 text-sm disabled:opacity-60"
          >
            {loading ? "Thinking..." : "Send"}
          </button>

          {err && ( 
            <div className="text-red-600 text-xs mt-2 break-words">{err}</div>
          )}

          {/* Debug: confirm we're hitting your server, not OpenAI */}
          <div className="text-[10px] text-gray-500 mt-2">
            {/* API: {api.defaults.baseURL} */}
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
