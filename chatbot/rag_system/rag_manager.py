import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader, TextLoader
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from config.gemini_config import GeminiConfig
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGManager:
    def __init__(self):
        self.config = GeminiConfig()
        self.llm = None
        self.vector_store = None
        self.qa_chain = None
        self._initialize_components()
    
    def _initialize_components(self):
        """Khởi tạo các thành phần RAG"""
        try:
            # Kiểm tra API key
            if not self.config.GOOGLE_API_KEY or self.config.GOOGLE_API_KEY == "your_gemini_api_key_here":
                logger.warning("Gemini API key not configured properly")
                return
            
            # Khởi tạo Gemini LLM
            self.llm = ChatGoogleGenerativeAI(
                model=self.config.MODEL_NAME,
                google_api_key=self.config.GOOGLE_API_KEY,
                temperature=self.config.TEMPERATURE,
                max_output_tokens=self.config.MAX_OUTPUT_TOKENS
            )
            
            # Khởi tạo embeddings
            self.embeddings = HuggingFaceEmbeddings(
                model_name=self.config.EMBEDDINGS_MODEL
            )
            
            # Load vector store nếu có
            self._load_vector_store()
            
            logger.info("RAG Manager initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing RAG Manager: {e}")
    
    def _load_vector_store(self):
        """Load vector store từ file nếu có"""
        try:
            if os.path.exists(self.config.VECTOR_STORE_PATH):
                self.vector_store = FAISS.load_local(
                    self.config.VECTOR_STORE_PATH, 
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
                self._setup_qa_chain()
                logger.info("Vector store loaded successfully")
            else:
                logger.info("No existing vector store found")
        except Exception as e:
            logger.error(f"Error loading vector store: {e}")
    
    def load_knowledge_base(self, knowledge_base_path):
        """Load và process knowledge base"""
        try:
            documents = []
            
            if not os.path.exists(knowledge_base_path):
                logger.error(f"Knowledge base path does not exist: {knowledge_base_path}")
                return False
            
            # Load documents từ folder
            for filename in os.listdir(knowledge_base_path):
                file_path = os.path.join(knowledge_base_path, filename)
                
                if os.path.isfile(file_path):
                    if filename.endswith('.pdf'):
                        try:
                            loader = PyPDFLoader(file_path)
                            documents.extend(loader.load())
                        except Exception as e:
                            logger.warning(f"Error loading PDF {filename}: {e}")
                    elif filename.endswith('.txt'):
                        try:
                            loader = TextLoader(file_path, encoding='utf-8')
                            documents.extend(loader.load())
                        except Exception as e:
                            logger.warning(f"Error loading TXT {filename}: {e}")
            
            if not documents:
                logger.warning("No documents found in knowledge base")
                return False
            
            # Split documents
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.config.CHUNK_SIZE,
                chunk_overlap=self.config.CHUNK_OVERLAP
            )
            texts = text_splitter.split_documents(documents)
            
            # Create vector store
            self.vector_store = FAISS.from_documents(texts, self.embeddings)
            
            # Save vector store
            os.makedirs(os.path.dirname(self.config.VECTOR_STORE_PATH), exist_ok=True)
            self.vector_store.save_local(self.config.VECTOR_STORE_PATH)
            
            # Setup QA chain
            self._setup_qa_chain()
            
            logger.info(f"Knowledge base loaded successfully with {len(texts)} chunks")
            return True
            
        except Exception as e:
            logger.error(f"Error loading knowledge base: {e}")
            return False
    
    def _setup_qa_chain(self):
        """Setup QA chain với custom prompt"""
        if not self.vector_store or not self.llm:
            return
        
        try:
            # Custom prompt cho tiếng Việt
            prompt_template = """
            Bạn là một trợ lý thông minh của trường Đại Học Cần Thơ. Hãy trả lời câu hỏi dựa trên thông tin được cung cấp.

            Thông tin tham khảo:
            {context}

            Câu hỏi: {question}

            Hướng dẫn trả lời:
            - Trả lời bằng tiếng Việt
            - Dựa trên thông tin được cung cấp
            - Nếu không có thông tin, hãy nói "Tôi không có thông tin về vấn đề này"
            - Trả lời ngắn gọn, rõ ràng
            

            Trả lời:
            """
            
            prompt = PromptTemplate(
                template=prompt_template,
                input_variables=["context", "question"]
            )
            
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vector_store.as_retriever(search_kwargs={"k": self.config.TOP_K_RESULTS}),
                chain_type_kwargs={"prompt": prompt},
                return_source_documents=True
            )
            
            logger.info("QA chain setup successfully")
            
        except Exception as e:
            logger.error(f"Error setting up QA chain: {e}")
    
    def query(self, question):
        """Thực hiện truy vấn RAG"""
        try:
            if not self.qa_chain:
                return "❌ Hệ thống kiến thức chưa được khởi tạo. Vui lòng thử lại sau."
            
            result = self.qa_chain({"query": question})
            return result["result"]
            
        except Exception as e:
            logger.error(f"Error in RAG query: {e}")
            return "⚠️ Có lỗi xảy ra khi tìm kiếm thông tin. Vui lòng thử lại sau."
    
    def is_ready(self):
        """Kiểm tra xem RAG system đã sẵn sàng chưa"""
        return self.qa_chain is not None and self.llm is not None
