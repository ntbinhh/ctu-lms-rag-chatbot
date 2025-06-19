import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?" }
  ]);
  const [input, setInput] = useState("");

const sendMessage = async () => {
  if (!input.trim()) return;

  const userMsg = { from: "user", text: input };
  setMessages((prev) => [...prev, userMsg]);
  setInput("");

  try {
    const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "user", message: input })
    });

    const data = await response.json();

    if (data && data.length > 0) {
      // Có thể có nhiều tin nhắn từ bot
      const botReplies = data.map((msg) => ({
        from: "bot",
        text: msg.text || "(Không có nội dung)"
      }));
      setMessages((prev) => [...prev, ...botReplies]);
    } else {
      setMessages((prev) => [...prev, { from: "bot", text: "Không nhận được phản hồi từ chatbot." }]);
    }
  } catch (error) {
    setMessages((prev) => [...prev, { from: "bot", text: "Lỗi kết nối tới Rasa." }]);
    console.error("Lỗi gọi API Rasa:", error);
  }
};

  return (
    <div className="chatbot-container">
      <Card title="Chatbot Hỗ Trợ" className="chatbot-card">
        <div className="chat-window">
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.from === "user" ? "msg user-msg" : "msg bot-msg"}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <InputText
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Nhập tin nhắn..."
            className="input-box"
          />
          <Button icon="pi pi-send" onClick={sendMessage} className="p-button-sm" />
        </div>
      </Card>
    </div>
  );
};

export default Chatbot;