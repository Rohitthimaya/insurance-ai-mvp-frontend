"use client";
import { useState } from "react";
import { X, MessageCircle } from "lucide-react";

export default function AskAIBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  const handleKeyDown = async (e: { key: string; preventDefault: () => void; }) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();

      const userMessage = { role: "user", content: query };
      setMessages((prev) => [...prev, userMessage]);

      const token = localStorage.getItem("token"); // get logged-in user's token
      if (!token) {
        alert("Please log in.");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ query }),
        });

        const data = await res.json();

        const aiMessage = { role: "ai", content: data?.answer || "No response" };
        setMessages((prev) => [...prev, aiMessage]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "⚠️ Error reaching server" },
        ]);
      }

      setQuery(""); // clear input after submit
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-4 rounded-full shadow-lg text-white hover:scale-105 transition"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold">Ask Agent</h3>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto text-gray-700 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "ml-auto bg-indigo-100 text-indigo-800"
                    : "mr-auto bg-gray-100 text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </>
  );
}
