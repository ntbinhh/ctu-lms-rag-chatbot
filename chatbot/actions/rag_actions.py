"""
RAG Actions cho Rasa Chatbot
"""
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import sys
import os

# Import RAG bridge
try:
    from rag_bridge import rag_bridge
    RAG_AVAILABLE = True
    print("✅ RAG Bridge loaded successfully")
except ImportError as e:
    print(f"⚠️ RAG Bridge not available: {e}")
    RAG_AVAILABLE = False
    rag_bridge = None

class ActionRAGQuery(Action):
    """Action để xử lý câu hỏi qua RAG system"""
    
    def name(self) -> Text:
        return "action_rag_query"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            if not RAG_AVAILABLE or not rag_bridge:
                dispatcher.utter_message(text="❌ Hệ thống RAG không khả dụng. Vui lòng liên hệ admin.")
                return []
            
            # Lấy tin nhắn của user
            user_message = tracker.latest_message.get('text', '')
            
            if not user_message:
                dispatcher.utter_message(text="❓ Bạn có thể đặt câu hỏi cụ thể không?")
                return []
            
            print(f"🔍 Processing RAG query: {user_message}")
            
            # Thực hiện truy vấn RAG
            response = rag_bridge.query(user_message)
            
            # Gửi phản hồi
            dispatcher.utter_message(text=response)
            
            return []
            
        except Exception as e:
            print(f"❌ Error in ActionRAGQuery: {e}")
            dispatcher.utter_message(text="⚠️ Có lỗi xảy ra khi xử lý câu hỏi. Vui lòng thử lại sau.")
            return []

class ActionCheckRAGStatus(Action):
    """Action để kiểm tra trạng thái RAG system"""
    
    def name(self) -> Text:
        return "action_check_rag_status"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            if not RAG_AVAILABLE or not rag_bridge:
                dispatcher.utter_message(text="❌ RAG system không khả dụng")
                return []
            
            if rag_bridge.is_ready():
                dispatcher.utter_message(text="✅ RAG system đã sẵn sàng!")
            else:
                dispatcher.utter_message(text="⚠️ RAG system chưa sẵn sàng. Kiểm tra API key và knowledge base.")
            
            return []
            
        except Exception as e:
            print(f"❌ Error in ActionCheckRAGStatus: {e}")
            dispatcher.utter_message(text="⚠️ Có lỗi khi kiểm tra RAG system.")
            return []

class ActionRAGHelp(Action):
    """Action để hướng dẫn sử dụng RAG"""
    
    def name(self) -> Text:
        return "action_rag_help"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        help_text = """🤖 **Hệ thống RAG (Retrieval-Augmented Generation)**

📚 **Tôi có thể trả lời các câu hỏi về:**
- Quy định học tập và điểm số
- Học phí và các khoản thu
- Thủ tục xin học bổng
- Điều kiện tốt nghiệp
- Thông tin chung về trường
- Chương trình đào tạo

💡 **Ví dụ câu hỏi:**
- "Học phí một học kỳ là bao nhiêu?"
- "Quy định về điểm số như thế nào?"
- "Thủ tục xin học bổng?"
- "Điều kiện tốt nghiệp?"

❓ **Hãy đặt câu hỏi cụ thể để tôi có thể hỗ trợ bạn tốt nhất!**"""
        
        dispatcher.utter_message(text=help_text)
        return []
