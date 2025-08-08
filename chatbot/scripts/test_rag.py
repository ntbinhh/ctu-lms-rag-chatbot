import os
import sys
from pathlib import Path

# Add parent directory to path
parent_dir = Path(__file__).parent.parent
sys.path.append(str(parent_dir))

def test_rag():
    """Test RAG system"""
    print("🧪 Testing RAG system...")
    
    try:
        from rag_system.rag_manager import RAGManager
        
        # Khởi tạo RAG manager
        rag_manager = RAGManager()
        
        if not rag_manager.is_ready():
            print("❌ RAG system chưa sẵn sàng. Vui lòng chạy setup_rag.py trước")
            return
        
        # Test queries
        test_queries = [
            "Học phí một học kỳ là bao nhiêu?",
            "Quy định về điểm số như thế nào?",
            "Thủ tục xin học bổng?",
            "Điều kiện tốt nghiệp?",
            "Thông tin liên hệ phòng đào tạo?"
        ]
        
        print("🔍 Testing với các câu hỏi mẫu:\n")
        
        for i, query in enumerate(test_queries, 1):
            print(f" Câu hỏi {i}: {query}")
            response = rag_manager.query(query)
            print(f" Trả lời: {response}")
            print("-" * 50)
        
        print("✅ Test hoàn thành!")
    
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Vui lòng cài đặt dependencies:")
        print("pip install -r requirements.txt")
    
    except Exception as e:
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    test_rag()
