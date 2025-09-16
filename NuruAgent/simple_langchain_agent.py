#!/usr/bin/env python3
"""
Simplified LangChain-based AI Agent for NeuroNurture with DuckDuckGo search
"""

import os
import json
import logging
import psycopg2
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv 

import anthropic
import re

from config import settings

load_dotenv()
logger = logging.getLogger(__name__)

class SimpleLangChainAgent:
    def __init__(self):
        """Initialize the simplified AI agent"""
        # Initialize Anthropic Claude client
        self.claude_client = anthropic.Anthropic(
            api_key=settings.ANTHROPIC_API_KEY,
            timeout=30.0
        )
        
        # Initialize database connection
        self.db_connection = None
        self._connect_database()
        
    def _connect_database(self):
        """Connect to PostgreSQL database"""
        try:
            self.db_connection = psycopg2.connect(settings.DATABASE_URL)
            logger.info("Database connected successfully")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            self.db_connection = None
    
    def _web_search(self, query: str) -> str:
        """Search the web using Claude Sonnet 4's built-in web search"""
        try:
            search_prompt = f"""Search for current information about: {query}

Provide a concise summary focusing only on the most relevant and recent information. Keep it brief and directly related to the query.

IMPORTANT: Format your response in PLAIN TEXT only. No markdown, HTML, bold text, bullet points, or special formatting. Use simple text with line breaks for readability."""
            
            response = self.claude_client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                temperature=0.3,
                messages=[{"role": "user", "content": search_prompt}]
            )
            
            return f"Web search results for '{query}':\n{response.content[0].text}"
            
        except Exception as e:
            logger.error(f"Web search error: {e}")
            return f"Search error: {str(e)}"
    
    def _execute_database_query(self, query: str) -> str:
        """Execute database query"""
        if not self.db_connection:
            return "Database not connected"
        
        try:
            
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
            
            # Format results concisely
            print("query data:", data)
            result_text = f"Found {len(data)} records:\n"
            for i, record in enumerate(data[:3]):  # Show only first 3 records
                result_text += f"Record {i+1}: {record}\n"
            
            if len(data) > 3:
                result_text += f"... and {len(data) - 3} more records"
            
            return result_text
            
        except Exception as e:
            logger.error(f"Database query error: {e}")
            return f"Database error: {str(e)}"
    
    def _get_database_schema(self) -> str:
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
            
            # Format schema concisely
            schema_text = "Database Schema:\n"
            for table_name, columns in tables.items():
                schema_text += f"\nTable: {table_name}\n"
                for col in columns:
                    schema_text += f"  - {col['column']}: {col['type']} {'(nullable)' if col['nullable'] == 'YES' else '(not null)'}\n"

            print(f"Database Schema:\n{schema_text}")
            return schema_text
            
        except Exception as e:
            logger.error(f"Error getting database schema: {e}")
            return f"Error getting schema: {str(e)}"
    
    def _build_user_context(self, user_type: str, user_id: int = None) -> str:
        """Build user-specific context for prompts"""
        # Convert user_type to lowercase for consistent matching
        user_type = user_type.lower()
        
        if user_type == "parent" and user_id:
            try:
                # Get parent's children information
                cursor = self.db_connection.cursor()
                cursor.execute("""
                    SELECT c.id, c.name, c.date_of_birth, c.gender 
                    FROM child c 
                    WHERE c.parent_id = %s
                """, (user_id,))
                children = cursor.fetchall()
                cursor.close()
                
                if children:
                    children_info = "\n".join([f"- Child ID: {child[0]}, Name: {child[1]}, DOB: {child[2]}, Gender: {child[3]}" for child in children])
                    return f"Parent ID: {user_id}\nYour Children:\n{children_info}"
                else:
                    return f"Parent ID: {user_id}\nNo children found in system."
            except Exception as e:
                logger.error(f"Error getting parent context: {e}")
                return f"Parent ID: {user_id}"
        elif user_type == "school" and user_id:
            try:
                # Get school information and enrolled children
                cursor = self.db_connection.cursor()
                cursor.execute("""
                    SELECT s.school_name, s.city, s.state, s.student_count
                    FROM schools s 
                    WHERE s.id = %s
                """, (user_id,))
                school_info = cursor.fetchone()
                
                cursor.execute("""
                    SELECT c.id, c.name, c.date_of_birth, c.gender, c.parent_id
                    FROM child c 
                    WHERE c.school_id = %s
                """, (user_id,))
                children = cursor.fetchall()
                cursor.close()
                
                if school_info:
                    school_context = f"School ID: {user_id}\nSchool Name: {school_info[0]}\nLocation: {school_info[1]}, {school_info[2]}\nStudent Count: {school_info[3]}"
                    if children:
                        children_info = "\n".join([f"- Child ID: {child[0]}, Name: {child[1]}, DOB: {child[2]}, Gender: {child[3]}, Parent ID: {child[4]}" for child in children])
                        return f"{school_context}\n\nEnrolled Children:\n{children_info}"
                    else:
                        return f"{school_context}\n\nNo children enrolled in this school."
                else:
                    return f"School ID: {user_id}\nSchool not found in system."
            except Exception as e:
                logger.error(f"Error getting school context: {e}")
                return f"School ID: {user_id}"
        elif user_type == "admin":
            return "Full system administrator access"
        else:
            return f"User Type: {user_type}"
    
    def _get_access_rules(self, user_type: str) -> str:
        """Get access rules based on user type"""
        # Convert user_type to lowercase for consistent matching
        user_type = user_type.lower()
        
        if user_type == "parent":
            return """
ACCESS RESTRICTIONS FOR PARENT:
- You can ONLY access data about YOUR OWN CHILDREN
- You CANNOT access other children's data, school information, or system-wide statistics
- You CANNOT access other parents' information
- You CAN compare your children's progress with general benchmarks (not specific other children)
- You CAN get educational advice and general information
- All database queries MUST include WHERE parent_id = [parent_id] or child_id IN (SELECT id FROM child WHERE parent_id = [parent_id])
- If user asks about other children or schools, politely decline and redirect to their own children
"""
        elif user_type == "school":
            return """
ACCESS RESTRICTIONS FOR SCHOOL:
- You can ONLY access data about YOUR OWN SCHOOL and CHILDREN ENROLLED IN YOUR SCHOOL
- You CANNOT access other schools' data or children from other schools
- You CAN access educational game data for children enrolled in your school
- You CAN get school-specific statistics and progress reports for your enrolled children
- All database queries MUST include WHERE school_id = [school_id] or child_id IN (SELECT id FROM child WHERE school_id = [school_id])
- If user asks about other schools or children not enrolled, politely decline and redirect to your school's data
"""
        else:  # admin
            return """
ACCESS RULES FOR ADMIN:
- Full access to all data in the system
- Can access any child, parent, school, or game data
- Can provide system-wide statistics and comparisons
- Can access all educational games and progress data
"""
    
    def _analyze_intent(self, message: str, user_type: str = "admin", user_id: int = None) -> Dict[str, Any]:
        """Analyze user intent using Claude with user type restrictions"""
        try:
            # Build user-specific context
            user_context = self._build_user_context(user_type, user_id)
            
            analysis_prompt = f"""You are an AI assistant for the NeuroNurture educational platform. Analyze this user message and determine what tools to use:

User Type: {user_type.upper()}
{user_context}

Message: "{message}"

Available tools:
1. web_search - for current information, news, general knowledge
2. database_query - for specific data from NeuroNurture system
3. database_schema - for database structure information

{self._get_access_rules(user_type)}

Respond with the following JSON schema exactly:
{{
    "needs_web_search": true/false,
    "needs_database": true/false,
    "needs_schema": true/false,
    "reasoning": "brief explanation"
}}"""

            response = self.claude_client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=200,
                temperature=0.1,
                messages=[{"role": "user", "content": analysis_prompt}]
            )
            
            response_text = response.content[0].text
            cleaned_text = re.sub(r'```json\n|```', '', response_text).strip()
            
            result = json.loads(cleaned_text)
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing intent: {e}")
            return {
                "needs_web_search": False,
                "needs_database": False,
                "needs_schema": False,
                "reasoning": "Analysis failed"
            }
    
    def _generate_database_query(self, message: str, user_type: str = "admin", user_id: int = None) -> str:
        """Generate SQL query using LLM"""
        try:
            schema = self._get_database_schema()
            user_context = self._build_user_context(user_type, user_id)
            access_rules = self._get_access_rules(user_type)
            
            query_prompt = f"""Generate a SQL query for this request:

User Type: {user_type.upper()}
{user_context}

User request: "{message}"

Database schema:
{schema}


SQL Generation Rules:
1. Use only SELECT queries
2. Use proper table and column names
3. Add LIMIT clause for large results
8. Return only the SQL query, nothing else

Example for Admin: SELECT * FROM child LIMIT 10
Example for Parent: SELECT * FROM child WHERE parent_id = {user_id}
Example for School: SELECT * FROM child WHERE school_id = {user_id}"""

            response = self.claude_client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=300,
                temperature=0.1,
                messages=[{"role": "user", "content": query_prompt}]
            )
            
            response_text = response.content[0].text
            
            # Clean up the response
            sql_query = response_text.strip()
            sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
            
            return sql_query
            
        except Exception as e:
            logger.error(f"Error generating SQL: {e}")
            return ""
    
    def process_message(self, message: str, user_type: str = "admin", user_id: int = None, context: str = "") -> Dict[str, Any]:
        """Process user message with tool selection and user type restrictions"""
        try:
            # Analyze intent with user type context
            intent = self._analyze_intent(message, user_type, user_id)
            logger.info(f"Intent analysis: {intent}")
            
            # Collect information from tools
            tool_results = []
            
            if intent.get("needs_schema", False):
                schema_info = self._get_database_schema()
                print(f"Database Schema:\n{schema_info}")
                tool_results.append(f"Database Schema:\n{schema_info}")
            
            if intent.get("needs_database", False):
                sql_query = self._generate_database_query(message, user_type, user_id)
                if sql_query:
                    db_result = self._execute_database_query(sql_query)
                    tool_results.append(f"Database Query Result:\n{db_result}")
                    logger.info(f"Executed SQL: {sql_query}")
            
            if intent.get("needs_web_search", False):
                search_result = self._web_search(message)
                tool_results.append(f"Web Search Results:\n{search_result}")
            
            # Generate response with context
            if tool_results:
                tool_context = "\n\n".join(tool_results)
                user_context = self._build_user_context(user_type, user_id)
                access_rules = self._get_access_rules(user_type.lower())




                
                conversation_context = ""
                if context:
                    conversation_context = f"\n\nPrevious conversation context:\n({context})"
                
                final_prompt = f"""You are an AI assistant for the NeuroNurture educational platform. Provide a helpful response to the user's message.

User Type: {user_type.upper()}

User message: "{message}"





Provide a clear, helpful response that addresses the user's message appropriately. Be informative and supportive.
You should limit your response to in maximum 5 sentences.
Don't use any kind of formating symbol like this: ** or __ or * or _ or - or # or > or ``` or any other markdown or html formatting
Dont be very verbose. Keep it short and to the point. 
Dont include anything irrelevant to the response. Be specific and concise about the user's needs.
You must give the answer. Don't say you don't know or you don't have the information.
"""
            else:
                user_context = self._build_user_context(user_type, user_id)
                access_rules = self._get_access_rules(user_type.lower())
                
                conversation_context = ""
                if context:
                    conversation_context = f"\n\nPrevious conversation context:\n{context}"
                
                final_prompt = f"""You are an AI assistant for the NeuroNurture educational platform. Provide a helpful response to the user's message.

User Type: {user_type.upper()}
{user_context}

User message: "{message}"

Provide a clear, helpful response that addresses the user's message appropriately. Be informative and supportive.
You should limit your response to in maximum 5 sentences.
Don't use any kind of formating symbol like this: ** or __ or * or _ or - or # or > or ``` or any other markdown or html formatting
Dont be very verbose. Keep it short and to the point. 
Dont include anything irrelevant to the response. Be specific and concise about the user's needs.
You must give the answer. Don't say you don't know or you don't have the information.
"""
            
            response = self.claude_client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                temperature=0.7,
                messages=[{"role": "user", "content": final_prompt}]
            )

            print(f"Final Prompt:\n{final_prompt}")
            print(f"AI Response:\n{response.content[0].text}")
            
            response_text = response.content[0].text
            
            return {
                "response": response_text,
                "database_accessed": intent.get("needs_database", False),
                "web_searched": intent.get("needs_web_search", False),
                "tools_used": sum([intent.get("needs_database", False), intent.get("needs_web_search", False), intent.get("needs_schema", False)])
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
            # Simple, direct response without type detection
            prompt = f"""You are an AI assistant for the NeuroNurture educational platform. Provide a helpful response to the user's message.

User message: "{message}"

Provide a clear, helpful response that addresses the user's message appropriately."""
            
            response = self.claude_client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response.content[0].text
                
        except Exception as e:
            logger.error(f"Error getting AI response: {e}")
            return "I'm having trouble connecting to the AI service. Please try again later."

    def classify_ticket_priority(self, message: str, user_type: str = "user", user_id: int = None):
        """Classify ticket priority and rewrite message for clarity"""
        try:
            # Create a specialized prompt for ticket classification
            classification_prompt = f"""You are an expert ticket classification system for a child development and educational platform. 

Your task is to:
1. Classify the priority of the user's issue/ticket
2. Rewrite the message to be clear, grammatically correct, and professional for admin review

PRIORITY CLASSIFICATION GUIDELINES:
- URGENT: System crashes, security issues, data loss, payment failures, critical bugs affecting multiple users
- HIGH: Major feature broken, significant user experience issues, important functionality not working
- MEDIUM: Minor bugs, feature requests, general questions, moderate user experience issues
- LOW: Cosmetic issues, minor suggestions, informational requests, non-critical improvements

MESSAGE REWRITING GUIDELINES:
- Fix grammar and spelling errors
- Improve clarity and structure
- Make it professional and concise
- Preserve the original intent and details
- Use proper technical terminology when appropriate

User Type: {user_type}
User ID: {user_id if user_id else 'Unknown'}

Original Message:
{message}

Please respond in the following JSON format:
{{
    "priority": "LOW|MEDIUM|HIGH|URGENT",
    "rewritten_message": "Clear, grammatically correct, and professional version of the message",
    "reasoning": "Brief explanation of why this priority was chosen"
}}"""

            # Get AI response
            response = self.get_ai_response(classification_prompt)
            
            # Try to parse JSON response
            try:
                import json
                result = json.loads(response)
                
                # Validate priority
                valid_priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
                if result.get("priority") not in valid_priorities:
                    result["priority"] = "MEDIUM"  # Default fallback
                
                return {
                    "priority": result["priority"],
                    "rewritten_message": result.get("rewritten_message", message),
                    "reasoning": result.get("reasoning", "Priority classified based on content analysis"),
                    "error": False
                }
                
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract priority from text
                priority = self._extract_priority_from_text(response)
                rewritten_message = self._extract_rewritten_message(response, message)
                
                return {
                    "priority": priority,
                    "rewritten_message": rewritten_message,
                    "reasoning": "Priority extracted from AI response text",
                    "error": False
                }
                
        except Exception as e:
            logger.error(f"Error classifying ticket priority: {e}")
            return {
                "priority": "MEDIUM",
                "rewritten_message": message,
                "reasoning": "Error occurred during classification",
                "error": True
            }

    def _extract_priority_from_text(self, response_text: str):
        """Extract priority from AI response text if JSON parsing fails"""
        response_lower = response_text.lower()
        
        if "urgent" in response_lower:
            return "URGENT"
        elif "high" in response_lower:
            return "HIGH"
        elif "low" in response_lower:
            return "LOW"
        else:
            return "MEDIUM"  # Default fallback

    def _extract_rewritten_message(self, response_text: str, original_message: str):
        """Extract rewritten message from AI response text if JSON parsing fails"""
        # Look for common patterns that might contain the rewritten message
        lines = response_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('{') and not line.startswith('"priority') and not line.startswith('"reasoning'):
                # This might be the rewritten message
                if len(line) > 20:  # Reasonable length for a rewritten message
                    return line
        
        # If no clear rewritten message found, return original
        return original_message

# Create global instance
simple_langchain_agent = SimpleLangChainAgent()