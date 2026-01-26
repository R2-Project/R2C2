import { useState, useEffect, useRef } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import R2C2Icon from '@/assets/images/r2c2-4.png';
import { ApiRequest } from "@/lib/api";
import { Loader2, Send } from "lucide-react";import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! How can I help you today?", sender: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newText = inputValue.trim();
    if (!newText || isLoading) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: prevMessages.length + 1, text: newText, sender: "user" },
    ]);
    setInputValue("");
    setIsLoading(true);

    try {
      let serverUrl = localStorage.getItem("serverUrl");
      const token = localStorage.getItem("token");

      if (!serverUrl) {
          throw new Error("Server URL not found");
      }
      
      if(!serverUrl.includes("http")) {
          serverUrl = `http://${serverUrl}`;
      }

      const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};
      const body = JSON.stringify({ message: newText });
      
      const response = await ApiRequest("POST", `${serverUrl}/ai/query`, headers, body);
      
      let botResponse = "I'm sorry, I couldn't process that request.";
      if (response.statusCode >= 200 && response.statusCode < 300) {
          try {
             // Try to parse as JSON first
             const data = JSON.parse(response.body);
             botResponse = data.message || data.response || response.body; 
          } catch {
              // specific to string response
              botResponse = response.body;
          }
      } else {
          botResponse = `Error: ${response.statusCode} - ${response.body}`;
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          text: botResponse,
          sender: "bot",
        },
      ]);

    } catch (error: any) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          text: `Error: ${error.message || "Failed to communicate with AI"}`,
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-background flex flex-col h-full border-l border-border">
      <div className="bg-muted/50 text-foreground p-4 border-b border-border">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <img src={R2C2Icon} alt="R2C2" className="w-8 h-8 rounded-full" />
          R2C2 AI Assistant
        </h2>
      </div>

      {/* Message List */}
      <ScrollArea.Root className="flex-grow p-4 overflow-hidden bg-background">
        <ScrollArea.Viewport ref={viewportRef} className="w-full h-full">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {message.sender === 'bot' && (
                  <img src={R2C2Icon} alt="Bot" className="w-10 h-10 rounded-full mb-1" />
                )}
                <div
                  className={`p-3 rounded-lg max-w-[80%] text-sm overflow-hidden ${message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground border border-border"
                    }`}
                >
                  {message.sender === "bot" ? (
                    <div className="markdown-content prose prose-sm dark:prose-invert max-w-none break-words">
                       <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Override pre/code so they don't look weird inside the chat bubble
                            code({node, inline, className, children, ...props}: any) {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <div className="rounded-md bg-zinc-950 p-2 my-2 overflow-x-auto">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </div>
                              ) : (
                                <code className="bg-black/20 rounded px-1 py-0.5" {...props}>
                                  {children}
                                </code>
                              )
                            }
                          }}
                       >
                         {message.text}
                       </ReactMarkdown>
                    </div>
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex select-none touch-none p-0.5 bg-muted transition-colors w-2"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="flex-1 bg-muted-foreground/30 rounded-full relative hover:bg-muted-foreground/50 transition-colors" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex p-4 border-t border-border bg-background">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow px-3 py-2 border border-input rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary bg-muted text-foreground placeholder-muted-foreground"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-r-md hover:bg-primary/90 focus:outline-none transition-colors font-medium flex items-center justify-center min-w-[80px]"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send"}
        </button>
      </form>
    </div>
  );
}

export default Chatbot;
