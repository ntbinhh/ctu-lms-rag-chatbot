#!/usr/bin/env python3
"""
Script kiểm tra và quản lý models đã download
"""

import os
import sys
import shutil
from pathlib import Path
from sentence_transformers import SentenceTransformer

def print_status(message, status="INFO"):
    """In thông báo với icon"""
    status_icon = {
        "INFO": "ℹ️",
        "SUCCESS": "✅", 
        "ERROR": "❌",
        "WARNING": "⚠️",
        "FOUND": "🔍"
    }
    print(f"{status_icon.get(status, 'ℹ️')} {message}")

def check_huggingface_cache():
    """Kiểm tra cache HuggingFace"""
    print_status("Kiểm tra HuggingFace cache...")
    
    # Các đường dẫn cache phổ biến
    cache_paths = [
        Path.home() / ".cache" / "huggingface",
        Path.home() / ".cache" / "torch" / "sentence_transformers",
        Path(os.environ.get("HF_HOME", "")) if os.environ.get("HF_HOME") else None
    ]
    
    cache_paths = [p for p in cache_paths if p and p.exists()]
    
    if not cache_paths:
        print_status("Không tìm thấy cache HuggingFace", "ERROR")
        return None
    
    for cache_path in cache_paths:
        print_status(f"Tìm thấy cache tại: {cache_path}", "FOUND")
        
        # List các models trong cache
        if cache_path.exists():
            for item in cache_path.rglob("*"):
                if "vietnamese-sbert" in str(item) or "all-MiniLM" in str(item) or "gte-multilingual" in str(item):
                    print_status(f"   Model: {item.name}", "INFO")
    
    return cache_paths[0]

def test_models():
    """Test xem các models có load được không"""
    print_status("Testing các models...")
    
    models_to_test = [
        "keepitreal/vietnamese-sbert",
        "sentence-transformers/all-MiniLM-L6-v2", 
        "Alibaba-NLP/gte-multilingual-base"
    ]
    
    working_models = []
    
    for model_name in models_to_test:
        try:
            print_status(f"Loading {model_name}...", "INFO")
            model = SentenceTransformer(model_name)
            
            # Test encoding
            test_text = "Xin chào, đây là câu test"
            embedding = model.encode(test_text)
            
            print_status(f"✅ {model_name} hoạt động OK (dim: {len(embedding)})", "SUCCESS")
            working_models.append(model_name)
            
        except Exception as e:
            print_status(f"❌ {model_name} lỗi: {str(e)}", "ERROR")
    
    return working_models

def show_model_locations():
    """Hiển thị vị trí các models"""
    print_status("Vị trí lưu trữ models:")
    
    try:
        from sentence_transformers import SentenceTransformer
        
        # Lấy cache folder mặc định
        temp_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        cache_folder = temp_model._cache_folder
        print_status(f"Cache folder: {cache_folder}", "INFO")
        
        # List nội dung cache folder
        if Path(cache_folder).exists():
            for item in Path(cache_folder).iterdir():
                if item.is_dir():
                    print_status(f"   📁 {item.name}", "FOUND")
                    
                    # Kiểm tra size
                    size = sum(f.stat().st_size for f in item.rglob('*') if f.is_file())
                    size_mb = size / (1024 * 1024)
                    print_status(f"      Size: {size_mb:.1f} MB", "INFO")
        
    except Exception as e:
        print_status(f"Lỗi kiểm tra cache: {e}", "ERROR")

def copy_models_to_local():
    """Copy models từ cache về thư mục local"""
    print_status("Copy models về thư mục local...")
    
    local_models_dir = Path("models")
    local_models_dir.mkdir(exist_ok=True)
    
    try:
        # Lấy đường dẫn cache
        temp_model = SentenceTransformer("keepitreal/vietnamese-sbert")
        cache_folder = Path(temp_model._cache_folder)
        
        model_folders = {
            "vietnamese-sbert": None,
            "all-MiniLM-L6-v2": None,
            "gte-multilingual-base": None
        }
        
        # Tìm các thư mục model
        for item in cache_folder.iterdir():
            if item.is_dir():
                item_name = item.name.lower()
                if "vietnamese-sbert" in item_name:
                    model_folders["vietnamese-sbert"] = item
                elif "all-minilm-l6-v2" in item_name:
                    model_folders["all-MiniLM-L6-v2"] = item
                elif "gte-multilingual-base" in item_name:
                    model_folders["gte-multilingual-base"] = item
        
        # Copy từng model
        for model_name, source_path in model_folders.items():
            if source_path and source_path.exists():
                dest_path = local_models_dir / model_name
                
                if dest_path.exists():
                    print_status(f"{model_name} đã tồn tại trong local", "WARNING")
                else:
                    print_status(f"Copying {model_name}...", "INFO")
                    shutil.copytree(source_path, dest_path)
                    print_status(f"✅ Copied {model_name}", "SUCCESS")
            else:
                print_status(f"❌ Không tìm thấy {model_name} trong cache", "ERROR")
    
    except Exception as e:
        print_status(f"Lỗi copy models: {e}", "ERROR")

def main():
    """Main function"""
    print("🔍 KIỂM TRA VÀ QUẢN LÝ MODELS")
    print("=" * 50)
    
    # 1. Kiểm tra cache
    cache_path = check_huggingface_cache()
    print()
    
    # 2. Test models
    working_models = test_models()
    print()
    
    # 3. Hiển thị vị trí models
    show_model_locations()
    print()
    
    # 4. Hiển thị thông tin current model
    print_status("Thông tin model hiện tại trong .env:")
    try:
        with open(".env", "r", encoding="utf-8") as f:
            lines = f.readlines()
            for line in lines:
                if "EMBEDDINGS_MODEL" in line:
                    print_status(f"   {line.strip()}", "INFO")
    except FileNotFoundError:
        print_status("Không tìm thấy file .env", "WARNING")
    
    print()
    
    # 5. Tùy chọn copy về local
    print_status("💡 Các options:")
    print("   1. Models đã được cache và sẵn sàng sử dụng")
    print("   2. Nếu muốn copy về thư mục local, gọi copy_models_to_local()")
    print("   3. Models sẽ load nhanh từ cache trong lần sử dụng tiếp theo")
    
    if len(working_models) > 0:
        print_status(f"🎉 {len(working_models)}/{len(['keepitreal/vietnamese-sbert', 'sentence-transformers/all-MiniLM-L6-v2', 'Alibaba-NLP/gte-multilingual-base'])} models sẵn sàng!", "SUCCESS")
    else:
        print_status("❌ Chưa có model nào hoạt động", "ERROR")

if __name__ == "__main__":
    main()
