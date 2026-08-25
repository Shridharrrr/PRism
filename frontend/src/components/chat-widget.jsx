"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatWidget({ reviewId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm PRism AI. I just reviewed your PR. Do you have any questions about the issues I flagged?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/api/reviews/${reviewId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error connecting to the server." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-foreground hover:bg-foreground/90 text-background rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-50 ring-4 ring-background"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[450px] h-[700px] max-h-[85vh] max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border text-foreground px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-foreground" />
          <span className="font-semibold text-sm tracking-wide">PRism AI</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background/50">
        {messages.map((msg, idx) => {
          let textContent = "";
          if (typeof msg.content === "string") {
            textContent = msg.content;
          } else if (Array.isArray(msg.content)) {
            textContent = msg.content.map(c => c.text || JSON.stringify(c)).join("");
          } else if (msg.content?.text) {
            textContent = msg.content.text;
          } else {
            textContent = JSON.stringify(msg.content);
          }

          return (
            <div
              key={idx}
              className={`flex flex-col max-w-[85%] ${
                msg.role === "user" ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed font-light font-sans tracking-wide shadow-sm overflow-x-auto break-words ${
                  msg.role === "user"
                    ? "bg-card border border-foreground/30 text-foreground rounded-br-none whitespace-pre-wrap"
                    : "bg-card border border-primary/30 text-foreground rounded-bl-none prose prose-sm prose-p:text-[13px] prose-li:text-[13px] max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:text-[14px] prose-headings:font-medium prose-a:text-primary hover:prose-a:underline prose-code:text-[12px] prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-md prose-pre:text-[12px] prose-pre:max-w-full"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {textContent}
                  </ReactMarkdown>
                ) : (
                  textContent
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="self-start px-4 py-2.5 rounded-2xl text-[13px] bg-card border border-border rounded-bl-none shadow-sm flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="p-3 border-t border-border bg-card flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask how to fix an issue..."
          className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-foreground text-background w-9 h-9 flex items-center justify-center rounded-lg hover:bg-foreground/90 disabled:opacity-50 transition-colors shrink-0"
        >
          <Send className="w-4 h-4 -ml-0.5" />
        </button>
      </form>
    </div>
  );
}
