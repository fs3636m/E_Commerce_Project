import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  sendAIMessage, 
  addMessage, 
  clearConversation, 
  loadConversations 
} from "@/store/ai/aiSlice";

const AIAssistant = ({ userId, productId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  // Get state from Redux
  const { 
    conversations, 
    currentConversationKey, 
    loading, 
    error 
  } = useSelector((state) => state.ai);
  
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  
  // Get current conversation messages
  const messages = conversations[currentConversationKey] || [];

  // Load conversations on component mount
  useEffect(() => {
    dispatch(loadConversations());
  }, [dispatch]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = userInput.trim();
    if (!text || loading) return;

    // Add user message to Redux
    const userMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    
    dispatch(addMessage({ message: userMessage }));

    setUserInput("");

    // Send message to AI via Redux thunk
    dispatch(sendAIMessage({
      message: text,
      messages: [...messages, userMessage],
      userId,
      productId,
    }));
  };

  const handleClearConversation = () => {
    dispatch(clearConversation());
  };

  const formatGBP = (amount) => {
    const num = Number(amount);
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(isNaN(num) ? 0 : num);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (msg, i) => (
    <div
      key={i}
      className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
    >
      <div className={`inline-block p-2 rounded-lg max-w-xs ${
        msg.role === "user" 
          ? "bg-blue-100 text-blue-900" 
          : msg.isError
          ? "bg-red-100 text-red-900"
          : "bg-gray-100 text-gray-900"
      }`}>
        <strong className="text-sm">{msg.role === "user" ? "You" : "EyiiDola"}:</strong>
        <div className="mt-1 text-sm">{msg.content}</div>
        
        {msg.suggestedProducts?.length > 0 && (
          <div className="mt-2 grid grid-cols-1 gap-2">
            {msg.suggestedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:shadow-md transition bg-white"
              >
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs truncate">{p.title}</div>
                  <div className="text-xs text-gray-600">Brand: {p.brand}</div>
                  <div className="text-xs font-bold">{formatGBP(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs opacity-50 mt-1">
          {formatTime(msg.timestamp)}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center text-lg hover:scale-105 transition-transform"
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white shadow-xl rounded-lg border z-50 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">Shopping Assistant</h3>
            <button
              onClick={handleClearConversation}
              className="text-xs text-gray-500 hover:text-gray-700"
              title="Clear conversation"
            >
              🗑️ Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mb-3 max-h-64 space-y-2 pr-1">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-4 text-sm">
                <p>Hello! I'm your AI shopping assistant. How can I help you today?</p>
              </div>
            ) : (
              messages.map(renderMessage)
            )}
            
            {loading && (
              <div className="text-left mb-3">
                <div className="inline-block p-2 rounded-lg bg-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 border p-2 rounded text-sm"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask me about products..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !userInput.trim()}
              className="bg-primary text-white py-2 px-3 rounded hover:opacity-90 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-xs mt-2 break-words">{error}</div>
          )}
        </div>
      )}
    </>
  );
};

export default AIAssistant;