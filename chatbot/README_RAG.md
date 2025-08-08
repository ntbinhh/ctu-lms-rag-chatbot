# Rasa Chatbot với RAG Integration

Chatbot thông minh sử dụng Rasa kết hợp với RAG (Retrieval-Augmented Generation) để trả lời câu hỏi dựa trên knowledge base.

## 🚀 Tính năng

### Chức năng hiện có:
- ✅ Xem lịch học (hôm nay, ngày mai, tuần)
- ✅ Xem chương trình đào tạo
- ✅ Quản lý thông tin sinh viên

### Chức năng RAG mới:
- ✅ Trả lời câu hỏi dựa trên knowledge base
- ✅ Sử dụng Gemini AI để sinh câu trả lời
- ✅ Vector search với FAISS
- ✅ Hỗ trợ file PDF và TXT

## 📋 Yêu cầu hệ thống

- Python 3.8+
- RAM: 4GB+ (khuyến nghị 8GB)
- Disk: 2GB free space

## 🔧 Cài đặt

### 1. Clone repository
```bash
git clone <your-repo>
cd chatbot
```

### 2. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 3. Cấu hình Gemini API
Chỉnh sửa file `.env`:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 4. Thêm Knowledge Base
- Tạo thư mục `knowledge_base/`
- Thêm file PDF hoặc TXT chứa thông tin trường

### 5. Setup và chạy
```bash
# Tự động setup (Windows)
setup_chatbot.bat

# Hoặc thủ công:
python scripts/setup_rag.py
rasa train
```

## 🎯 Sử dụng

### Chạy chatbot
```bash
# Windows
run_chatbot.bat

# Hoặc thủ công:
# Terminal 1: rasa run actions
# Terminal 2: rasa shell
```

### Ví dụ câu hỏi
```
- "Học phí một học kỳ là bao nhiêu?"
- "Quy định về điểm số như thế nào?"
- "Thủ tục xin học bổng?"
- "Lịch học hôm nay"
- "Chương trình đào tạo của tôi"
```

## 📁 Cấu trúc thư mục

```
chatbot/
├── actions/
│   ├── actions.py          # Main actions
│   └── rag_actions.py      # RAG actions
├── config/
│   └── gemini_config.py    # Gemini configuration
├── data/
│   ├── nlu.yml            # NLU training data
│   ├── stories.yml        # Stories
│   └── rules.yml          # Rules
├── knowledge_base/         # Knowledge base files
├── rag_system/
│   └── rag_manager.py     # RAG system manager
├── scripts/
│   ├── setup_rag.py       # RAG setup script
│   └── test_rag.py        # RAG test script
├── .env                   # Environment variables
├── requirements.txt       # Dependencies
├── config.yml            # Rasa config
├── domain.yml            # Rasa domain
└── endpoints.yml         # Rasa endpoints
```

## 🔧 Cấu hình

### RAG Settings (`.env`)
```env
CHUNK_SIZE=1000            # Kích thước chunk
CHUNK_OVERLAP=200          # Overlap giữa chunks
TOP_K_RESULTS=3           # Số kết quả tìm kiếm
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### Gemini Settings
```python
MODEL_NAME = "gemini-pro"
TEMPERATURE = 0.7
MAX_OUTPUT_TOKENS = 1024
```

## 🧪 Testing

### Test RAG system
```bash
python scripts/test_rag.py
```

### Test Rasa
```bash
rasa test
```

## 📚 Knowledge Base

### Định dạng hỗ trợ:
- PDF files (.pdf)
- Text files (.txt)

### Nội dung nên có:
- Quy chế đào tạo
- Thông tin học phí
- Hướng dẫn thủ tục
- Thông tin liên hệ
- FAQ

### Ví dụ cấu trúc:
```
knowledge_base/
├── quy_che_dao_tao.pdf
├── hoc_phi_2024.pdf
├── thu_tuc_sinh_vien.pdf
├── thong_tin_lien_he.txt
└── faq.txt
```

## 🚨 Xử lý lỗi

### Lỗi thường gặp:

1. **RAG system chưa sẵn sàng**
   - Kiểm tra `.env` và API key
   - Chạy `python scripts/setup_rag.py`

2. **Import error**
   - Cài đặt dependencies: `pip install -r requirements.txt`

3. **Knowledge base trống**
   - Thêm file vào thư mục `knowledge_base/`

4. **Gemini API error**
   - Kiểm tra API key và quota

## 📈 Performance

### Tối ưu hóa:
- Sử dụng GPU nếu có
- Giảm `CHUNK_SIZE` cho RAM thấp
- Cache vector embeddings
- Batch processing cho nhiều file

### Monitoring:
- Check logs trong console
- Monitor memory usage
- Test response time

## 🔒 Bảo mật

- Không commit API keys
- Sử dụng `.env` cho sensitive data
- Validate user input
- Rate limiting cho production

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License

## 📞 Hỗ trợ

- Issues: GitHub Issues
- Email: support@university.edu
- Docs: [Wiki](link-to-wiki)
