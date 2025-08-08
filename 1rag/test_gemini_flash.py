"""
Quick test for Gemini 1.5 Flash
"""

import requests
import json
import time

def test_gemini_flash():
    """Test RAG server with Gemini 1.5 Flash"""
    
    base_url = "http://localhost:5001"
    
    print("🧪 Testing RAG Server with Gemini 1.5 Flash")
    print("=" * 50)
    
    # Test health check
    try:
        print("🔍 Testing health check...")
        response = requests.get(f"{base_url}/health")
        print(f"Health Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test RAG status
    try:
        print("\n📊 Testing RAG status...")
        response = requests.get(f"{base_url}/rag/status")
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"RAG Type: {result.get('type', 'unknown')}")
        print(f"Status: {result.get('status', 'unknown')}")
    except Exception as e:
        print(f"❌ RAG status failed: {e}")
        return
    
    # Test simple queries
    test_queries = [
        "Xin chào",
        "Học phí như thế nào?",
        "Học bổng gì có sẵn?"
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n❓ Test {i}: {query}")
        try:
            response = requests.post(
                f"{base_url}/rag/query",
                json={"query": query},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Source: {result.get('source', 'unknown')}")
                print(f"📝 Response: {result.get('response', 'No response')[:200]}...")
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Query failed: {e}")
        
        # Wait between requests to avoid quota issues
        if i < len(test_queries):
            print("⏳ Waiting 3 seconds...")
            time.sleep(3)
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    test_gemini_flash()
