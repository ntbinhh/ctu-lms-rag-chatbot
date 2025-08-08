import os
import sys
from pathlib import Path

def simple_rag_test():
    """Test RAG system với fallback handling"""
    print("🧪 Simple RAG Test...")
    
    # Test 1: Check if files exist
    print("\n📁 Checking file structure...")
    base_dir = Path(__file__).parent.parent
    
    files_to_check = [
        "config/gemini_config.py",
        "rag_system/rag_manager.py", 
        ".env"
    ]
    
    for file_path in files_to_check:
        full_path = base_dir / file_path
        if full_path.exists():
            print(f"✅ {file_path} exists")
        else:
            print(f"❌ {file_path} missing")
    
    # Test 2: Check .env configuration
    print("\n🔧 Checking configuration...")
    env_path = base_dir / ".env"
    if env_path.exists():
        with open(env_path, 'r') as f:
            content = f.read()
            if "GOOGLE_API_KEY" in content and "your_gemini_api_key_here" not in content:
                print("✅ API key configured")
            else:
                print("❌ API key not configured")
    
    # Test 3: Try importing without executing
    print("\n📦 Testing imports...")
    sys.path.append(str(base_dir))
    
    try:
        # Test basic imports
        import os
        import sys
        print("✅ Basic imports OK")
        
        # Test if config can be imported
        try:
            from config.gemini_config import GeminiConfig
            config = GeminiConfig()
            print("✅ Configuration loaded")
        except Exception as e:
            print(f"⚠️ Configuration error: {e}")
        
        # Test RAG manager import (without initialization)
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location(
                "rag_manager", 
                str(base_dir / "rag_system" / "rag_manager.py")
            )
            if spec:
                print("✅ RAG manager file accessible")
            else:
                print("❌ RAG manager file not found")
        except Exception as e:
            print(f"⚠️ RAG manager error: {e}")
            
    except Exception as e:
        print(f"❌ Import test failed: {e}")
    
    # Test 4: Check knowledge base folder
    print("\n📚 Checking knowledge base...")
    kb_path = base_dir / "knowledge_base"
    if kb_path.exists():
        files = list(kb_path.glob("*.pdf")) + list(kb_path.glob("*.txt"))
        if files:
            print(f"✅ Found {len(files)} knowledge base files")
        else:
            print("⚠️ Knowledge base folder empty")
    else:
        print("❌ Knowledge base folder not found")
        print("Creating knowledge base folder...")
        kb_path.mkdir(exist_ok=True)
        print("✅ Knowledge base folder created")
    
    print("\n🎯 Test Summary:")
    print("- File structure: Check above")
    print("- Configuration: Check above") 
    print("- Dependencies: Run fix_dependencies.py if needed")
    print("- Knowledge base: Add PDF/TXT files to knowledge_base/")
    
    print("\n📋 Next steps:")
    print("1. Add documents to knowledge_base/ folder")
    print("2. Run: python scripts/fix_dependencies.py")
    print("3. Run: python scripts/setup_rag.py")
    print("4. Test: python scripts/test_rag.py")

if __name__ == "__main__":
    simple_rag_test()
