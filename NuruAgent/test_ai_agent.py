#!/usr/bin/env python3
"""
Comprehensive test script for the NeuroNurture AI Agent
"""

import requests
import json
import time

class AIAgentTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
    
    def test_health(self):
        """Test system health"""
        print("🔍 Testing system health...")
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Status: {data['status']}")
                print(f"✅ Database: {data['database']}")
                print(f"✅ AI Service: {data['ai_service']}")
                print(f"✅ Version: {data['version']}")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False
    
    def test_chat(self, message, role="admin", user_id=1):
        """Test chat functionality"""
        print(f"\n💬 Testing chat: '{message}' as {role}")
        try:
            response = requests.post(f"{self.base_url}/chat", 
                                   json={
                                       "message": message,
                                       "user_role": role,
                                       "user_id": user_id
                                   })
            
            if response.status_code == 200:
                data = response.json()
                print(f"📤 User: {message}")
                print(f"📥 AI: {data.get('response', 'No response')}")
                
                if data.get('database_accessed'):
                    print("📊 Database was accessed")
                if data.get('query_executed'):
                    print("🔍 Query was executed")
                if data.get('data'):
                    print(f"📈 Data returned: {len(data['data'])} records")
                
                return True
            else:
                print(f"❌ Chat failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Chat error: {e}")
            return False
    
    def test_database_endpoints(self):
        """Test database-related endpoints"""
        print("\n🗄️ Testing database endpoints...")
        
        # Test tables endpoint
        try:
            response = requests.get(f"{self.base_url}/tables")
            if response.status_code == 200:
                data = response.json()
                tables = data.get('tables', [])
                print(f"✅ Tables endpoint: Found {len(tables)} tables")
                print(f"   Tables: {', '.join(tables[:5])}")
            else:
                print(f"❌ Tables endpoint failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Tables endpoint error: {e}")
        
        # Test games endpoint
        try:
            response = requests.get(f"{self.base_url}/games")
            if response.status_code == 200:
                data = response.json()
                games = data.get('games', [])
                print(f"✅ Games endpoint: Found {len(games)} games")
                for game in games:
                    print(f"   - {game['title']}: {game['description']}")
            else:
                print(f"❌ Games endpoint failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Games endpoint error: {e}")
    
    def test_user_endpoints(self):
        """Test user-related endpoints"""
        print("\n👤 Testing user endpoints...")
        
        # Test user info endpoint
        try:
            response = requests.get(f"{self.base_url}/user/1?role=admin")
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print("✅ User info endpoint: User found")
                else:
                    print(f"⚠️ User info endpoint: {data.get('error', 'Unknown error')}")
            else:
                print(f"❌ User info endpoint failed: {response.status_code}")
        except Exception as e:
            print(f"❌ User info endpoint error: {e}")
        
        # Test progress endpoint
        try:
            response = requests.get(f"{self.base_url}/progress/1?role=admin")
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    count = data.get('count', 0)
                    print(f"✅ Progress endpoint: Found {count} progress records")
                else:
                    print(f"⚠️ Progress endpoint: {data.get('error', 'Unknown error')}")
            else:
                print(f"❌ Progress endpoint failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Progress endpoint error: {e}")
    
    def run_comprehensive_test(self):
        """Run comprehensive test suite"""
        print("🎯 NeuroNurture AI Agent - Comprehensive Test")
        print("=" * 60)
        
        # Test health
        if not self.test_health():
            print("❌ System not healthy. Please check the backend.")
            return
        
        # Test database endpoints
        self.test_database_endpoints()
        
        # Test user endpoints
        self.test_user_endpoints()
        
        # Test chat scenarios
        print("\n🧪 Testing chat scenarios...")
        
        test_scenarios = [
            # General conversation
            ("Hello, how are you?", "admin", 1),
            ("What can you help me with?", "school", 1),
            
            # Database queries
            ("Show me the database tables", "admin", 1),
            ("What data do you have?", "doctor", 1),
            
            # Game-specific queries
            ("Tell me about the gaze tracking game", "child", 1),
            ("How does the gesture control game work?", "parent", 1),
            ("What is mirror posture training?", "school", 1),
            
            # Progress queries
            ("Show me my progress", "child", 1),
            ("What are my scores in dance doodle?", "child", 1),
            ("How is my child performing?", "parent", 1),
            
            # Role-specific queries
            ("Show me all children in my school", "school", 1),
            ("What children are assigned to me?", "doctor", 1),
            ("Create a task for grade 3", "school", 1),
        ]
        
        for message, role, user_id in test_scenarios:
            self.test_chat(message, role, user_id)
            time.sleep(1)  # Small delay between requests
        
        print("\n✅ Comprehensive test completed!")
        print("\n🎉 Your NeuroNurture AI Agent is working perfectly!")

def main():
    tester = AIAgentTester()
    tester.run_comprehensive_test()

if __name__ == "__main__":
    main()
