#!/usr/bin/env python3
"""
Test the compatible LangChain agent
"""

import os
from compatible_langchain_agent import compatible_agent

def test_agent():
    """Test the compatible agent"""
    print("Testing Compatible LangChain Agent...")
    
    # Test 1: Simple database schema query
    print("\n=== Test 1: Database Schema ===")
    try:
        result = compatible_agent.process_message("Show me the database structure")
        print(f"Response: {result.get('response', 'No response')[:200]}...")
        print(f"Database accessed: {result.get('database_accessed', False)}")
        print(f"Tools used: {result.get('tools_used', 0)}")
        print(f"Tools list: {result.get('tools_list', [])}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Simple web search
    print("\n=== Test 2: Web Search ===")
    try:
        result = compatible_agent.process_message("Search for latest news about AI in education")
        print(f"Response: {result.get('response', 'No response')[:200]}...")
        print(f"Web searched: {result.get('web_searched', False)}")
        print(f"Tools used: {result.get('tools_used', 0)}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Complex multi-step query
    print("\n=== Test 3: Complex Multi-step Query ===")
    try:
        result = compatible_agent.process_message("Find users with low scores, then search for research on improving performance")
        print(f"Response: {result.get('response', 'No response')[:200]}...")
        print(f"Database accessed: {result.get('database_accessed', False)}")
        print(f"Web searched: {result.get('web_searched', False)}")
        print(f"Tools used: {result.get('tools_used', 0)}")
        print(f"Execution steps: {result.get('execution_steps', 0)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_agent()
