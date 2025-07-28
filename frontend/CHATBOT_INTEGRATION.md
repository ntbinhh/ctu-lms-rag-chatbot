# Tích hợp Chatbot vào Dashboard Học viên

## 📋 Tổng quan

Chatbot đã được tích hợp thành công vào hệ thống dashboard học viên với các tính năng:

- 🤖 **Floating Widget**: Chatbot nổi ở góc dưới phải màn hình
- 💬 **Hỏi đáp tự nhiên**: Trả lời câu hỏi về lịch học bằng tiếng Việt
- 🎯 **Tích hợp seamless**: Có mặt trên tất cả trang của sinh viên
- 📱 **Responsive**: Tối ưu cho cả desktop và mobile
- 🔗 **Header integration**: Nút chatbot trong header để truy cập nhanh

## 🚀 Các thành phần đã được tích hợp

### 1. ChatbotWidget Component
**File**: `frontend/src/components/ChatbotWidget.js`

**Chức năng**:
- Giao diện chat floating window
- Kết nối với Rasa chatbot server
- Xử lý authentication token
- Gợi ý câu hỏi thông minh
- Typing indicator và loading states

### 2. Dashboard Student
**File**: `frontend/src/pages/DashboardStudent.js`

**Cập nhật**:
- Thêm ChatbotWidget component
- Thiết kế lại giao diện với cards và quick actions
- Thêm section giới thiệu tính năng chatbot
- Responsive design cho mobile

### 3. Student Header
**File**: `frontend/src/components/StudentHeader.jsx`

**Cập nhật**:
- Thêm nút chatbot trong header
- Event system để mở chatbot từ header
- Cải thiện layout và styling

### 4. Schedule & Program Views
**Files**: 
- `frontend/src/pages/StudentScheduleView.js`
- `frontend/src/pages/StudentProgramView.js`

**Cập nhật**:
- Tích hợp ChatbotWidget vào tất cả trang
- Consistency trong trải nghiệm người dùng

## 🎨 Styling và UX

### CSS Files được tạo/cập nhật:
- `ChatbotWidget.css` - Styling cho chatbot widget
- `DashboardStudent.css` - Styling cho dashboard mới

### Design Features:
- **Color Scheme**: Sử dụng brand colors (#0c4da2)
- **Animations**: Smooth transitions và hover effects
- **Typography**: Consistent với hệ thống hiện tại
- **Icons**: PrimeIcons integration
- **Shadows**: Modern card-based design

## 🔧 Cấu hình và API

### Chatbot Integration:
```javascript
// Rasa server endpoint
const RASA_URL = 'http://localhost:5005/webhooks/rest/webhook';

// Authentication
const token = localStorage.getItem('token');

// Message format
{
  sender: 'student_user',
  message: userMessage,
  metadata: {
    auth_token: token
  }
}
```

### Supported Queries:
- "lịch học hôm nay"
- "hôm nay tôi có môn gì"
- "lịch học tuần này"
- "lịch học ngày mai"
- "tiết học tiếp theo"

## 📱 Responsive Design

### Breakpoints:
- **Desktop**: > 768px - Full feature set
- **Tablet**: 481px - 768px - Adapted layout
- **Mobile**: ≤ 480px - Optimized for touch

### Mobile Optimizations:
- Smaller toggle button (50px vs 60px)
- Full-width chat window with max-width
- Touch-friendly suggestion chips
- Reduced padding and margins

## 🚦 Trạng thái và Error Handling

### States được xử lý:
- ✅ **Loading**: Typing indicator khi bot đang trả lời
- ✅ **Error**: Hiển thị thông báo lỗi khi không kết nối được
- ✅ **Empty Response**: Fallback message khi bot không hiểu
- ✅ **Authentication**: Thông báo khi chưa đăng nhập

### Error Messages:
- Không kết nối được server Rasa
- Token authentication failure
- Network connectivity issues
- Bot không hiểu câu hỏi

## 🎯 User Experience Flow

1. **Landing**: Sinh viên vào dashboard → thấy floating chatbot button
2. **Discovery**: Click header chatbot icon hoặc floating button
3. **Interaction**: Chat window mở với welcome message và suggestions
4. **Usage**: Gõ câu hỏi hoặc click suggestion chips
5. **Response**: Bot trả lời với thông tin lịch học chi tiết
6. **Continued**: Có thể tiếp tục hỏi hoặc đóng chat

## ⚙️ Setup và Development

### Requirements:
```bash
# Frontend dependencies (đã có trong package.json)
- react
- primereact
- primeicons

# Backend: Rasa server phải chạy trên port 5005
```

### Development:
```bash
# Start Actions Server FIRST (in terminal 1)
cd chatbot
rasa run actions --port 5055

# Start Rasa Server (in terminal 2) 
cd chatbot
rasa run --enable-api --cors "*" --port 5005 --endpoints endpoints.yml

# Start frontend (in terminal 3)
cd frontend
npm start
```

### Quick Start Scripts:
```bash
# Use provided batch files for Windows:
cd chatbot
start_actions.bat    # Start actions server
start_rasa.bat       # Start Rasa server  
start_chatbot.bat    # Start both (automated)
```

### Testing:
- Test chatbot widget trên tất cả trang sinh viên
- Verify responsive design trên mobile
- Check authentication flow
- Test error scenarios (server down, no token)

### Common Issues và Solutions:

#### ❌ "Failed to execute custom action" error:
**Problem**: Rasa không tìm thấy actions server
**Solution**: 
1. Đảm bảo `endpoints.yml` có cấu hình đúng
2. Chạy actions server trước: `rasa run actions --port 5055`
3. Chạy Rasa với endpoints: `rasa run --endpoints endpoints.yml`

#### ❌ "No endpoint configured" error:
**Problem**: `endpoints.yml` chưa được cấu hình
**Solution**: Uncomment action_endpoint trong `endpoints.yml`:
```yaml
action_endpoint:
  url: "http://localhost:5055/webhook"
```

#### ❌ Authentication errors:
**Problem**: Token không được truyền đúng
**Solution**: Kiểm tra metadata trong ChatbotWidget.js

## 🔮 Future Enhancements

### Planned Features:
- [ ] Voice input/output capability
- [ ] Schedule notifications and reminders
- [ ] Calendar integration
- [ ] Multi-language support
- [ ] Advanced NLP for complex queries
- [ ] File upload for schedule questions
- [ ] Integration with mobile app

### Technical Improvements:
- [ ] WebSocket connection for real-time
- [ ] Caching for faster responses
- [ ] Analytics and usage tracking
- [ ] A/B testing framework
- [ ] Performance optimization

## 📊 Analytics và Monitoring

### Metrics to Track:
- Chatbot usage frequency
- Most common questions
- Response satisfaction
- Error rates
- User engagement time

### Implementation:
```javascript
// Add to ChatbotWidget.js
const trackChatbotUsage = (action, data) => {
  // Analytics implementation
  console.log('Chatbot Analytics:', { action, data, timestamp: new Date() });
};
```

## 🔒 Security Considerations

### Implemented:
- ✅ Token-based authentication
- ✅ CORS handling
- ✅ Input sanitization
- ✅ Error message sanitization

### Recommendations:
- Rate limiting for API calls
- Message content filtering
- User session management
- Audit logging

---

**✅ Status**: Chatbot đã được tích hợp thành công vào dashboard học viên với đầy đủ tính năng và responsive design!
