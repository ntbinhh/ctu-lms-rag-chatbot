"""
RAG Manager - Handles document loading, indexing and retrieval
"""

import os
import logging
from pathlib import Path
from typing import List, Dict, Any
import glob
import hashlib
import json
import time
from dotenv import load_dotenv

# Load environment variables from parent directory
load_dotenv(Path(__file__).parent.parent / '.env')

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
            
            # Find all .txt and .pdf files recursively
            txt_files = glob.glob(str(self.knowledge_base_path / "**/*.txt"), recursive=True)
            pdf_files = glob.glob(str(self.knowledge_base_path / "**/*.pdf"), recursive=True)
            
            logger.info(f"📄 Found {len(txt_files)} TXT and {len(pdf_files)} PDF files")
            
            # Load TXT files
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
                        'path': file_path,
                        'file_type': 'txt'
                    }
                    
                except Exception as e:
                    logger.warning(f"⚠️ Error loading TXT {file_path}: {e}")
            
            # Load PDF files (basic text extraction)
            for file_path in pdf_files:
                try:
                    # Try to use PyPDF2 for basic text extraction
                    try:
                        import PyPDF2
                        with open(file_path, 'rb') as f:
                            reader = PyPDF2.PdfReader(f)
                            content = ""
                            for page in reader.pages:
                                content += page.extract_text() + "\n"
                    except ImportError:
                        logger.warning(f"⚠️ PyPDF2 not available, skipping PDF {file_path}")
                        continue
                    except Exception as e:
                        logger.warning(f"⚠️ Error extracting text from PDF {file_path}: {e}")
                        continue
                    
                    if content.strip():  # Only add if we extracted some content
                        # Get relative path for categorization
                        rel_path = Path(file_path).relative_to(self.knowledge_base_path)
                        category = rel_path.parts[0] if rel_path.parts else "general"
                        
                        self.documents[file_path] = {
                            'content': content,
                            'category': category,
                            'filename': Path(file_path).name,
                            'path': file_path,
                            'file_type': 'pdf'
                        }
                    
                except Exception as e:
                    logger.warning(f"⚠️ Error loading PDF {file_path}: {e}")
            
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
    from langchain.document_loaders import PyPDFLoader, TextLoader
    
    class AdvancedRAGManager:
        """Advanced RAG manager using LangChain and vector embeddings"""
        
        def __init__(self, knowledge_base_path: str, google_api_key: str):
            self.knowledge_base_path = Path(knowledge_base_path)
            self.google_api_key = google_api_key
            self.vector_store = None
            self.embeddings = None
            self.llm = None
            self.text_splitter = None
            
            # Auto-reload configuration
            self.vector_store_path = Path("data/vector_store")
            self.hash_file_path = Path("data/knowledge_hash.json")
            
            self.setup_components()
            self.auto_load_with_check()
        
        def calculate_knowledge_base_hash(self) -> Dict[str, str]:
            """Calculate hash of all files in knowledge base"""
            try:
                files_hash = {}
                # Support both TXT and PDF files
                txt_files = glob.glob(str(self.knowledge_base_path / "**/*.txt"), recursive=True)
                pdf_files = glob.glob(str(self.knowledge_base_path / "**/*.pdf"), recursive=True)
                all_files = txt_files + pdf_files
                
                for file_path in all_files:
                    try:
                        with open(file_path, 'rb') as f:
                            file_content = f.read()
                        file_hash = hashlib.md5(file_content).hexdigest()
                        rel_path = str(Path(file_path).relative_to(self.knowledge_base_path))
                        files_hash[rel_path] = file_hash
                    except Exception as e:
                        logger.warning(f"⚠️ Error hashing {file_path}: {e}")
                
                logger.info(f"📊 Calculated hash for {len(files_hash)} files ({len(txt_files)} TXT, {len(pdf_files)} PDF)")
                return files_hash
                
            except Exception as e:
                logger.error(f"❌ Error calculating knowledge base hash: {e}")
                return {}
        
        def save_knowledge_hash(self, files_hash: Dict[str, str]):
            """Save knowledge base hash to file"""
            try:
                self.hash_file_path.parent.mkdir(parents=True, exist_ok=True)
                with open(self.hash_file_path, 'w') as f:
                    json.dump(files_hash, f, indent=2)
                logger.info(f"💾 Saved knowledge hash to {self.hash_file_path}")
            except Exception as e:
                logger.error(f"❌ Error saving hash: {e}")
        
        def load_knowledge_hash(self) -> Dict[str, str]:
            """Load saved knowledge base hash"""
            try:
                if self.hash_file_path.exists():
                    with open(self.hash_file_path, 'r') as f:
                        return json.load(f)
                return {}
            except Exception as e:
                logger.warning(f"⚠️ Error loading hash: {e}")
                return {}
        
        def check_knowledge_base_changes(self) -> bool:
            """Check if knowledge base has changed since last indexing"""
            try:
                current_hash = self.calculate_knowledge_base_hash()
                saved_hash = self.load_knowledge_hash()
                
                if not saved_hash:
                    logger.info("🆕 No previous hash found, need to build index")
                    return True
                
                if current_hash != saved_hash:
                    logger.info("🔄 Knowledge base changed, need to rebuild index")
                    
                    # Log what changed
                    added_files = set(current_hash.keys()) - set(saved_hash.keys())
                    removed_files = set(saved_hash.keys()) - set(current_hash.keys())
                    modified_files = {f for f in current_hash if f in saved_hash and current_hash[f] != saved_hash[f]}
                    
                    if added_files:
                        logger.info(f"  ➕ Added files: {list(added_files)}")
                    if removed_files:
                        logger.info(f"  ➖ Removed files: {list(removed_files)}")
                    if modified_files:
                        logger.info(f"  ✏️ Modified files: {list(modified_files)}")
                    
                    return True
                
                logger.info("✅ Knowledge base unchanged, can use cached index")
                return False
                
            except Exception as e:
                logger.error(f"❌ Error checking changes: {e}")
                return True  # Rebuild on error
        
        def load_cached_vector_store(self) -> bool:
            """Load vector store from cache if available"""
            try:
                if self.vector_store_path.exists():
                    logger.info(f"📂 Loading cached vector store from {self.vector_store_path}")
                    self.vector_store = FAISS.load_local(
                        str(self.vector_store_path), 
                        self.embeddings,
                        allow_dangerous_deserialization=True
                    )
                    logger.info("✅ Cached vector store loaded successfully")
                    return True
                else:
                    logger.info("📂 No cached vector store found")
                    return False
                    
            except Exception as e:
                logger.error(f"❌ Error loading cached vector store: {e}")
                return False
        
        def save_vector_store(self):
            """Save vector store to cache"""
            try:
                if self.vector_store:
                    self.vector_store_path.parent.mkdir(parents=True, exist_ok=True)
                    self.vector_store.save_local(str(self.vector_store_path))
                    logger.info(f"💾 Vector store saved to {self.vector_store_path}")
            except Exception as e:
                logger.error(f"❌ Error saving vector store: {e}")
        
        def auto_load_with_check(self):
            """Auto-load with change detection"""
            try:
                # Check if knowledge base has changed
                needs_rebuild = self.check_knowledge_base_changes()
                
                if not needs_rebuild:
                    # Try to load cached vector store
                    if self.load_cached_vector_store():
                        logger.info("🚀 Using cached vector store (knowledge base unchanged)")
                        return
                    else:
                        logger.info("📂 Cache not found, need to rebuild")
                        needs_rebuild = True
                
                if needs_rebuild:
                    # Clear old cache
                    if self.vector_store_path.exists():
                        import shutil
                        shutil.rmtree(self.vector_store_path)
                        logger.info("🗑️ Cleared old vector store cache")
                    
                    # Build new index
                    logger.info("🔨 Building new vector store index...")
                    self.load_and_index_documents()
                    
                    # Save new cache and hash
                    self.save_vector_store()
                    current_hash = self.calculate_knowledge_base_hash()
                    self.save_knowledge_hash(current_hash)
                    
                    logger.info("✅ Auto-reload completed successfully")
                
            except Exception as e:
                logger.error(f"❌ Error in auto-load: {e}")
                # Fallback to normal load
                logger.info("🔄 Falling back to normal document loading...")
                self.load_and_index_documents()
        
        def setup_components(self):
            """Setup LangChain components"""
            try:
                # Get embedding model from environment variable
                embedding_model = os.getenv('EMBEDDINGS_MODEL', 'keepitreal/vietnamese-sbert')
                logger.info(f"🤖 Using embedding model: {embedding_model}")
                
                # Initialize embeddings
                self.embeddings = HuggingFaceEmbeddings(
                    model_name=embedding_model,
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
                
                # Find all .txt and .pdf files
                txt_files = glob.glob(str(self.knowledge_base_path / "**/*.txt"), recursive=True)
                pdf_files = glob.glob(str(self.knowledge_base_path / "**/*.pdf"), recursive=True)
                
                logger.info(f"📄 Found {len(txt_files)} TXT and {len(pdf_files)} PDF files")
                
                documents = []
                
                # Load TXT files
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
                                'filename': Path(file_path).name,
                                'file_type': 'txt'
                            }
                        )
                        documents.append(doc)
                        
                    except Exception as e:
                        logger.warning(f"⚠️ Error loading TXT {file_path}: {e}")
                
                # Load PDF files using PyPDFLoader
                for file_path in pdf_files:
                    try:
                        loader = PyPDFLoader(file_path)
                        pdf_docs = loader.load()
                        
                        # Get metadata
                        rel_path = Path(file_path).relative_to(self.knowledge_base_path)
                        category = rel_path.parts[0] if rel_path.parts else "general"
                        
                        # Update metadata for each page
                        for i, doc in enumerate(pdf_docs):
                            doc.metadata.update({
                                'source': file_path,
                                'category': category,
                                'filename': Path(file_path).name,
                                'file_type': 'pdf',
                                'page': i + 1
                            })
                        
                        documents.extend(pdf_docs)
                        logger.info(f"📄 Loaded PDF {Path(file_path).name} with {len(pdf_docs)} pages")
                        
                    except Exception as e:
                        logger.warning(f"⚠️ Error loading PDF {file_path}: {e}")
                
                if not documents:
                    raise ValueError("No documents loaded. Check knowledge base path and file formats.")
                
                # Split documents into chunks
                logger.info("🔧 Splitting documents into chunks...")
                splits = self.text_splitter.split_documents(documents)
                
                # Create vector store
                logger.info("🔍 Creating vector embeddings...")
                self.vector_store = FAISS.from_documents(splits, self.embeddings)
                
                logger.info(f"✅ Indexed {len(splits)} document chunks from {len(documents)} documents ({len(txt_files)} TXT, {len(pdf_files)} PDF)")
                
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
                relevant_docs = self.search_documents(query, top_k=5)  
                
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
        
        def reload_knowledge_base(self, force_rebuild: bool = True) -> bool:
            """Reload knowledge base with optional force rebuild"""
            try:
                logger.info(f"🔄 Reloading knowledge base (force_rebuild={force_rebuild})")
                
                if force_rebuild:
                    # Clear cache
                    if self.vector_store_path.exists():
                        import shutil
                        shutil.rmtree(self.vector_store_path)
                        logger.info("🗑️ Cleared vector store cache")
                    
                    if self.hash_file_path.exists():
                        self.hash_file_path.unlink()
                        logger.info("🗑️ Cleared knowledge hash")
                
                # Reload with auto-check
                self.auto_load_with_check()
                
                return self.vector_store is not None
                
            except Exception as e:
                logger.error(f"❌ Error reloading knowledge base: {e}")
                return False
        
        def get_index_stats(self) -> Dict[str, Any]:
            """Get statistics about the current index"""
            try:
                stats = {
                    "vector_store_exists": self.vector_store is not None,
                    "knowledge_base_path": str(self.knowledge_base_path),
                    "cache_path": str(self.vector_store_path),
                    "cache_exists": self.vector_store_path.exists(),
                    "hash_file_exists": self.hash_file_path.exists(),
                }
                
                if self.vector_store:
                    stats["total_vectors"] = self.vector_store.index.ntotal
                
                # Count files in knowledge base
                txt_files = glob.glob(str(self.knowledge_base_path / "**/*.txt"), recursive=True)
                pdf_files = glob.glob(str(self.knowledge_base_path / "**/*.pdf"), recursive=True)
                stats["total_files"] = len(txt_files) + len(pdf_files)
                stats["txt_files"] = len(txt_files)
                stats["pdf_files"] = len(pdf_files)
                
                # Get last modified times
                if self.vector_store_path.exists():
                    stats["cache_modified"] = time.ctime(self.vector_store_path.stat().st_mtime)
                
                if self.hash_file_path.exists():
                    stats["hash_modified"] = time.ctime(self.hash_file_path.stat().st_mtime)
                
                return stats
                
            except Exception as e:
                logger.error(f"❌ Error getting index stats: {e}")
                return {"error": str(e)}

except ImportError as e:
    logger.warning(f"⚠️ LangChain dependencies not available: {e}")
    AdvancedRAGManager = None
