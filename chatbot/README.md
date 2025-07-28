# Chatbot Lịch Học - Schedule Chatbot

Chatbot thông minh để tra cứu lịch học sinh viên sử dụng Rasa framework.

## ✨ Tính năng

- 🤖 **Hỏi đáp tự nhiên**: Chatbot hiểu tiếng Việt và trả lời câu hỏi về lịch học
- 📅 **Lịch học hôm nay**: Xem lịch học của ngày hiện tại
- 🗓️ **Lịch học tuần**: Xem lịch học cả tuần (đang phát triển)
- 🌅 **Lịch học ngày mai**: Xem lịch học ngày tiếp theo (đang phát triển)
- ⏰ **Tiết học tiếp theo**: Xem tiết học sắp tới (đang phát triển)
- 🎓 **Chương trình đào tạo**: Tra cứu chương trình học theo khoa/ngành

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
cd chatbot
pip install -r requirements.txt
```

### 2. Train model

```bash
rasa train
```

### 3. Chạy Rasa system (2 terminals cần thiết)

#### Terminal 1: Actions Server
```bash
rasa run actions --port 5055
```

#### Terminal 2: Rasa Server  
```bash
rasa run --enable-api --cors "*" --port 5005 --endpoints endpoints.yml
```

### 4. Hoặc sử dụng batch files (Windows)

```bash
# Terminal 1
start_actions.bat

# Terminal 2  
start_rasa.bat

# Hoặc tự động (cả hai)
start_chatbot.bat
```

### 5. Test setup

```bash
test_setup.bat
```

### 6. Mở giao diện chat

Mở file `chat_interface.html` trong trình duyệt hoặc sử dụng dashboard sinh viên.

## 💬 Cách sử dụng

### Câu hỏi được hỗ trợ:

**Lịch học hôm nay:**
- "lịch học hôm nay"
- "hôm nay tôi có môn gì" 
- "có lớp nào hôm nay không"
- "lịch hôm nay"
- "thời khóa biểu hôm nay"

**Lịch học tuần:**
- "lịch học tuần này"
- "thời khóa biểu tuần này"
- "tuần này tôi học gì"

**Lịch học ngày mai:**
- "lịch học ngày mai"
- "ngày mai tôi có môn gì"
- "mai có lớp không"

**Chương trình đào tạo:**
- "tôi muốn xem chương trình đào tạo"
- "chương trình học năm 2024"
- "xem ngành học của khoa CNTT"

## 🔧 Cấu hình

### Xác thực

Để sử dụng chức năng lịch học, cần cung cấp token xác thực:

1. Đăng nhập vào hệ thống qua web/app
2. Lấy token từ localStorage
3. Cấu hình token trong chatbot (hiện tại cần code thêm)

### API Backend

Chatbot kết nối với backend tại `http://localhost:8000`:

- `GET /student/schedules` - Lấy lịch học sinh viên
- `GET /weeks/` - Lấy danh sách tuần học
- `GET /programs/` - Lấy chương trình đào tạo

## 📁 Cấu trúc thư mục

```
chatbot/
├── actions/
│   ├── __init__.py
│   └── actions.py          # Custom actions cho lịch học
├── data/
│   ├── nlu.yml            # Training data cho NLU
│   ├── rules.yml          # Conversation rules
│   └── stories.yml        # Training stories
├── models/                # Trained models
├── tests/
│   └── test_stories.yml   # Test cases
├── config.yml             # Rasa configuration
├── credentials.yml        # Channel credentials
├── domain.yml             # Domain definition
├── endpoints.yml          # Endpoint configuration
├── requirements.txt       # Python dependencies
├── chat_interface.html    # Web chat interface
├── test_schedule_bot.py   # Test script
└── README.md             # Tài liệu này
```

## 🛠️ Khắc phục sự cố

### ❌ "Failed to execute custom action" 

**Nguyên nhân**: Actions server chưa chạy hoặc endpoints chưa cấu hình

**Giải pháp**:
1. Kiểm tra `endpoints.yml` có dòng:
   ```yaml
   action_endpoint:
     url: "http://localhost:5055/webhook"
   ```

2. Chạy actions server trước:
   ```bash
   rasa run actions --port 5055
   ```

3. Chạy Rasa server với endpoints:
   ```bash
   rasa run --enable-api --cors "*" --endpoints endpoints.yml
   ```

### ❌ "No endpoint configured"

**Nguyên nhân**: File `endpoints.yml` bị comment hoặc không tồn tại

**Giải pháp**: Uncomment action_endpoint trong `endpoints.yml`

### ❌ Connection refused errors

**Nguyên nhân**: Backend API không chạy

**Giải pháp**: 
1. Chạy backend: `cd backend && python main.py`
2. Kiểm tra port 8000 có sẵn không

### 🧪 Debug Tools

```bash
# Test toàn bộ setup
test_setup.bat

# Test riêng chatbot  
rasa shell

# Debug actions
rasa run actions --debug
```

### Thêm intent mới:

1. Cập nhật `data/nlu.yml` với training examples
2. Thêm intent vào `domain.yml`
3. Tạo action mới trong `actions/actions.py` 
4. Cập nhật `data/stories.yml` và `data/rules.yml`
5. Train lại model: `rasa train`

### Test chatbot:

```bash
# Test trực tiếp qua console
rasa shell

# Test bằng script
python test_schedule_bot.py

# Test qua web interface
# Mở chat_interface.html trong browser
```

## 🎯 Roadmap

- [x] Lịch học hôm nay
- [ ] Lịch học tuần này (chi tiết)
- [ ] Lịch học ngày mai
- [ ] Tiết học tiếp theo
- [ ] Nhắc nhở lịch học
- [ ] Tích hợp với calendar
- [ ] Voice interface
- [ ] Mobile app

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Tạo Pull Request

## 📝 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🆘 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển.

---

**Happy chatting! 🎉**
