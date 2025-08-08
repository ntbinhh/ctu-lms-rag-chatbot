"""
Configuration for Google Gemini API
Updated with latest model names
"""

import google.generativeai as genai
import os
from typing import Optional

class GeminiConfig:
    """Configuration class for Google Gemini"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("Google API key is required")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Updated model names
        self.model_name = "gemini-1.5-flash"  # Sử dụng Flash model - nhanh hơn và quota cao hơn
        self.embedding_model = "models/text-embedding-004"  # Updated embedding model
        
        # Generation config
        self.generation_config = {
            "temperature": 0.3,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        # Safety settings
        self.safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    
    def get_model(self):
        """Get configured Gemini model"""
        return genai.GenerativeModel(
            model_name=self.model_name,
            generation_config=self.generation_config,
            safety_settings=self.safety_settings
        )
    
    def get_chat_model(self):
        """Get model for chat/conversation"""
        return self.get_model()
    
    def list_available_models(self):
        """List all available models"""
        try:
            models = genai.list_models()
            print("📋 Available Gemini models:")
            for model in models:
                print(f"  - {model.name}")
                if hasattr(model, 'supported_generation_methods'):
                    print(f"    Methods: {model.supported_generation_methods}")
        except Exception as e:
            print(f"Error listing models: {e}")

# Test function
def test_gemini_config():
    """Test Gemini configuration"""
    try:
        config = GeminiConfig()
        print("✅ Gemini configuration successful")
        
        # List available models
        config.list_available_models()
        
        # Test model
        model = config.get_model()
        test_response = model.generate_content("Xin chào, bạn là ai?")
        print(f"🤖 Test response: {test_response.text}")
        
        return True
    except Exception as e:
        print(f"❌ Gemini configuration failed: {e}")
        return False

if __name__ == "__main__":
    test_gemini_config()