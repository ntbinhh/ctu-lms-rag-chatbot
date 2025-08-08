"""
Check available Gemini models and test configuration
"""

import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

def check_available_models():
    """Check what Gemini models are available"""
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("❌ GOOGLE_API_KEY not found in .env")
            return False
        
        genai.configure(api_key=api_key)
        
        print("🔍 Checking available Gemini models...")
        models = genai.list_models()
        
        generation_models = []
        embedding_models = []
        
        print("\n📋 Available models:")
        for model in models:
            print(f"  ✅ {model.name}")
            if hasattr(model, 'supported_generation_methods'):
                methods = [m for m in model.supported_generation_methods]
                print(f"     Methods: {', '.join(methods)}")
                
                if 'generateContent' in methods:
                    generation_models.append(model.name)
                if 'embedContent' in methods:
                    embedding_models.append(model.name)
            print()
        
        print(f"\n🤖 Generation models: {generation_models}")
        print(f"🔍 Embedding models: {embedding_models}")
        
        # Test generation models
        for model_name in generation_models[:3]:  # Test first 3 models
            try:
                print(f"\n🧪 Testing {model_name}...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content("Xin chào bằng tiếng Việt")
                print(f"✅ {model_name} works: {response.text[:100]}...")
            except Exception as e:
                print(f"❌ {model_name} failed: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_langchain_integration():
    """Test LangChain integration with Gemini"""
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        
        api_key = os.getenv("GOOGLE_API_KEY")
        
        # Test different model names
        test_models = [
            "gemini-1.5-pro",
            "gemini-pro", 
            "models/gemini-1.5-pro",
            "models/gemini-pro"
        ]
        
        print("\n🔗 Testing LangChain integration...")
        
        for model_name in test_models:
            try:
                print(f"\n🧪 Testing LangChain with {model_name}...")
                llm = ChatGoogleGenerativeAI(
                    model=model_name,
                    google_api_key=api_key,
                    temperature=0.3
                )
                
                response = llm.invoke("Chào bạn!")
                print(f"✅ {model_name} works with LangChain: {response.content[:100]}...")
                return model_name  # Return the first working model
                
            except Exception as e:
                print(f"❌ {model_name} failed with LangChain: {e}")
        
        return None
        
    except ImportError:
        print("❌ LangChain Google GenAI not installed")
        return None
    except Exception as e:
        print(f"❌ LangChain test failed: {e}")
        return None

def main():
    """Main function to check and test models"""
    print("🚀 Gemini Model Checker and Tester")
    print("=" * 50)
    
    # Check available models
    if not check_available_models():
        return
    
    # Test LangChain integration
    working_model = test_langchain_integration()
    
    if working_model:
        print(f"\n✅ Recommended model for LangChain: {working_model}")
        
        # Update config suggestion
        print(f"""
📝 To fix the RAG system, update your enhanced_rag_manager.py:

Replace:
    model="gemini-pro"
    
With:
    model="{working_model}"
""")
    else:
        print("\n❌ No working model found for LangChain integration")
        print("💡 Try updating langchain-google-genai package:")
        print("   pip install --upgrade langchain-google-genai")

if __name__ == "__main__":
    main()
