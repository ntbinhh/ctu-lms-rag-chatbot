import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: `Xin chào! Tôi là chatbot hỗ trợ học tập. Bạn có thể hỏi tôi:

• Lịch học hôm nay
• Lịch học tuần này  
• Chương trình đào tạo
• Môn học của bạn
• Thông tin học tập

Hãy thử hỏi tôi nhé! 😊`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const RASA_URL = 'http://localhost:5005/webhooks/rest/webhook';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Listen for chatbot open event from header
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
    };

    window.addEventListener('openChatbot', handleOpenChatbot);
    return () => window.removeEventListener('openChatbot', handleOpenChatbot);
  }, []);

  const suggestions = [
    { text: 'lịch học hôm nay', icon: '📅', label: 'Lịch hôm nay' },
    { text: 'hôm nay tôi có môn gì', icon: '📚', label: 'Môn học hôm nay' },
    { text: 'chương trình đào tạo của tôi', icon: '🎓', label: 'Chương trình học' },
    { text: 'lịch học tuần này', icon: '🗓️', label: 'Lịch tuần này' }
  ];

  const addMessage = (content, isUser = false) => {
    const newMessage = {
      id: Date.now(),
      content,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async (messageText = null) => {
    const message = messageText || inputMessage.trim();
    if (!message || isLoading) return;

    // Add user message
    addMessage(message, true);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(RASA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: 'student_user',
          message: message,
          metadata: {
            auth_token: token
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          // Add bot responses
          data.forEach(botResponse => {
            if (botResponse.text) {
              setTimeout(() => {
                addMessage(botResponse.text, false);
              }, 500);
            }
          });
        } else {
          setTimeout(() => {
            addMessage('Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng thử lại.', false);
          }, 500);
        }
      } else {
        setTimeout(() => {
          addMessage('Không thể kết nối với chatbot. Vui lòng kiểm tra server Rasa.', false);
        }, 500);
      }
    } catch (error) {
      console.error('Chatbot Error:', error);
      setTimeout(() => {
        addMessage('Có lỗi xảy ra khi kết nối với chatbot. Vui lòng thử lại sau.', false);
      }, 500);
    } finally {
      setTimeout(() => {
        setIsTyping(false);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-widget">
      {/* Chat Toggle Button */}
      <Button
        icon="pi pi-comment"
        rounded
        size="large"
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        tooltip="Chatbot Lịch Học"
        tooltipOptions={{ position: 'left' }}
        aria-label="Mở chatbot"
      />

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div className="chatbot-info">
                <h4>Chatbot Lịch Học</h4>
                <span className="chatbot-status">
                  <span className="status-dot online"></span>
                  Đang hoạt động
                </span>
              </div>
            </div>
            <Button
              icon="pi pi-times"
              rounded
              text
              size="small"
              className="chatbot-close"
              onClick={toggleChat}
              aria-label="Đóng chatbot"
            />
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isUser ? 'user' : 'bot'}`}
              >
                <div className="message-content">
                  <div className="message-text">
                    {message.content}
                  </div>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="chatbot-suggestions">
            <div className="suggestions-label">Gợi ý:</div>
            <div className="suggestion-chips">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => sendMessage(suggestion.text)}
                  disabled={isLoading}
                >
                  <span className="suggestion-icon">{suggestion.icon}</span>
                  <span className="suggestion-text">{suggestion.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <div className="input-container">
              <InputText
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                className="message-input"
                disabled={isLoading}
              />
              <Button
                icon="pi pi-send"
                rounded
                size="small"
                className="send-button"
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Gửi tin nhắn"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
