import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: `🎓 **Xin chào! Tôi là AI Assistant - Trợ lý học tập thông minh**

Tôi có thể giúp bạn:

📅 **Lịch học & Thời khóa biểu**
• Xem lịch học hôm nay, ngày mai
• Lịch học tuần này
• Thông tin phòng học, giảng viên

🎯 **Chương trình đào tạo**
• Danh sách môn học
• Tiến độ học tập
• Thông tin khoa, ngành

💡 **Hãy thử hỏi tôi bất cứ điều gì về học tập!**

*Gõ câu hỏi hoặc chọn gợi ý bên dưới* ⬇️`,
      isUser: false,
      timestamp: new Date(),
      type: 'welcome'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  
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
    { 
      text: 'lịch học hôm nay', 
      icon: '📅', 
      label: 'Lịch hôm nay',
      category: 'schedule'
    },
    { 
      text: 'lịch học ngày mai', 
      icon: '📆', 
      label: 'Lịch ngày mai',
      category: 'schedule'
    },
    { 
      text: 'lịch học tuần này', 
      icon: '�️', 
      label: 'Lịch tuần này',
      category: 'schedule'
    },
    { 
      text: 'chương trình đào tạo của tôi', 
      icon: '🎓', 
      label: 'Chương trình học',
      category: 'program'
    },
  ];

  const quickActions = [
    { text: 'Trợ giúp', icon: '❓', action: 'help' },
    { text: 'Làm mới', icon: '🔄', action: 'refresh' },
    { text: 'Xóa lịch sử', icon: '🗑️', action: 'clear' }
  ];

  const addMessage = (content, isUser = false, type = 'normal') => {
    const newMessage = {
      id: Date.now(),
      content,
      isUser,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Increase unread count if chatbot is closed and message is from bot
    if (!isOpen && !isUser) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'help':
        addMessage(`🤖 **Hướng dẫn sử dụng AI Assistant**

**Các câu hỏi bạn có thể hỏi:**

📅 **Về lịch học:**
• "Lịch học hôm nay"
• "Ngày mai tôi có môn gì?"
• "Lịch học tuần này"

🎓 **Về chương trình học:**
• "Chương trình đào tạo của tôi"
• "Các môn học trong khóa"

🏫 **Về phòng học:**
• "Tôi học ở phòng nào?"
• "Thông tin phòng học"

💡 **Mẹo:** Bạn có thể hỏi bằng tiếng Việt tự nhiên!`, false, 'help');
        break;
      case 'refresh':
        window.location.reload();
        break;
      case 'clear':
        setMessages([{
          id: Date.now(),
          content: `🧹 **Lịch sử chat đã được xóa**

Tôi sẵn sàng hỗ trợ bạn! Hãy hỏi tôi về lịch học hoặc chương trình đào tạo.`,
          isUser: false,
          timestamp: new Date(),
          type: 'system'
        }]);
        break;
      default:
        break;
    }
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
    const newOpenState = !isOpen;
    setIsOpen(newOpenState);
    
    // Reset unread count when opening
    if (newOpenState) {
      setUnreadCount(0);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="chatbot-widget">
      {/* Chat Toggle Button */}
      <div className="chatbot-toggle-container">
        {unreadCount > 0 && (
          <Badge 
            value={unreadCount} 
            severity="danger" 
            className="unread-badge"
          />
        )}
        <Button
          icon={isOpen ? "pi pi-times" : "pi pi-comment"}
          rounded
          size="large"
          className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
          onClick={toggleChat}
          tooltip="AI Assistant - Trợ lý học tập"
          tooltipOptions={{ position: 'left' }}
          aria-label="Mở chatbot"
        />
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <i className="pi pi-android"></i>
              </div>
              <div className="chatbot-info">
                <h4>AI Assistant</h4>
                <span className="chatbot-status">
                  <span className="status-dot online"></span>
                  Trợ lý học tập thông minh
                </span>
              </div>
            </div>
            <div className="chatbot-actions">
              <Button
                icon={isMinimized ? "pi pi-window-maximize" : "pi pi-window-minimize"}
                rounded
                text
                size="small"
                className="chatbot-minimize"
                onClick={minimizeChat}
                aria-label="Thu gọn chatbot"
              />
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
          </div>

          {!isMinimized && (
            <>
              {/* Quick Actions */}
              <div className="chatbot-quick-actions">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    label={action.text}
                    icon={action.icon}
                    text
                    size="small"
                    className="quick-action-btn"
                    onClick={() => handleQuickAction(action.action)}
                  />
                ))}
              </div>

              <Divider />

              {/* Messages */}
              <div className="chatbot-messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.isUser ? 'user' : 'bot'} ${message.type || ''}`}
                  >
                    {!message.isUser && (
                      <div className="message-avatar">
                        <i className="pi pi-android"></i>
                      </div>
                    )}
                    <div className="message-content">
                      <div className={`message-text ${message.type || ''}`}>
                        {message.content}
                      </div>
                      <div className="message-time">
                        {formatTime(message.timestamp)}
                        {message.isUser && <i className="pi pi-check message-status"></i>}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="message bot">
                    <div className="message-avatar">
                      <i className="pi pi-android"></i>
                    </div>
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
                <div className="suggestions-header">
                  <span className="suggestions-label">💡 Gợi ý câu hỏi:</span>
                </div>
                <div className="suggestion-chips">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className={`suggestion-chip ${suggestion.category}`}
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
                    placeholder="💬 Hỏi tôi về lịch học, chương trình đào tạo..."
                    className="message-input"
                    disabled={isLoading}
                  />
                  <Button
                    icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-send"}
                    rounded
                    size="small"
                    className="send-button"
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    aria-label="Gửi tin nhắn"
                  />
                </div>
                <div className="input-footer">
                  <span className="powered-by">
                    Powered by AI • Trợ lý thông minh
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
