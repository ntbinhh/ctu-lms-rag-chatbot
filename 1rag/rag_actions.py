"""
Custom Rasa Action for RAG Integration
Integrates the RAG system with Rasa chatbot for enhanced question answering
"""

import os
import sys
import logging
from typing import Any, Text, Dict, List
from pathlib import Path

# Add chatbot directory to path
chatbot_dir = Path(__file__).parent
sys.path.append(str(chatbot_dir))

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ActionRAGQuery(Action):
    """
    Custom Rasa Action for RAG-based question answering
    """
    
    def __init__(self):
        super().__init__()
        self.rag_system = None
        self._initialize_rag()
    
    def name(self) -> Text:
        return "action_rag_query"
    
    def _initialize_rag(self):
        """Initialize RAG system with fallback handling"""
        try:
            # Try to import and initialize RAG system
            from rasa_rag_integration import RasaRAGAction
            
            self.rag_system = RasaRAGAction()
            logger.info("✅ RAG system initialized for Rasa action")
            
        except ImportError as e:
            logger.warning(f"⚠️ RAG dependencies not available: {e}")
            self.rag_system = None
        except Exception as e:
            logger.error(f"❌ Failed to initialize RAG system: {e}")
            self.rag_system = None
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            # Get user message
            user_message = tracker.latest_message.get('text', '')
            
            if not user_message:
                dispatcher.utter_message(text="Xin lỗi, tôi không nhận được câu hỏi của bạn.")
                return []
            
            # Check if RAG system is available
            if not self.rag_system:
                # Fallback to simple response
                fallback_response = self._get_fallback_response(user_message)
                dispatcher.utter_message(text=fallback_response)
                return []
            
            # Process through RAG system
            logger.info(f"🔍 Processing RAG query: {user_message}")
            
            rag_response = self.rag_system.process_rag_query(
                user_message, 
                use_conversation=True
            )
            
            # Send response
            dispatcher.utter_message(text=rag_response)
            
            # Set slot with RAG status
            return [SlotSet("rag_used", True)]
            
        except Exception as e:
            logger.error(f"❌ RAG action failed: {e}")
            
            # Fallback response
            fallback_response = "Xin lỗi, tôi đang gặp một số khó khăn kỹ thuật. Bạn có thể thử hỏi lại không?"
            dispatcher.utter_message(text=fallback_response)
            
            return [SlotSet("rag_used", False)]
    
    def _get_fallback_response(self, user_message: str) -> str:
        """Provide fallback responses when RAG is not available"""
        
        # Simple keyword-based responses
        message_lower = user_message.lower()
        
        if any(keyword in message_lower for keyword in ['học phí', 'chi phí', 'phí']):
            return ("Về học phí, bạn có thể liên hệ phòng Đào tạo để được tư vấn chi tiết. "
                   "Thông tin liên hệ có trong website của trường.")
        
        elif any(keyword in message_lower for keyword in ['chương trình', 'ngành', 'đào tạo']):
            return ("Trường có nhiều chương trình đào tạo khác nhau. "
                   "Bạn có thể xem thông tin chi tiết trên website hoặc liên hệ phòng Đào tạo.")
        
        elif any(keyword in message_lower for keyword in ['lịch', 'thời gian', 'giờ học']):
            return ("Về lịch học và thời gian, bạn có thể kiểm tra trên hệ thống quản lý học tập "
                   "hoặc liên hệ với phòng Đào tạo để được hỗ trợ.")
        
        elif any(keyword in message_lower for keyword in ['liên hệ', 'địa chỉ', 'email', 'điện thoại']):
            return ("Bạn có thể liên hệ với trường qua:\n"
                   "- Website chính thức của trường\n"
                   "- Phòng Đào tạo\n"
                   "- Hotline hỗ trợ sinh viên")
        
        else:
            return ("Cảm ơn bạn đã hỏi. Tôi sẽ cố gắng tìm hiểu và trả lời bạn. "
                   "Bạn có thể liên hệ trực tiếp với phòng Đào tạo để được hỗ trợ chi tiết hơn.")


class ActionRAGSimpleQuery(Action):
    """
    Custom Rasa Action for simple RAG queries (without conversation context)
    """
    
    def __init__(self):
        super().__init__()
        self.rag_system = None
        self._initialize_rag()
    
    def name(self) -> Text:
        return "action_rag_simple_query"
    
    def _initialize_rag(self):
        """Initialize RAG system"""
        try:
            from rasa_rag_integration import RasaRAGAction
            self.rag_system = RasaRAGAction()
            logger.info("✅ RAG system initialized for simple query action")
        except Exception as e:
            logger.error(f"❌ Failed to initialize RAG system: {e}")
            self.rag_system = None
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            user_message = tracker.latest_message.get('text', '')
            
            if not user_message or not self.rag_system:
                dispatcher.utter_message(text="Xin lỗi, tôi không thể xử lý câu hỏi này.")
                return []
            
            # Process through RAG system (simple query without conversation context)
            rag_response = self.rag_system.process_rag_query(
                user_message, 
                use_conversation=False
            )
            
            dispatcher.utter_message(text=rag_response)
            return [SlotSet("rag_used", True)]
            
        except Exception as e:
            logger.error(f"❌ Simple RAG action failed: {e}")
            dispatcher.utter_message(text="Xin lỗi, tôi không thể trả lời câu hỏi này.")
            return [SlotSet("rag_used", False)]


class ActionResetRAGConversation(Action):
    """
    Custom Rasa Action to reset RAG conversation memory
    """
    
    def __init__(self):
        super().__init__()
        self.rag_system = None
        self._initialize_rag()
    
    def name(self) -> Text:
        return "action_reset_rag_conversation"
    
    def _initialize_rag(self):
        """Initialize RAG system"""
        try:
            from rasa_rag_integration import RasaRAGAction
            self.rag_system = RasaRAGAction()
        except Exception as e:
            logger.error(f"❌ Failed to initialize RAG system: {e}")
            self.rag_system = None
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            if self.rag_system:
                self.rag_system.reset_conversation()
                dispatcher.utter_message(text="Đã làm mới cuộc trò chuyện. Bạn có thể bắt đầu hỏi câu hỏi mới.")
            else:
                dispatcher.utter_message(text="Cuộc trò chuyện đã được làm mới.")
            
            return [SlotSet("conversation_reset", True)]
            
        except Exception as e:
            logger.error(f"❌ Reset conversation failed: {e}")
            dispatcher.utter_message(text="Đã xảy ra lỗi khi làm mới cuộc trò chuyện.")
            return []


class ActionRAGHelp(Action):
    """
    Custom Rasa Action to provide help information about RAG capabilities
    """
    
    def name(self) -> Text:
        return "action_rag_help"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        help_message = """
🤖 **Hướng dẫn sử dụng chatbot**

Tôi có thể giúp bạn trả lời các câu hỏi về:

📚 **Chương trình đào tạo:**
- Các ngành học có tại trường
- Thời gian đào tạo
- Kế hoạch học tập

💰 **Học phí và chi phí:**
- Mức học phí các ngành
- Các khoản phí khác
- Chính sách hỗ trợ

📅 **Lịch học và thời gian:**
- Lịch học các môn
- Thời gian biểu
- Lịch thi và kiểm tra

📞 **Thông tin liên hệ:**
- Địa chỉ trường
- Số điện thoại các phòng ban
- Email liên hệ

**Cách sử dụng:**
- Hỏi trực tiếp câu hỏi của bạn
- Tôi sẽ tìm kiếm trong cơ sở dữ liệu để trả lời
- Bạn có thể hỏi tiếp các câu hỏi liên quan

Hãy thử hỏi tôi bất kỳ điều gì bạn muốn biết! 😊
"""
        
        dispatcher.utter_message(text=help_message)
        return []


# Additional utility actions

class ActionCheckRAGStatus(Action):
    """
    Custom Rasa Action to check RAG system status
    """
    
    def name(self) -> Text:
        return "action_check_rag_status"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            from rasa_rag_integration import RasaRAGAction
            
            rag_action = RasaRAGAction()
            
            if rag_action.rag_system:
                info = rag_action.rag_system.get_system_info()
                
                status_message = f"""
🔧 **Trạng thái hệ thống RAG:**

✅ **Thành phần đã sẵn sàng:**
- Embedding Model: {'✅' if info['embedding_model_loaded'] else '❌'}
- Generation LLM: {'✅' if info['generation_llm_loaded'] else '❌'}
- Vector Database: {'✅' if info['vector_db_loaded'] else '❌'}
- QA Chain: {'✅' if info['qa_chain_ready'] else '❌'}
- Conversational Chain: {'✅' if info['conversational_chain_ready'] else '❌'}

📁 **Đường dẫn:**
- Knowledge Base: {info['knowledge_base_path']}
- Models: {info['models_path']}
- Vector DB: {info['vector_db_path']}

Hệ thống đang hoạt động bình thường! 🚀
"""
                dispatcher.utter_message(text=status_message)
            else:
                dispatcher.utter_message(text="❌ Hệ thống RAG chưa sẵn sàng. Vui lòng kiểm tra cấu hình.")
            
        except Exception as e:
            logger.error(f"❌ Status check failed: {e}")
            dispatcher.utter_message(text=f"❌ Không thể kiểm tra trạng thái hệ thống: {str(e)}")
        
        return []


# Export all actions for Rasa
__all__ = [
    'ActionRAGQuery',
    'ActionRAGSimpleQuery', 
    'ActionResetRAGConversation',
    'ActionRAGHelp',
    'ActionCheckRAGStatus'
]
