#!/usr/bin/env python3
"""
Test script for the schedule chatbot
"""

import requests
import json

def test_chatbot():
    """Test the chatbot with schedule-related queries"""
    
    # Rasa server endpoint
    rasa_url = "http://localhost:5005/webhooks/rest/webhook"
    
    # Test messages
    test_messages = [
        "xin chào",
        "lịch học hôm nay",
        "hôm nay tôi có môn gì",
        "có lớp nào hôm nay không",
        "lịch học tuần này",
        "lịch học ngày mai",
        "tiết học tiếp theo",
        "tạm biệt"
    ]
    
    print("🤖 Testing Schedule Chatbot")
    print("=" * 50)
    
    for message in test_messages:
        print(f"\n👤 User: {message}")
        
        # Send message to Rasa
        payload = {
            "sender": "test_user",
            "message": message
        }
        
        try:
            response = requests.post(rasa_url, json=payload)
            
            if response.status_code == 200:
                bot_responses = response.json()
                
                if bot_responses:
                    for bot_response in bot_responses:
                        if 'text' in bot_response:
                            print(f"🤖 Bot: {bot_response['text']}")
                else:
                    print("🤖 Bot: (No response)")
            else:
                print(f"❌ Error: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to Rasa server. Make sure it's running on localhost:5005")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Test completed!")

if __name__ == "__main__":
    test_chatbot()
