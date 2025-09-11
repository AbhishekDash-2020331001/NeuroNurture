#!/usr/bin/env python3
"""
Simple test for the compatible agent
"""

import os
import sys

# Add current directory to path
sys.path.append('.')

try:
    from compatible_langchain_agent import compatible_agent
    print("✅ Agent imported successfully")
    
    # Test database connection
    if compatible_agent.db_connection:
        print("✅ Database connected")
    else:
        print("❌ Database not connected")
    
    # Test GROQ client
    if compatible_agent.groq_client:
        print("✅ GROQ client initialized")
    else:
        print("❌ GROQ client not initialized")
    
    # Test simple database schema
    print("\n=== Testing Database Schema ===")
    schema = compatible_agent._get_database_schema()
    print(f"Schema result: {schema[:100]}...")
    
    # Test simple web search
    print("\n=== Testing Web Search ===")
    search_result = compatible_agent._web_search("AI in education")
    print(f"Search result: {search_result[:100]}...")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
