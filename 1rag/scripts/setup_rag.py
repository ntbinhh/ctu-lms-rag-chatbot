import os
import sys
from pathlib import Path

# Add parent directory to path
parent_dir = Path(__file__).parent.parent
sys.path.append(str(parent_dir))

def setup_rag():
    """Setup RAG system với knowledge base"""
    print("🚀 Setting up RAG system...")
    
    try:
        from rag_system.rag_manager import RAGManager
        
        # Khởi tạo RAG manager
        rag_manager = RAGManager()
        
        # Đường dẫn đến knowledge base
        knowledge_base_path = parent_dir / "knowledge_base"
        
        if not knowledge_base_path.exists():
            print(f"📁 Tạo folder knowledge base: {knowledge_base_path}")
            knowledge_base_path.mkdir(parents=True, exist_ok=True)
            print("📄 Vui lòng đặt các file PDF/TXT vào folder knowledge_base")
            return
        
        # Kiểm tra có file nào trong knowledge base không
        files = list(knowledge_base_path.glob("*.pdf")) + list(knowledge_base_path.glob("*.txt"))
        if not files:
            print("📄 Không tìm thấy file nào trong knowledge base.")
            print("Vui lòng thêm file PDF hoặc TXT vào folder knowledge_base")
            return
        
        print(f"📚 Tìm thấy {len(files)} file trong knowledge base")
        
        # Load knowledge base
        if rag_manager.load_knowledge_base(str(knowledge_base_path)):
            print("✅ RAG system setup thành công!")
            print("🎯 Bạn có thể test bằng cách chạy: python test_rag.py")
        else:
            print("❌ Lỗi setup RAG system")
    
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Vui lòng cài đặt dependencies:")
        print("pip install -r requirements.txt")
    
    except Exception as e:
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    setup_rag()
