# Hướng dẫn khắc phục lỗi Dependencies

## Lỗi: ImportError: cannot import name 'LegacyVersion' from 'packaging.version'

### Nguyên nhân:
- Xung đột phiên bản packaging
- Các package cũ không tương thích với packaging mới

### Cách khắc phục:

#### Phương pháp 1: Sử dụng script tự động
```bash
# Chạy script khắc phục
fix_setup.bat

# Hoặc thủ công:
python scripts/fix_dependencies.py
```

#### Phương pháp 2: Khắc phục thủ công
```bash
# 1. Upgrade core packages
python -m pip install --upgrade pip setuptools wheel packaging

# 2. Install dependencies riêng lẻ
python -m pip install python-dotenv>=1.0.0
python -m pip install langchain>=0.1.0
python -m pip install langchain-google-genai>=1.0.0
python -m pip install langchain-community>=0.0.20
python -m pip install sentence-transformers>=2.2.2
python -m pip install faiss-cpu>=1.7.4
python -m pip install PyPDF2>=3.0.1

# 3. Test imports
python scripts/simple_test.py
```

#### Phương pháp 3: Reset environment
```bash
# Xóa và tạo lại virtual environment
deactivate
rmdir /s .venv
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
python scripts/fix_dependencies.py
```

### Kiểm tra sau khi khắc phục:

1. **Test cơ bản:**
   ```bash
   python scripts/simple_test.py
   ```

2. **Test RAG system:**
   ```bash
   python scripts/setup_rag.py
   python scripts/test_rag.py
   ```

3. **Test Rasa:**
   ```bash
   rasa train
   rasa run actions
   ```

### Các lỗi khác có thể gặp:

#### 1. Lỗi CUDA/GPU (nếu có GPU):
```bash
# Install CPU version
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

#### 2. Lỗi encoding UTF-8:
- Đảm bảo file .env và knowledge base files có encoding UTF-8
- Sử dụng Notepad++ hoặc VS Code để save với UTF-8

#### 3. Lỗi API key:
- Kiểm tra file .env có GOOGLE_API_KEY đúng
- Kiểm tra API key còn quota

#### 4. Lỗi memory:
- Giảm CHUNK_SIZE trong .env
- Sử dụng model embedding nhỏ hơn

### Thứ tự setup khuyến nghị:

1. **Khắc phục dependencies:**
   ```bash
   fix_setup.bat
   ```

2. **Kiểm tra cấu hình:**
   ```bash
   python scripts/simple_test.py
   ```

3. **Thêm knowledge base:**
   - Copy file PDF/TXT vào folder `knowledge_base/`

4. **Setup RAG:**
   ```bash
   python scripts/setup_rag.py
   ```

5. **Test hoàn chình:**
   ```bash
   python scripts/test_rag.py
   ```

6. **Train và chạy Rasa:**
   ```bash
   rasa train
   run_chatbot.bat
   ```

### Liên hệ hỗ trợ:
- Nếu vẫn gặp lỗi, tạo issue với log đầy đủ
- Bao gồm phiên bản Python, OS, và error message
