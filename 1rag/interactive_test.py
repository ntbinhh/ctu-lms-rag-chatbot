"""
Interactive RAG Tester - Nhập câu hỏi để test RAG system
"""

import requests
import json
import time
import sys
from datetime import datetime

class InteractiveRAGTester:
    def __init__(self, server_url="http://localhost:5001"):
        self.server_url = server_url
        self.session_start = datetime.now()
        self.question_count = 0
        
    def check_server_health(self):
        """Kiểm tra server có hoạt động không"""
        try:
            response = requests.get(f"{self.server_url}/health", timeout=5)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Server hoạt động bình thường")
                print(f"📊 RAG initialized: {result.get('rag_initialized', False)}")
                return True
            else:
                print(f"⚠️ Server response code: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            print("❌ Không thể kết nối đến server!")
            print("💡 Hãy chạy: python rag_server.py")
            return False
        except Exception as e:
            print(f"❌ Lỗi kiểm tra server: {e}")
            return False
    
    def get_rag_status(self):
        """Lấy thông tin trạng thái RAG system"""
        try:
            response = requests.get(f"{self.server_url}/rag/status", timeout=5)
            if response.status_code == 200:
                result = response.json()
                print(f"🤖 RAG Type: {result.get('type', 'unknown')}")
                print(f"📈 Status: {result.get('status', 'unknown')}")
                if result.get('documents_loaded'):
                    print("📚 Documents: Loaded")
                return result
        except Exception as e:
            print(f"⚠️ Không thể lấy RAG status: {e}")
        return None
    
    def ask_question(self, question):
        """Gửi câu hỏi đến RAG system"""
        try:
            print(f"\n❓ Đang xử lý: {question}")
            print("⏳ Chờ phản hồi...")
            
            start_time = time.time()
            
            response = requests.post(
                f"{self.server_url}/rag/query",
                json={"query": question},
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            end_time = time.time()
            response_time = end_time - start_time
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"\n🤖 **Trả lời từ {result.get('source', 'unknown')}:**")
                print("=" * 60)
                print(result.get('response', 'Không có phản hồi'))
                print("=" * 60)
                print(f"⏱️ Thời gian phản hồi: {response_time:.2f}s")
                print(f"📊 Status: {result.get('status', 'unknown')}")
                
                if result.get('error'):
                    print(f"⚠️ Error: {result.get('error')}")
                
                return True
                
            else:
                print(f"❌ Lỗi server: {response.status_code}")
                print(f"📝 Response: {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            print("⏰ Timeout! Server phản hồi quá lâu (>30s)")
            return False
        except Exception as e:
            print(f"❌ Lỗi khi gửi câu hỏi: {e}")
            return False
    
    def show_sample_questions(self):
        """Hiển thị câu hỏi mẫu"""
        sample_questions = [
            "Học phí của trường như thế nào?",
            "Có những học bổng nào?",
            "Điều kiện để tốt nghiệp là gì?",
            "Làm thế nào để đăng ký học lại?",
            "Quy định về điểm số ra sao?",
            "Thông tin tuyển sinh 2025",
            "Chương trình đào tạo CNTT",
            "Nội quy sinh viên",
            "Đào tạo từ xa có những ngành nào?",
            "Lệ phí xét tuyển bao nhiêu?"
        ]
        
        print("\n💡 **Gợi ý câu hỏi:**")
        for i, q in enumerate(sample_questions, 1):
            print(f"  {i:2d}. {q}")
        print("\n📝 Hoặc nhập câu hỏi tùy ý của bạn...")
    
    def show_commands(self):
        """Hiển thị các lệnh có thể dùng"""
        print("\n🔧 **Lệnh đặc biệt:**")
        print("  📋 'samples' - Xem câu hỏi mẫu")
        print("  📊 'status'  - Kiểm tra trạng thái RAG")
        print("  🔍 'health'  - Kiểm tra server")
        print("  📈 'stats'   - Thống kê phiên làm việc")
        print("  ❌ 'quit' hoặc 'exit' - Thoát")
        print("  💡 'help'    - Hiện menu này")
    
    def show_stats(self):
        """Hiển thị thống kê phiên làm việc"""
        session_time = datetime.now() - self.session_start
        print(f"\n📈 **Thống kê phiên làm việc:**")
        print(f"⏰ Thời gian: {session_time}")
        print(f"❓ Số câu hỏi: {self.question_count}")
        print(f"🌐 Server: {self.server_url}")
    
    def run(self):
        """Chạy interactive tester"""
        print("🎓 **RAG Interactive Tester - Đại học Cần Thơ**")
        print("=" * 60)
        
        # Kiểm tra server
        if not self.check_server_health():
            return
        
        # Lấy thông tin RAG
        self.get_rag_status()
        
        # Hiển thị hướng dẫn
        self.show_commands()
        self.show_sample_questions()
        
        print(f"\n🚀 **Sẵn sàng! Nhập câu hỏi của bạn:**")
        print("(Gõ 'help' để xem trợ giúp)")
        
        while True:
            try:
                # Nhập câu hỏi
                question = input(f"\n[{self.question_count + 1}] 👤 Bạn: ").strip()
                
                if not question:
                    continue
                
                # Xử lý lệnh đặc biệt
                if question.lower() in ['quit', 'exit', 'q']:
                    print("\n👋 Cảm ơn bạn đã sử dụng RAG Tester!")
                    self.show_stats()
                    break
                
                elif question.lower() == 'help':
                    self.show_commands()
                    continue
                
                elif question.lower() == 'samples':
                    self.show_sample_questions()
                    continue
                
                elif question.lower() == 'status':
                    self.get_rag_status()
                    continue
                
                elif question.lower() == 'health':
                    self.check_server_health()
                    continue
                
                elif question.lower() == 'stats':
                    self.show_stats()
                    continue
                
                # Xử lý câu hỏi bình thường
                self.question_count += 1
                success = self.ask_question(question)
                
                if success:
                    print("\n✅ Hoàn thành!")
                else:
                    print("\n❌ Có lỗi xảy ra!")
                
            except KeyboardInterrupt:
                print(f"\n\n⚠️ Đã dừng bởi người dùng (Ctrl+C)")
                self.show_stats()
                break
            except EOFError:
                print(f"\n\n👋 Tạm biệt!")
                break
            except Exception as e:
                print(f"\n❌ Lỗi không mong muốn: {e}")

def main():
    """Main function"""
    # Cho phép custom server URL
    server_url = "http://localhost:5001"
    
    if len(sys.argv) > 1:
        server_url = sys.argv[1]
        print(f"🌐 Sử dụng custom server: {server_url}")
    
    tester = InteractiveRAGTester(server_url)
    tester.run()

if __name__ == "__main__":
    main()
