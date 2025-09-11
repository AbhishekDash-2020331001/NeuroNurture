#!/usr/bin/env python3
"""
Interactive Chat Interface for NeuroNurture AI Chatbot
"""

import requests
import json

class ChatInterface:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
    
    def test_connection(self):
        """Test if backend is running"""
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                print("✅ Connected to NeuroNurture AI Chatbot")
                return True
            else:
                print("❌ Backend not responding")
                return False
        except:
            print("❌ Cannot connect to backend. Make sure it's running on http://localhost:8000")
            return False
    
    def send_message(self, message):
        """Send message to chatbot"""
        try:
            response = requests.post(f"{self.base_url}/chat", 
                                   json={"message": message})
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "No response")
            else:
                return f"Error: {response.status_code}"
                
        except Exception as e:
            return f"Connection error: {e}"
    
    def show_help(self):
        """Show help information"""
        print("\n🎯 NeuroNurture AI Chatbot Help")
        print("=" * 40)
        print("Commands:")
        print("  /help           - Show this help")
        print("  /quit           - Exit chat")
        print("\nExample queries:")
        print("  • Hello")
        print("  • Show me the database tables")
        print("  • Tell me about gaze tracking game")
        print("  • What games are available?")
        print("  • Show me all users")
        print("  • How many records are in each table?")
        print("=" * 40)
    
    def start_chat(self):
        """Start interactive chat"""
        print("🎯 NeuroNurture AI Chatbot - Interactive Chat")
        print("=" * 50)
        
        if not self.test_connection():
            return
        
        print("Role: Admin (Full database access)")
        print("Type '/help' for commands, '/quit' to exit")
        print("-" * 50)
        
        while True:
            try:
                # Get user input
                user_input = input(f"\n[admin]> ").strip()
                
                if not user_input:
                    continue
                
                # Handle commands
                if user_input.startswith('/'):
                    if user_input == '/quit':
                        print("👋 Goodbye!")
                        break
                    elif user_input == '/help':
                        self.show_help()
                        continue
                    else:
                        print("❌ Unknown command. Type '/help' for available commands.")
                        continue
                
                # Send message to chatbot
                print("🤖 AI: ", end="", flush=True)
                response = self.send_message(user_input)
                print(response)
                
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")

def main():
    chat = ChatInterface()
    chat.start_chat()

if __name__ == "__main__":
    main()
