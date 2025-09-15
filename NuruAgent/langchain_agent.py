#!/usr/bin/env python3
"""
LangChain-based AI Agent for NeuroNurture with DuckDuckGo search and database tools
"""

import os
import json
import logging
import psycopg2
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.tools import DuckDuckGoSearchRun

from config import settings

load_dotenv()
logger = logging.getLogger(__name__)

class NeuroNurtureLangChainAgent:
    def __init__(self):
        """Initialize the LangChain-based AI agent"""
        # Initialize Gemini model
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.7,
            max_output_tokens=1000
        )
        
        # Initialize database connection
        self.db_connection = None
        self._connect_database()
        
        # Initialize tools
        self.tools = self._create_tools()
        
        # Create agent
        self.agent = self._create_agent()
        
    def _connect_database(self):
        """Connect to PostgreSQL database"""
        try:
            self.db_connection = psycopg2.connect(settings.DATABASE_URL)
            logger.info("Database connected successfully")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            self.db_connection = None
    
    def _create_tools(self) -> List[Tool]:
        """Create tools for the agent"""
        tools = []
        
        # DuckDuckGo Search Tool
        search_tool = DuckDuckGoSearchRun()
        tools.append(Tool(
            name="web_search",
            description="Search the web for current information, news, or general knowledge. Use this when you need up-to-date information that might not be in the database.",
            func=search_tool.run
        ))
        
        # Database Query Tool
        tools.append(Tool(
            name="database_query",
            description="Execute SQL queries on the NeuroNurture database. Use this to get information about users, games, progress, and system data. Only use SELECT queries.",
            func=self._execute_database_query
        ))
        
        # Database Schema Tool
        tools.append(Tool(
            name="database_schema",
            description="Get information about the database structure, tables, and columns. Use this to understand what data is available.",
            func=self._get_database_schema
        ))
        
        # User Information Tool
        tools.append(Tool(
            name="user_info",
            description="Get information about specific users in the system. Provide user_id as input.",
            func=self._get_user_info
        ))
        
        # Game Progress Tool
        tools.append(Tool(
            name="game_progress",
            description="Get game progress information for users. Provide user_id and optionally game_name as input.",
            func=self._get_game_progress
        ))
        
        return tools
    
    def _create_agent(self) -> AgentExecutor:
        """Create the LangChain agent"""
        # ReAct prompt template
        react_prompt = """You are an AI assistant for NeuroNurture, an educational platform for cognitive development in children.

You have access to the following tools:
- web_search: Search the web for current information
- database_query: Query the NeuroNurture database
- database_schema: Get database structure information
- user_info: Get user information
- game_progress: Get game progress data

As an admin, you have full access to all system data. Be helpful, educational, and encouraging in your responses.

When users ask questions:
1. If they need current/general information, use web_search
2. If they need specific data from the system, use database tools
3. Always provide clear, helpful responses
4. Use appropriate tools based on the question type

Available games in the system:
- Gaze Tracking: Eye movement and cognitive training
- Gesture Control: Hand movement and motor skills development
- Mirror Posture: Physical coordination and posture training
- Dance Doodle: Creative expression through movement
- Repeat With Me: Memory and auditory processing

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought: {agent_scratchpad}"""

        # Create prompt template
        prompt = PromptTemplate(
            template=react_prompt,
            input_variables=["input", "agent_scratchpad", "tool_names"]
        )
        
        # Create agent
        agent = create_react_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=prompt
        )
        
        # Create agent executor
        agent_executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=3
        )
        
        return agent_executor
    
    def _execute_database_query(self, query: str) -> str:
        """Execute database query tool"""
        if not self.db_connection:
            return "Database not connected"
        
        try:
            # Ensure it's a SELECT query for safety
            if not query.strip().upper().startswith('SELECT'):
                return "Only SELECT queries are allowed"
            
            cursor = self.db_connection.cursor()
            cursor.execute(query)
            
            results = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            
            # Convert to list of dictionaries
            data = []
            for row in results:
                data.append(dict(zip(columns, row)))
            
            cursor.close()
            
            if not data:
                return "No data found"
            
            # Format results for display
            result_text = f"Found {len(data)} records:\n"
            for i, record in enumerate(data[:5]):  # Show first 5 records
                result_text += f"Record {i+1}: {record}\n"
            
            if len(data) > 5:
                result_text += f"... and {len(data) - 5} more records"
            
            return result_text
            
        except Exception as e:
            logger.error(f"Database query error: {e}")
            return f"Database error: {str(e)}"
    
    def _get_database_schema(self, _: str = "") -> str:
        """Get database schema information"""
        if not self.db_connection:
            return "Database not connected"
        
        try:
            cursor = self.db_connection.cursor()
            cursor.execute("""
                SELECT 
                    t.table_name,
                    c.column_name,
                    c.data_type,
                    c.is_nullable
                FROM information_schema.tables t
                LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
                WHERE t.table_schema = 'public'
                ORDER BY t.table_name, c.ordinal_position
            """)
            
            results = cursor.fetchall()
            cursor.close()
            
            # Group by table
            tables = {}
            for row in results:
                table_name, column_name, data_type, is_nullable = row
                if table_name not in tables:
                    tables[table_name] = []
                if column_name:
                    tables[table_name].append({
                        'column': column_name,
                        'type': data_type,
                        'nullable': is_nullable
                    })
            
            # Format schema
            schema_text = "Database Schema:\n"
            for table_name, columns in tables.items():
                schema_text += f"\nTable: {table_name}\n"
                for col in columns:
                    schema_text += f"  - {col['column']}: {col['type']} {'(nullable)' if col['nullable'] == 'YES' else '(not null)'}\n"
            
            return schema_text
            
        except Exception as e:
            logger.error(f"Error getting database schema: {e}")
            return f"Error getting schema: {str(e)}"
    
    def _get_user_info(self, user_id: str) -> str:
        """Get user information tool"""
        try:
            user_id = int(user_id)
            query = f"SELECT * FROM app_user WHERE id = {user_id} LIMIT 1"
            return self._execute_database_query(query)
        except Exception as e:
            return f"Error getting user info: {str(e)}"
    
    def _get_game_progress(self, input_str: str) -> str:
        """Get game progress tool"""
        try:
            # Parse input (user_id and optionally game_name)
            parts = input_str.split()
            if not parts:
                return "Please provide user_id"
            
            user_id = int(parts[0])
            game_name = parts[1] if len(parts) > 1 else None
            
            if game_name:
                # Query specific game
                query = f"SELECT * FROM {game_name}_game WHERE child_id = {user_id} LIMIT 10"
            else:
                # Query all games (simplified)
                query = f"SELECT * FROM gaze_game WHERE child_id = {user_id} LIMIT 10"
            
            return self._execute_database_query(query)
        except Exception as e:
            return f"Error getting game progress: {str(e)}"
    
    def process_message(self, message: str) -> Dict[str, Any]:
        """Process user message using LangChain agent"""
        try:
            # Execute the agent
            result = self.agent.invoke({"input": message})
            
            return {
                "response": result.get("output", "I couldn't process your request."),
                "database_accessed": "database" in result.get("output", "").lower(),
                "query_executed": False,  # LangChain handles this internally
                "tools_used": len(result.get("intermediate_steps", []))
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                "response": f"I encountered an error while processing your request: {str(e)}",
                "error": True
            }
    
    def get_ai_response(self, message: str) -> str:
        """Get direct AI response without tools"""
        try:
            response = self.llm.invoke([HumanMessage(content=message)])
            return response.content
        except Exception as e:
            logger.error(f"Error getting AI response: {e}")
            return "I'm having trouble connecting to the AI service. Please try again later."

# Create global instance
langchain_agent = NeuroNurtureLangChainAgent()