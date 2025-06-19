import React, { useState } from "react";
import Chatbot from "./Chatbot";
import { Button } from "primereact/button";
import "./FloatingChatbot.css";

const FloatingChatbot = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {visible && (
        <div className="floating-chat-window">
          <Chatbot />
        </div>
      )}
      <Button
        icon={visible ? "pi pi-times" : "pi pi-comments"}
        className="floating-chat-button"
        onClick={() => setVisible((prev) => !prev)}
        tooltip={visible ? "Đóng Chatbot" : "Mở Chatbot"}
      />
    </>
  );
};

export default FloatingChatbot;