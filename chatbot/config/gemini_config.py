import os
from dotenv import load_dotenv

load_dotenv()

class GeminiConfig:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    MODEL_NAME = "gemini-pro"
    TEMPERATURE = 0.7
    MAX_OUTPUT_TOKENS = 1024
    
    # RAG Config
    CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 1000))
    CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 200))
    TOP_K_RESULTS = int(os.getenv("TOP_K_RESULTS", 3))
    
    # Vector Store Config
    VECTOR_STORE_PATH = os.getenv("VECTOR_STORE_PATH", "data/vector_store")
    EMBEDDINGS_MODEL = os.getenv("EMBEDDINGS_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
