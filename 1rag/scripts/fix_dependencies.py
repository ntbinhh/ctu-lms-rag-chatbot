import subprocess
import sys
import os

def fix_dependencies():
    """Fix dependency conflicts and install required packages"""
    print("🔧 Fixing dependency conflicts...")
    
    # Check if pip is working
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "--version"])
        print("✅ Pip is working")
    except subprocess.CalledProcessError:
        print("❌ Pip is broken, run repair_pip.py first")
        return False
    
    # Packages that often cause conflicts
    problematic_packages = [
        "packaging>=21.0",
        "setuptools",
        "wheel"
    ]
    
    print("📦 Upgrading core packages...")
    for package in problematic_packages:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", package])
            print(f"✅ Upgraded {package}")
        except subprocess.CalledProcessError as e:
            print(f"⚠️ Failed to upgrade {package}: {e}")
    
    print("\n📦 Installing RAG dependencies...")
    rag_packages = [
        "python-dotenv>=1.0.0",
        "PyPDF2>=3.0.1",
        "sentence-transformers>=2.2.2",
        "faiss-cpu>=1.7.4",
        "langchain>=0.1.0",
        "langchain-community>=0.0.20",
        "langchain-google-genai>=1.0.0"
    ]
    
    for package in rag_packages:
        try:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"⚠️ Failed to install {package}: {e}")
            # Try without version constraints
            base_package = package.split(">=")[0].split("==")[0]
            try:
                print(f"Retrying {base_package} without version constraint...")
                subprocess.check_call([sys.executable, "-m", "pip", "install", base_package])
                print(f"✅ Installed {base_package}")
            except subprocess.CalledProcessError as e2:
                print(f"❌ Failed to install {base_package}: {e2}")
    
    print("\n🧪 Testing imports...")
    test_imports = [
        ("dotenv", "python-dotenv"),
        ("PyPDF2", "PyPDF2"),
        ("sentence_transformers", "sentence-transformers"),
        ("faiss", "faiss-cpu"),
        ("langchain", "langchain"),
        ("langchain_community", "langchain-community"),
        ("langchain_google_genai", "langchain-google-genai")
    ]
    
    success_count = 0
    for module_name, package_name in test_imports:
        try:
            __import__(module_name)
            print(f"✅ {package_name}")
            success_count += 1
        except ImportError as e:
            print(f"❌ {package_name}: {e}")
    
    print(f"\n📊 Success rate: {success_count}/{len(test_imports)}")
    print("\n✅ Dependency fix completed!")
    
    if success_count < len(test_imports):
        print("\n⚠️ Some dependencies failed. Try:")
        print("1. python scripts/repair_pip.py")
        print("2. Or recreate virtual environment")
    
    return success_count == len(test_imports)

if __name__ == "__main__":
    fix_dependencies()
