import subprocess
import sys
import os
import urllib.request
from pathlib import Path

def repair_pip():
    """Repair broken pip in virtual environment"""
    print("🔧 Repairing broken pip...")
    
    # Get the virtual environment path
    venv_path = Path(sys.executable).parent.parent
    scripts_path = venv_path / "Scripts"
    
    print(f"Virtual environment path: {venv_path}")
    print(f"Scripts path: {scripts_path}")
    
    # Step 1: Download get-pip.py
    print("\n📥 Downloading get-pip.py...")
    get_pip_url = "https://bootstrap.pypa.io/get-pip.py"
    get_pip_path = venv_path / "get-pip.py"
    
    try:
        urllib.request.urlretrieve(get_pip_url, get_pip_path)
        print("✅ Downloaded get-pip.py")
    except Exception as e:
        print(f"❌ Failed to download get-pip.py: {e}")
        return False
    
    # Step 2: Install pip using get-pip.py
    print("\n🔧 Installing pip...")
    try:
        subprocess.check_call([sys.executable, str(get_pip_path)])
        print("✅ Pip installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install pip: {e}")
        return False
    
    # Step 3: Upgrade pip
    print("\n⬆️ Upgrading pip...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        print("✅ Pip upgraded successfully")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Failed to upgrade pip: {e}")
        # Continue anyway
    
    # Step 4: Install setuptools and wheel
    print("\n📦 Installing core packages...")
    core_packages = ["setuptools", "wheel"]
    
    for package in core_packages:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", package])
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"⚠️ Failed to install {package}: {e}")
    
    # Step 5: Clean up
    if get_pip_path.exists():
        get_pip_path.unlink()
        print("🧹 Cleaned up temporary files")
    
    print("\n✅ Pip repair completed!")
    return True

def install_rag_minimal():
    """Install minimal RAG dependencies"""
    print("\n📦 Installing minimal RAG dependencies...")
    
    # Install one by one to avoid conflicts
    packages = [
        "python-dotenv",
        "PyPDF2", 
        "sentence-transformers",
        "faiss-cpu",
        "langchain",
        "langchain-community",
        "langchain-google-genai"
    ]
    
    for package in packages:
        print(f"\n📦 Installing {package}...")
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", 
                package, "--no-deps"
            ])
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"⚠️ Failed to install {package}: {e}")
            # Try without --no-deps
            try:
                subprocess.check_call([
                    sys.executable, "-m", "pip", "install", package
                ])
                print(f"✅ Installed {package} (with deps)")
            except subprocess.CalledProcessError as e2:
                print(f"❌ Failed to install {package}: {e2}")

def test_imports():
    """Test if imports work"""
    print("\n🧪 Testing imports...")
    
    test_modules = [
        ("dotenv", "python-dotenv"),
        ("PyPDF2", "PyPDF2"),
        ("sentence_transformers", "sentence-transformers"),
        ("faiss", "faiss-cpu"),
        ("langchain", "langchain"),
        ("langchain_community", "langchain-community"),
        ("langchain_google_genai", "langchain-google-genai")
    ]
    
    success_count = 0
    for module_name, package_name in test_modules:
        try:
            __import__(module_name)
            print(f"✅ {package_name}")
            success_count += 1
        except ImportError as e:
            print(f"❌ {package_name}: {e}")
    
    print(f"\n📊 Success rate: {success_count}/{len(test_modules)}")
    return success_count == len(test_modules)

if __name__ == "__main__":
    # Step 1: Repair pip
    if repair_pip():
        # Step 2: Install RAG dependencies
        install_rag_minimal()
        
        # Step 3: Test imports
        if test_imports():
            print("\n🎉 All dependencies installed successfully!")
        else:
            print("\n⚠️ Some dependencies failed to install")
    else:
        print("\n❌ Failed to repair pip")
        print("Try running as administrator or recreate virtual environment")
