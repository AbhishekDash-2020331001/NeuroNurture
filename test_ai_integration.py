#!/usr/bin/env python3
"""
Test script to verify AI service integration for ticket classification
"""

import requests
import json

def test_ai_service():
    """Test the AI service ticket classification endpoint"""
    ai_service_url = "http://localhost:8005"
    
    # Test data
    test_message = """
    Subject: Game not working properly
    
    Description: My child is trying to play the gaze tracking game but it keeps crashing. 
    The screen goes black and then shows an error message. This is very frustrating 
    because my child really enjoys this game and it's part of their therapy. 
    Please help fix this as soon as possible.
    """
    
    print("Testing AI Service Integration...")
    print("=" * 50)
    
    # Test health check
    try:
        health_response = requests.get(f"{ai_service_url}/health")
        if health_response.status_code == 200:
            print("✅ AI Service is running")
            print(f"Health status: {health_response.json()}")
        else:
            print("❌ AI Service health check failed")
            return
    except Exception as e:
        print(f"❌ Cannot connect to AI Service: {e}")
        print("Make sure the AI service is running on port 8005")
        return
    
    # Test ticket classification
    try:
        print("\nTesting ticket classification...")
        classification_response = requests.post(
            f"{ai_service_url}/ticket/classify",
            json={
                "message": test_message,
                "user_type": "parent",
                "user_id": 1
            },
            headers={"Content-Type": "application/json"}
        )
        
        if classification_response.status_code == 200:
            result = classification_response.json()
            print("✅ Ticket classification successful")
            print(f"Priority: {result.get('priority')}")
            print(f"Rewritten message: {result.get('rewritten_message')[:100]}...")
            print(f"Reasoning: {result.get('reasoning')}")
        else:
            print(f"❌ Ticket classification failed: {classification_response.status_code}")
            print(classification_response.text)
            
    except Exception as e:
        print(f"❌ Error testing ticket classification: {e}")
    
    # Test chat endpoint
    try:
        print("\nTesting chat endpoint...")
        chat_response = requests.post(
            f"{ai_service_url}/chat",
            json={
                "message": "Hello, I need help with my child's progress",
                "user_type": "parent",
                "user_id": 1
            },
            headers={"Content-Type": "application/json"}
        )
        
        if chat_response.status_code == 200:
            result = chat_response.json()
            print("✅ Chat endpoint working")
            print(f"Response: {result.get('response')[:100]}...")
        else:
            print(f"❌ Chat endpoint failed: {chat_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing chat endpoint: {e}")

if __name__ == "__main__":
    test_ai_service()
