"""
Enhanced RAG Server with LangChain and Gemini
Provides HTTP API endpoint for RAG queries from chatbot
"""

import os
import sys
from pathlib import Path
from flask import Flask, request, jsonify
import logging

# Add current directory to path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Global RAG system instance
rag_manager = None

def initialize_rag():
    """Initialize RAG system with fallback"""
    global rag_manager
    
    try:
        # Get Google API key
        google_api_key = os.getenv("GOOGLE_API_KEY")
        knowledge_base_path = current_dir / "knowledge_base"
        
        if not knowledge_base_path.exists():
            raise FileNotFoundError(f"Knowledge base not found: {knowledge_base_path}")
        
        # Try advanced RAG with LangChain first
        try:
            from rag_system.enhanced_rag_manager import AdvancedRAGManager
            
            if google_api_key and AdvancedRAGManager:
                logger.info("🚀 Initializing Advanced RAG with LangChain and Gemini...")
                rag_manager = AdvancedRAGManager(
                    knowledge_base_path=str(knowledge_base_path),
                    google_api_key=google_api_key
                )
                logger.info("✅ Advanced RAG system initialized successfully")
                return True
            else:
                raise ImportError("Missing API key or LangChain dependencies")
                
        except Exception as e:
            logger.warning(f"⚠️ Advanced RAG failed, falling back to simple RAG: {e}")
            
            # Fallback to simple RAG
            from rag_system.enhanced_rag_manager import SimpleRAGManager
            
            rag_manager = SimpleRAGManager(knowledge_base_path=str(knowledge_base_path))
            logger.info("✅ Simple RAG system initialized as fallback")
            return True
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize any RAG system: {e}")
        rag_manager = None
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'rag_initialized': rag_manager is not None
    })

@app.route('/rag/query', methods=['POST'])
def rag_query():
    """RAG query endpoint"""
    try:
        data = request.json
        logger.info(f"📥 /rag/query received request: {data}")
        
        if not data or 'query' not in data:
            logger.warning("❌ Missing query parameter in request")
            return jsonify({
                'error': 'Missing query parameter'
            }), 400
        
        query = data['query']
        logger.info(f"🔍 Processing RAG query: {query}")
        
        if not rag_manager:
            logger.warning("⚠️ RAG manager not available, returning fallback")
            # Return error if no RAG system available
            return jsonify({
                'error': 'RAG system not available',
                'response': get_fallback_response(query),
                'source': 'fallback',
                'status': 'partial_success'
            }), 503
        
        # Process with RAG system
        try:
            # Check if it's advanced RAG manager
            if hasattr(rag_manager, 'generate_response'):
                logger.info("🤖 Using Advanced RAG manager")
                response = rag_manager.generate_response(query)
                source = 'advanced_rag'
            else:
                # Simple RAG manager
                logger.info("📄 Using Simple RAG manager")
                context = rag_manager.get_relevant_context(query)
                response = generate_simple_response(query, context)
                source = 'simple_rag'
            
            logger.info(f"✅ RAG response generated successfully (source: {source})")
            return jsonify({
                'response': response,
                'source': source,
                'status': 'success'
            })
            
        except Exception as e:
            logger.error(f"❌ Error in RAG processing: {e}")
            # Fallback to simple response
            fallback_response = get_fallback_response(query)
            return jsonify({
                'response': fallback_response,
                'source': 'fallback',
                'status': 'partial_success',
                'error': f"RAG error: {str(e)}"
            })
        
    except Exception as e:
        logger.error(f"❌ Error processing RAG query: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

def generate_simple_response(query: str, context: str) -> str:
    """Generate response using simple template with context"""
    if not context or "Không tìm thấy" in context:
        return get_fallback_response(query)
    
    # Simple template-based response
    response = f"""🤖 **Thông tin từ cơ sở dữ liệu trường:**

{context}

---

📞 **Cần thêm thông tin?**
- Liên hệ phòng Đào tạo để biết chi tiết
- Kiểm tra website chính thức của trường
- Gọi hotline hỗ trợ sinh viên

💡 **Lưu ý:** Thông tin có thể thay đổi theo quy định mới, vui lòng xác nhận với phòng ban liên quan."""

    return response

def get_fallback_response(query: str) -> str:
    """Enhanced fallback response when RAG is not available"""
    query_lower = query.lower()
    
    # Smart keyword-based responses
    if any(keyword in query_lower for keyword in ['học phí', 'chi phí', 'phí', 'tiền học']):
        return """💰 **Thông tin học phí:**

📋 **Cách tính học phí:**
- Học phí đóng theo học kỳ
- Tính theo tổng số tín chỉ đăng ký
- Mức phí do Hiệu trưởng quyết định

⚠️ **Lưu ý quan trọng:**
- Đóng học phí đúng hạn để tránh hủy kết quả
- Nợ phí 2 học kỳ liên tiếp sẽ bị buộc thôi học

📞 **Liên hệ:** Phòng Đào tạo để biết mức phí chính xác cho từng ngành."""
    
    elif any(keyword in query_lower for keyword in ['học bổng', 'hỗ trợ', 'miễn giảm', 'trợ cấp']):
        return """🎓 **Học bổng và hỗ trợ:**

🏆 **Các loại học bổng:**
- Học bổng khuyến khích học tập (theo kết quả học tập)
- Học bổng tài trợ (từ doanh nghiệp, tổ chức)
- Trợ cấp xã hội (dân tộc, mồ côi, tàn tật, hộ nghèo)

� **Điều kiện cơ bản:**
- Đăng ký tối thiểu 12 tín chỉ
- Kết quả học tập từ loại Khá trở lên
- Không có điểm F
- Không bị kỷ luật

� **Liên hệ:** Phòng Công tác Sinh viên"""
    
    elif any(keyword in query_lower for keyword in ['quy định', 'quy chế', 'điểm số', 'tốt nghiệp']):
        return """📋 **Quy định học tập:**

📊 **Thang điểm 10:**
- A+: 9.5-10 (Xuất sắc) | A: 8.5-9.4 (Giỏi)
- B+: 7.5-8.4 (Khá) | B: 6.5-7.4 (TB Khá)
- C+: 5.5-6.4 (TB) | C: 4.0-5.4 (TB Yếu)
- D: 2.0-3.9 (Yếu) | F: 0-1.9 (Kém)

🎓 **Điều kiện tốt nghiệp:**
- Hoàn thành đủ tín chỉ chương trình
- GPA tích lũy ≥ 2.0
- Không nợ môn bắt buộc

📞 **Liên hệ:** Phòng Đào tạo"""
    
    elif any(keyword in query_lower for keyword in ['chương trình', 'đào tạo', 'môn học', 'tín chỉ']):
        return """📚 **Chương trình đào tạo:**

🎯 **Các bậc đào tạo:**
- Cử nhân (4 năm): 120-140 tín chỉ
- Kỹ sư (5 năm): 150-170 tín chỉ

📖 **Cấu trúc chương trình:**
- Kiến thức đại cương: 30-40%
- Kiến thức cơ sở ngành: 25-30%
- Kiến thức chuyên ngành: 25-30%
- Thực tập/Đồ án: 10-15%

� **Liên hệ:** Phòng Đào tạo để xem CTĐT chi tiết"""
    
    else:
        return """🤖 **Xin chào! Tôi là trợ lý AI của Trường Đại học Cần Thơ**

� **Tôi có thể hỗ trợ bạn về:**
• 💰 Học phí và chi phí học tập
• 🎓 Học bổng và các hình thức hỗ trợ
• 📋 Quy định và quy chế đào tạo
• 📚 Chương trình đào tạo
• 📞 Thông tin liên hệ các phòng ban

💡 **Cách sử dụng:** Hãy hỏi tôi về bất kỳ chủ đề nào bạn quan tâm!

⚠️ **Lưu ý:** Hệ thống đang trong quá trình cập nhật để phục vụ tốt hơn."""

@app.route('/rag/status', methods=['GET'])
def rag_status():
    """Get RAG system status"""
    if rag_manager:
        status_info = {
            'status': 'ready',
            'type': 'advanced' if hasattr(rag_manager, 'generate_response') else 'simple',
            'knowledge_base': str(current_dir / "knowledge_base"),
            'documents_loaded': getattr(rag_manager, 'documents', None) is not None
        }
        return jsonify(status_info)
    else:
        return jsonify({
            'status': 'not_initialized',
            'type': 'none',
            'error': 'RAG manager not available'
        })

if __name__ == '__main__':
    # Initialize RAG system
    print("🚀 Initializing RAG Server...")
    success = initialize_rag()
    
    if success:
        print("✅ RAG system ready")
    else:
        print("⚠️ RAG system failed to initialize, using fallback responses")
    
    # Start server
    print("📍 Server starting on: http://localhost:5001")
    print("🔍 Health check: http://localhost:5001/health")
    print("❓ RAG query: POST http://localhost:5001/rag/query")
    print("📊 RAG status: http://localhost:5001/rag/status")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
