import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const base =
  (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, "");
const api = axios.create({
  baseURL: `${base}/api`,
  withCredentials: false,
});

const AIAssistant = ({ userId, productId, onAddToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const scrollRef = useRef();

  // Store memory of all AI conversation to give full context
  const [aiMemory, setAiMemory] = useState([]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = userInput.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setUserInput("");
    setErr("");
    setLoading(true);

    try {
      // Send all memory to backend so AI knows context
      const res = await api.post("/ai/ask", {
        messages: aiMemory.concat({ role: "user", content: text }),
        userId,
        productId
      });

      const aiMessage = res?.data?.message || "Sorry, no response.";
      const suggestedProducts = res?.data?.suggestedProducts || [];

      // Save AI memory for context
      setAiMemory(prev => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: aiMessage, suggestedProducts },
      ]);

      // Add AI response to messages
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: aiMessage, suggestedProducts },
      ]);
    } catch (e) {
      const status = e?.response?.status;
      const detail =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Unknown error";
      setErr(`AI error${status ? ` (${status})` : ""}: ${detail}`);
      console.error("AI error", e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, i) => (
    <div
      key={i}
      className={`${msg.role === "user" ? "text-right" : "text-left"}`}
    >
      <strong>{msg.role === "user" ? "You" : "EyiiDola"}:</strong>
      <div className="mt-1">
        <div>{msg.content}</div>

        {/* Suggested product cards */}
        {msg.suggestedProducts?.length > 0 && (
          <div className="mt-2 grid grid-cols-1 gap-2">
            {msg.suggestedProducts.map(p => (
              <div
                key={p.id}
                className="cursor-pointer border rounded-lg p-2 hover:shadow-lg hover:bg-gray-50 transition flex justify-between items-center"
              >
                <div onClick={() => navigate(`/product/${p.id}`)} className="flex-1">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-12 h-12 object-cover rounded mr-2 inline-block align-middle"
                    />
                  )}
                  <span className="text-sm font-medium">{p.title}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-600">${p.price}</span>
                  {onAddToCart && (
                    <button
                      onClick={() => onAddToCart(p)}
                      className="mt-1 px-2 py-1 text-xs bg-primary text-white rounded hover:opacity-90"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

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
          <div
            ref={scrollRef}
            className="max-h-64 overflow-y-auto mb-3 space-y-2 text-sm pr-1"
          >
            {messages.map(renderMessage)}
          </div>

          <input
            className="border p-2 rounded mb-2 w-full text-sm"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask me about products..."
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
        </div>
      )}
    </>
  );
};

export default AIAssistant;
