import React, { useState } from "react";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const data = await res.text();
      setMessages((prev) => [...prev, { role: "assistant", content: data }]);
    } catch (error) {
      console.error("Error chatting with AI:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Xin lỗi, chatbot hiện đang gặp sự cố!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white border border-gray-300 rounded-2xl shadow-lg w-80 h-96 flex flex-col overflow-hidden">
      <div className="bg-blue-600 text-white text-center py-2 font-semibold">
        🤖 Chatbot Tư vấn
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <p className="text-gray-400 text-sm">Đang trả lời...</p>}
      </div>
      <div className="p-2 border-t flex">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-1 text-sm"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
