"""
Debug RAG System - Kiểm tra xem RAG có đang lấy đúng dữ liệu không
"""

import requests
import json

def debug_rag_system():
    """Debug RAG system với câu hỏi về học bổng"""
    
    server_url = "http://localhost:5001"
    
    print("🔍 DEBUG RAG SYSTEM")
    print("=" * 50)
    
    # Test câu hỏi về học bổng (có trong knowledge base)
    test_questions = [
        "Quỹ học bổng được công bố khi nào?",
        "Điều kiện để được học bổng loại xuất sắc là gì?",
        "Sinh viên cần đáp ứng điều kiện gì để được xét học bổng?",
        "Học bổng khuyến khích học tập được xét như thế nào?",
        "Có những loại học bổng nào?"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n🧪 TEST {i}: {question}")
        print("-" * 60)
        
        try:
            response = requests.post(
                f"{server_url}/rag/query",
                json={"query": question},
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"✅ Status: {result.get('status', 'unknown')}")
                print(f"🔗 Source: {result.get('source', 'unknown')}")
                
                response_text = result.get('response', 'No response')
                print(f"\n📝 RESPONSE:")
                print(response_text)
                
                # Kiểm tra xem có sử dụng thông tin từ knowledge base không
                knowledge_indicators = [
                    "quỹ học bổng",
                    "công bố từ đầu khóa học",
                    "điều chỉnh nếu nguồn quỹ",
                    "ĐTBCHK",
                    "điểm rèn luyện",
                    "12 tín chỉ",
                    "loại KHÁ trở lên",
                    "không có học phần nào dưới điểm D",
                    "khiển trách cấp Trường"
                ]
                
                found_indicators = [ind for ind in knowledge_indicators if ind.lower() in response_text.lower()]
                
                if found_indicators:
                    print(f"\n✅ DETECTED KNOWLEDGE BASE INFO:")
                    for indicator in found_indicators:
                        print(f"  - {indicator}")
                else:
                    print(f"\n❌ NO KNOWLEDGE BASE INFO DETECTED")
                    print("⚠️ Response might be generic, not from knowledge base")
                
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Request failed: {e}")
        
        print("\n" + "=" * 60)
    
    # Test RAG status
    print(f"\n📊 RAG STATUS CHECK:")
    try:
        response = requests.get(f"{server_url}/rag/status")
        if response.status_code == 200:
            status = response.json()
            print(f"Type: {status.get('type', 'unknown')}")
            print(f"Status: {status.get('status', 'unknown')}")
            print(f"Documents loaded: {status.get('documents_loaded', 'unknown')}")
        else:
            print(f"Status check failed: {response.status_code}")
    except Exception as e:
        print(f"Status check error: {e}")

if __name__ == "__main__":
    debug_rag_system()
