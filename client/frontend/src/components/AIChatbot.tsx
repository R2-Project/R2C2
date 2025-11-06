import { useState, useEffect, useRef } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area"; // 1. Import Radix ScrollArea

function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! How can I help you today?", sender: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const viewportRef = useRef(null);

  const scrollToBottom = () => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newText = inputValue.trim();
    if (!newText) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: prevMessages.length + 1, text: newText, sender: "user" },
    ]);
    setInputValue("");

    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          text: `You said: "${newText}"`,
          sender: "bot",
        },
      ]);
    }, 1000);
  };

  return (
    // 1. Main container: Changed bg-white to bg-black
    <div className="w-full bg-black flex flex-col h-full">
      {/* 2. Header: Changed bg-blue-600 to bg-gray-900 */}
      <div className="bg-gray-900 text-white p-4">
        <h2 className="text-xl font-semibold">R2C AI Assistant</h2>
      </div>

      {/* Message List */}
      <ScrollArea.Root className="flex-grow p-4 overflow-hidden">
        <ScrollArea.Viewport ref={viewportRef} className="w-full h-full">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-xs ${message.sender === "user"
                    ? "bg-blue-600 text-white" // User bubble (already good)
                    : "bg-gray-800 text-gray-100" // 3. Bot bubble
                    }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          // 4. Scrollbar track: Changed bg-gray-100 to bg-gray-900
          className="flex select-none touch-none p-0.5 bg-gray-900 transition-colors"
          orientation="vertical"
        >
          {/* 5. Scrollbar thumb: Changed bg-gray-400 to bg-gray-600 */}
          <ScrollArea.Thumb className="flex-1 bg-gray-600 rounded-full relative" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* Input Form */}
      {/* 6. Form container: Added dark border */}
      <form onSubmit={handleSubmit} className="flex p-4 border-t border-gray-700">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          // 7. Input field: Added dark bg, text, border, and placeholder
          className="flex-grow px-3 py-2 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chatbot;
