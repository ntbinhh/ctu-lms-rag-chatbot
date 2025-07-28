import React from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';

const ChatbotToggle = ({ onClick, className = "" }) => {
  return (
    <>
      <Button
        icon="pi pi-comment"
        className={`p-button-rounded p-button-info p-button-sm chatbot-header-toggle ${className}`}
        onClick={onClick}
        tooltip="Mở Chatbot Lịch Học"
        tooltipOptions={{ position: 'bottom' }}
        aria-label="Mở chatbot hỗ trợ"
      />
      <Tooltip target=".chatbot-header-toggle" />
    </>
  );
};

export default ChatbotToggle;
