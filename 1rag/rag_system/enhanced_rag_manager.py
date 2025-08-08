"""
RAG Manager - Handles document loading, indexing and retrieval
"""

import os
import logging
from pathlib import Path
from typing import List, Dict, Any
import glob

# Setup logging
logger = logging.getLogger(__name__)

class SimpleRAGManager:
    """Simple RAG manager using local documents and keyword matching"""
    
    def __init__(self, knowledge_base_path: str):
        self.knowledge_base_path = Path(knowledge_base_path)
        self.documents = {}
        self.load_documents()
    
    def load_documents(self):
        """Load all text documents from knowledge base"""
        try:
            logger.info(f"📚 Loading documents from: {self.knowledge_base_path}")
            
            # Find all .txt files recursively
            txt_files = glob.glob(str(self.knowledge_base_path / "**/*.txt"), recursive=True)
            
            for file_path in txt_files:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Get relative path for categorization
                    rel_path = Path(file_path).relative_to(self.knowledge_base_path)
                    category = rel_path.parts[0] if rel_path.parts else "general"
                    
                    self.documents[file_path] = {
                        'content': content,
                        'category': category,
                        'filename': Path(file_path).name,
                        'path': file_path
                    }
                    
                except Exception as e:
                    logger.warning(f"⚠️ Error loading {file_path}: {e}")
            
            logger.info(f"✅ Loaded {len(self.documents)} documents")
            
        except Exception as e:
            logger.error(f"❌ Error loading knowledge base: {e}")
    
    def search_documents(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Search documents using keyword matching"""
        try:
            query_lower = query.lower()
            
            # Score documents based on keyword matches
            scored_docs = []
            
            for doc_path, doc_info in self.documents.items():
                content_lower = doc_info['content'].lower()
                
                # Simple scoring based on keyword frequency
                score = 0
                
                # Split query into words and count matches
                query_words = query_lower.split()
                for word in query_words:
                    if len(word) > 2:  # Skip short words
                        score += content_lower.count(word)
                
                # Boost score for category matches
                if any(keyword in doc_info['category'] for keyword in ['hoc_phi', 'hoc_bong', 'quy_che', 'tuyen_sinh']):
                    if any(keyword in query_lower for keyword in ['học phí', 'học bổng', 'quy định', 'tuyển sinh']):
                        score += 5
                
                if score > 0:
                    scored_docs.append({
                        'document': doc_info,
                        'score': score,
                        'relevance': min(score / len(query_words), 10)  # Normalize score
                    })
            
            # Sort by score and return top_k
            scored_docs.sort(key=lambda x: x['score'], reverse=True)
            return scored_docs[:top_k]
            
        except Exception as e:
            logger.error(f"❌ Error searching documents: {e}")
            return []
    
    def get_relevant_context(self, query: str, max_length: int = 2000) -> str:
        """Get relevant context for query"""
        try:
            relevant_docs = self.search_documents(query, top_k=3)
            
            if not relevant_docs:
                return "Không tìm thấy thông tin liên quan trong cơ sở dữ liệu."
            
            context_parts = []
            current_length = 0
            
            for doc_result in relevant_docs:
                doc = doc_result['document']
                content = doc['content']
                
                # Truncate if needed
                if current_length + len(content) > max_length:
                    remaining = max_length - current_length
                    content = content[:remaining] + "..."
                
                context_parts.append(f"[{doc['category']} - {doc['filename']}]\n{content}")
                current_length += len(content)
                
                if current_length >= max_length:
                    break
            
            return "\n\n---\n\n".join(context_parts)
            
        except Exception as e:
            logger.error(f"❌ Error getting context: {e}")
            return "Lỗi khi tìm kiếm thông tin."


try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain.embeddings import HuggingFaceEmbeddings
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.vectorstores import FAISS
    from langchain.prompts import PromptTemplate
    from langchain.schema import Document
    
    class AdvancedRAGManager:
        """Advanced RAG manager using LangChain and vector embeddings"""
        
        def __init__(self, knowledge_base_path: str, google_api_key: str):
            self.knowledge_base_path = Path(knowledge_base_path)
            self.google_api_key = google_api_key
            self.vector_store = None
            self.embeddings = None
            self.llm = None
            self.text_splitter = None
            
            self.setup_components()
            self.load_and_index_documents()
        
        def setup_components(self):
            """Setup LangChain components"""
            try:
                # Initialize embeddings
                self.embeddings = HuggingFaceEmbeddings(
                    model_name="sentence-transformers/all-MiniLM-L6-v2",
                    model_kwargs={'device': 'cpu'},
                    encode_kwargs={'normalize_embeddings': True}
                )
                
                # Initialize LLM
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-1.5-flash",
                    google_api_key=self.google_api_key,
                    temperature=0.1,
                    max_output_tokens=512  # Giảm token để tiết kiệm quota
                )
                
                # Initialize text splitter
                self.text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=500,
                    chunk_overlap=50,
                    length_function=len,
                )
                
                logger.info("✅ LangChain components initialized")
                
            except Exception as e:
                logger.error(f"❌ Error setting up components: {e}")
                raise
        
        def load_and_index_documents(self):
            """Load documents and create vector index"""
            try:
                logger.info("📚 Loading and indexing documents...")
                
                # Find all .txt files
                txt_files = glob.glob(str(self.knowledge_base_path / "**/*.txt"), recursive=True)
                
                documents = []
                for file_path in txt_files:
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # Get metadata
                        rel_path = Path(file_path).relative_to(self.knowledge_base_path)
                        category = rel_path.parts[0] if rel_path.parts else "general"
                        
                        # Create document with metadata
                        doc = Document(
                            page_content=content,
                            metadata={
                                'source': file_path,
                                'category': category,
                                'filename': Path(file_path).name
                            }
                        )
                        documents.append(doc)
                        
                    except Exception as e:
                        logger.warning(f"⚠️ Error loading {file_path}: {e}")
                
                # Split documents into chunks
                logger.info("🔧 Splitting documents into chunks...")
                splits = self.text_splitter.split_documents(documents)
                
                # Create vector store
                logger.info("🔍 Creating vector embeddings...")
                self.vector_store = FAISS.from_documents(splits, self.embeddings)
                
                logger.info(f"✅ Indexed {len(splits)} document chunks from {len(documents)} files")
                
            except Exception as e:
                logger.error(f"❌ Error indexing documents: {e}")
                raise
        
        def search_documents(self, query: str, top_k: int = 5) -> List[Document]:
            """Search documents using vector similarity"""
            try:
                if not self.vector_store:
                    logger.error("Vector store not initialized")
                    return []
                
                logger.info(f"Searching for: '{query}' (top_k={top_k})")
                docs = self.vector_store.similarity_search(query, k=top_k)
                
                logger.info(f"Found {len(docs)} documents")
                for i, doc in enumerate(docs):
                    metadata = doc.metadata
                    preview = doc.page_content[:100].replace('\n', ' ')
                    logger.info(f"  Doc {i+1}: {metadata.get('filename', 'unknown')} - {preview}...")
                
                return docs
                
            except Exception as e:
                logger.error(f"❌ Error searching documents: {e}")
                return []
        
        def generate_response(self, query: str) -> str:
            """Generate response using RAG with quota management"""
            try:
                # Search for relevant documents
                relevant_docs = self.search_documents(query, top_k=3)  # Tăng lên 3 documents
                
                if not relevant_docs:
                    logger.warning(f"No relevant docs found for query: {query}")
                    return "Tôi không tìm thấy thông tin về vấn đề này trong cơ sở dữ liệu."
                
                # Prepare context with more content
                context_parts = []
                for i, doc in enumerate(relevant_docs[:3]):
                    doc_content = doc.page_content[:600]  
                    context_parts.append(f"[Tài liệu {i+1}]: {doc_content}")
                
                context = "\n\n".join(context_parts)
                
                # Log for debugging
                logger.info(f"Found {len(relevant_docs)} relevant docs for query: '{query}'")
                logger.info(f"Context length: {len(context)} characters")
                logger.debug(f"Context preview: {context[:200]}...")
                
                # Create improved prompt template
                prompt_template = PromptTemplate(
                    template="""Bạn là chatbot tư vấn của Trường Đại học Cần Thơ với kiến thức về quy định, chính sách và thông tin của trường. 
{context}

Sinh viên hỏi: {query}

Hãy trả lời một cách tự nhiên. Không đề cập đến việc "dựa trên thông tin được cung cấp" hay "từ cơ sở dữ liệu". Hãy nói như thể bạn tự biết thông tin đó.

- Trả lời bằng tiếng Việt tự nhiên và thân thiện
- Nếu không có thông tin liên quan, hãy nói "Mình chưa nắm rõ thông tin này, bạn có thể liên hệ phòng đào tạo để được hỗ trợ tốt nhất"
- Trả lời ngắn gọn nhưng đầy đủ thông tin

""",
                    input_variables=["context", "query"]
                )
                
                # Generate response
                prompt = prompt_template.format(context=context, query=query)
                response = self.llm.invoke(prompt)
                
                return response.content
                
            except Exception as e:
                logger.error(f"❌ Error generating response: {e}")
                
                # Handle quota errors specifically
                if "429" in str(e) or "quota" in str(e).lower():
                    return """🚫 **Đã vượt quota API**

⏰ **Vui lòng thử lại sau 1-2 phút**

📞 **Liên hệ hỗ trợ:**
- Phòng Đào tạo: [số điện thoại]
- Website: [địa chỉ website]
- Email: [email hỗ trợ]"""
                
                return f"Xin lỗi, đã có lỗi xảy ra: {str(e)[:100]}"

except ImportError as e:
    logger.warning(f"⚠️ LangChain dependencies not available: {e}")
    AdvancedRAGManager = None
