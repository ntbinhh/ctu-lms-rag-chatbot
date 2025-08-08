"""
Test script for Enhanced RAG Server
"""

import requests
import json
import time

# Server configuration
SERVER_URL = "http://localhost:5001"

def test_health_check():
    """Test health check endpoint"""
    print("🏥 Testing health check...")
    try:
        response = requests.get(f"{SERVER_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_rag_status():
    """Test RAG status endpoint"""
    print("\n📊 Testing RAG status...")
    try:
        response = requests.get(f"{SERVER_URL}/rag/status")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ RAG status failed: {e}")
        return False

def test_rag_query(query):
    """Test RAG query endpoint"""
    print(f"\n❓ Testing query: '{query}'")
    try:
        payload = {"query": query}
        response = requests.post(
            f"{SERVER_URL}/rag/query",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Source: {result.get('source', 'unknown')}")
        print(f"Response: {result.get('response', 'No response')}")
        print("-" * 50)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Query failed: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 Testing Enhanced RAG Server")
    print("=" * 50)
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(2)
    
    # Test endpoints
    tests_passed = 0
    total_tests = 0
    
    # Health check
    total_tests += 1
    if test_health_check():
        tests_passed += 1
    
    # RAG status
    total_tests += 1
    if test_rag_status():
        tests_passed += 1
    
    # Test queries
    test_queries = [
        "Học phí của trường như thế nào?",
        "Điều kiện để được học bổng là gì?",
        "Quy định về điểm số trong trường?",
        "Chương trình đào tạo kéo dài bao lâu?",
        "Thông tin liên hệ phòng đào tạo",
        "Xin chào, tôi cần hỗ trợ"
    ]
    
    for query in test_queries:
        total_tests += 1
        if test_rag_query(query):
            tests_passed += 1
    
    # Summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("✅ All tests passed!")
    else:
        print("⚠️ Some tests failed.")

if __name__ == "__main__":
    main()
