import { useState } from "react";
import axios from "axios";

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");

    try {
      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: newMessages,
        },
        {
          headers: {
            Authorization: `Bearer YOUR_OPENAI_API_KEY`, // 🔁 Replace with your actual key
            "Content-Type": "application/json",
          },
        }
      );

      const reply = res.data.choices[0].message;
      setMessages([...newMessages, reply]);
    } catch (err) {
      console.error("AI error", err);
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
                className={`${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
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
          />

          <button
            onClick={handleSend}
            className="bg-primary text-white py-2 rounded hover:opacity-90 text-sm"
          >
            Send
          </button>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
