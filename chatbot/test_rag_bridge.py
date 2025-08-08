"""
Test script để kiểm tra kết nối RAG Bridge -> RAG Server
"""
import os
import sys
import time

# Set environment variable manually
os.environ['RAG_SERVER_URL'] = 'http://localhost:5001'

# Import RAG Bridge
from rag_bridge import RAGBridge

def test_rag_bridge():
    print("🧪 Testing RAG Bridge connection...")
    
    # Initialize bridge
    bridge = RAGBridge()
    
    # Test questions
    test_queries = [
        "học phí ngành cntt",
        "có mấy phương thức xét tuyển?",
        "thông tin học bổng"
    ]
    
    for query in test_queries:
        print(f"\n{'='*50}")
        print(f"📝 Test query: {query}")
        print(f"{'='*50}")
        
        try:
            # Call RAG Bridge
            response = bridge.query(query)
            print(f"📤 Response received:")
            print(response)
            
        except Exception as e:
            print(f"❌ Error during query: {e}")
            import traceback
            traceback.print_exc()
        
        time.sleep(2)  # Wait between requests
    
    print("\n✅ RAG Bridge test completed!")

if __name__ == "__main__":
    test_rag_bridge()
