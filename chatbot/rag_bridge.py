"""
Cầu nối giữa Chatbot và RAG system
Kết nối Rasa actions với RAG server qua HTTP API
"""
import os
import sys
import requests
import json
from typing import Optional

class RAGBridge:
    def __init__(self):
        # RAG server URL - configurable via environment
        self.rag_server_url = os.getenv('RAG_SERVER_URL', 'http://localhost:5001')
        self.timeout = 30
        print(f"🔗 RAG Bridge initialized with server: {self.rag_server_url}")
        
    def _check_server_health(self) -> bool:
        """Kiểm tra RAG server có hoạt động không"""
        try:
            response = requests.get(f"{self.rag_server_url}/health", timeout=5)
            if response.status_code == 200:
                health_data = response.json()
                print(f"✅ RAG server health: {health_data}")
                return health_data.get('rag_initialized', False)
            else:
                print(f"❌ RAG server health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Cannot connect to RAG server: {e}")
            return False
    
    def query(self, question: str) -> str:
        """Gửi query tới RAG server và nhận response"""
        try:
            print(f"🔍 RAGBridge: Sending query to server: {question}")
            
            # Kiểm tra server trước khi gửi query
            if not self._check_server_health():
                return "❌ RAG server không khả dụng. Vui lòng thử lại sau."
            
            # Gửi POST request tới RAG server
            payload = {"query": question}
            response = requests.post(
                f"{self.rag_server_url}/rag/query",
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=self.timeout
            )
            
            print(f"📡 RAGBridge: Server response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                rag_response = data.get('response', 'Không có phản hồi từ server')
                source = data.get('source', 'unknown')
                status = data.get('status', 'unknown')
                
                print(f"✅ RAGBridge: Response received from {source} (status: {status})")
                return rag_response
                
            elif response.status_code == 503:
                # Server hoạt động nhưng RAG system không sẵn sàng
                data = response.json()
                fallback_response = data.get('response', self._get_fallback_response(question))
                print(f"⚠️ RAGBridge: Using fallback response (RAG system not ready)")
                return fallback_response
                
            else:
                print(f"❌ RAGBridge: Server error {response.status_code}: {response.text}")
                return self._get_fallback_response(question)
                
        except requests.exceptions.Timeout:
            print(f"⏱️ RAGBridge: Timeout connecting to RAG server")
            return "⏱️ Timeout khi kết nối tới hệ thống RAG. Vui lòng thử lại."
            
        except requests.exceptions.ConnectionError:
            print(f"🔌 RAGBridge: Cannot connect to RAG server at {self.rag_server_url}")
            return f"🔌 Không thể kết nối tới RAG server tại {self.rag_server_url}. Vui lòng kiểm tra server."
            
        except Exception as e:
            print(f"❌ RAGBridge: Unexpected error: {e}")
            return f"⚠️ Lỗi không mong muốn: {str(e)}"
    
    def _get_fallback_response(self, query: str) -> str:
        """Response dự phòng khi không kết nối được RAG server"""
        query_lower = query.lower()
        
        if any(keyword in query_lower for keyword in ['học phí', 'chi phí', 'phí', 'tiền học']):
            return """💰 **Thông tin học phí cơ bản:**

📋 **Nguyên tắc tính học phí:**
- Học phí tính theo tín chỉ đăng ký mỗi học kỳ
- Mức phí do Hiệu trưởng quyết định hàng năm

⚠️ **Lưu ý quan trọng:**
- Phải đóng học phí đúng hạn để tránh hủy kết quả học tập
- Nợ học phí 2 học kỳ liên tiếp có thể bị buộc thôi học

📞 **Liên hệ:** Phòng Đào tạo để biết mức học phí chính xác cho từng ngành."""
        
        return """🤖 **Xin lỗi, hệ thống RAG tạm thời không khả dụng.**

📞 **Để được hỗ trợ tốt nhất, vui lòng liên hệ:**
• Phòng Đào tạo: thông tin học tập, chương trình đào tạo
• Phòng Công tác Sinh viên: học bổng, hỗ trợ sinh viên
• Hotline sinh viên: 0292.3831.301

🔄 **Hệ thống sẽ sớm được khôi phục.**"""
    
    def is_ready(self) -> bool:
        """Kiểm tra RAG system đã sẵn sàng"""
        return self._check_server_health()

# Global instance
rag_bridge = RAGBridge()
