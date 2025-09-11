import google.generativeai as genai
import psycopg2
from config import settings
import logging
import json
from typing import Dict, List, Any, Optional
import re

logger = logging.getLogger(__name__)

gemini_model = "gemini-2.5-pro"

class NeuroNurtureAI:
    def __init__(self):
        # Configure Gemini API
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.gemini_client = genai.GenerativeModel(gemini_model)
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
    
    def get_ai_response(self, message: str) -> str:
        """Get AI response from Gemini"""
        try:
            # Create system prompt for admin
            system_prompt = self._create_system_prompt()
            
            # Combine system prompt and user message
            full_prompt = f"{system_prompt}\n\nUser: {message}"
            
            response = self.gemini_client.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=1000,
                )
            )
            
            # Handle Gemini response properly
            try:
                return response.text
            except:
                # Fallback for complex responses
                return ''.join([part.text for part in response.parts if hasattr(part, 'text')])
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return "I'm having trouble connecting to the AI service. Please try again later."
    
    def _create_system_prompt(self) -> str:
        """Create system prompt for admin user"""
        # Get database context
        db_context = self._get_database_context()
        
        prompt = f"""You are an AI assistant for NeuroNurture, an educational platform for cognitive development in children.

USER CONTEXT:
- Role: Admin (Full system access)

DATABASE CONTEXT:
{db_context}

AVAILABLE GAMES:
1. Gaze Tracking - Eye movement and cognitive training
2. Gesture Control - Hand movement and motor skills development  
3. Mirror Posture - Physical coordination and posture training
4. Dance Doodle - Creative expression through movement
5. Repeat With Me - Memory and auditory processing

ADMIN CAPABILITIES:
- Full database access
- Can view all users, games, progress, and system data
- Can analyze system performance and user engagement
- Can provide insights and recommendations

INSTRUCTIONS:
1. Be helpful, educational, and encouraging
2. Provide specific information when possible
3. If asked about data, access the database to get real information
4. Keep responses concise but informative
5. If you need to query the database, explain what you're looking for

RESPONSE STYLE:
- Friendly and professional
- Educational and supportive
- Specific to NeuroNurture platform
- Data-driven insights when appropriate"""
        
        return prompt
    
    def _get_database_context(self) -> str:
        """Get current database context for AI"""
        if not self.db_connection:
            return "Database: Not connected"
        
        try:
            cursor = self.db_connection.cursor()
            
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """)
            tables = [row[0] for row in cursor.fetchall()]
            
            # Get sample counts
            context = f"Database: Connected\nTables: {', '.join(tables)}\n"
            
            # Get game data counts
            game_tables = [t for t in tables if 'game' in t.lower()]
            for table in game_tables:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    context += f"{table}: {count} records\n"
                except:
                    pass
            
            cursor.close()
            return context
            
        except Exception as e:
            logger.error(f"Error getting database context: {e}")
            return "Database: Connected but context unavailable"
    
    def execute_database_query(self, query: str) -> Dict[str, Any]:
        """Execute database query (admin has full access)"""
        if not self.db_connection:
            return {"success": False, "error": "Database not connected"}
        
        try:
            cursor = self.db_connection.cursor()
            cursor.execute(query)
            
            # Check if it's a SELECT query
            if query.strip().upper().startswith('SELECT'):
                results = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description] if cursor.description else []
                
                # Convert to list of dictionaries
                data = []
                for row in results:
                    data.append(dict(zip(columns, row)))
                
                cursor.close()
                return {
                    "success": True,
                    "data": data,
                    "count": len(data)
                }
            else:
                # For non-SELECT queries
                self.db_connection.commit()
                cursor.close()
                return {
                    "success": True,
                    "message": "Query executed successfully"
                }
                
        except Exception as e:
            logger.error(f"Database query error: {e}")
            return {"success": False, "error": str(e)}
    
    
    def get_game_progress(self, user_role: str, user_id: int, game_name: str = None) -> Dict[str, Any]:
        """Get game progress data"""
        if not self.db_connection:
            return {"success": False, "error": "Database not connected"}
        
        try:
            cursor = self.db_connection.cursor()
            
            if game_name:
                # Get specific game data
                table_name = f"{game_name.lower().replace(' ', '_')}_game"
                query = f"SELECT * FROM {table_name} LIMIT 10"
            else:
                # Get all game data - simplified approach
                query = "SELECT * FROM gaze_game LIMIT 5"
            
            cursor.execute(query)
            results = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            
            data = []
            for row in results:
                data.append(dict(zip(columns, row)))
            
            cursor.close()
            return {
                "success": True,
                "data": data,
                "count": len(data)
            }
            
        except Exception as e:
            logger.error(f"Error getting game progress: {e}")
            return {"success": False, "error": str(e)}
    
    def get_user_info(self, user_role: str, user_id: int) -> Dict[str, Any]:
        """Get user information"""
        if not self.db_connection:
            return {"success": False, "error": "Database not connected"}
        
        try:
            cursor = self.db_connection.cursor()
            
            # Try to get user info from different tables based on role
            if user_role == "child":
                cursor.execute("SELECT * FROM child WHERE id = %s", (user_id,))
            elif user_role == "parent":
                cursor.execute("SELECT * FROM parent WHERE id = %s", (user_id,))
            else:
                cursor.execute("SELECT * FROM app_user WHERE id = %s", (user_id,))
            
            result = cursor.fetchone()
            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            
            cursor.close()
            
            if result:
                return {
                    "success": True,
                    "data": dict(zip(columns, result))
                }
            else:
                return {
                    "success": False,
                    "error": "User not found"
                }
                
        except Exception as e:
            logger.error(f"Error getting user info: {e}")
            return {"success": False, "error": str(e)}
    
    def process_message(self, message: str) -> Dict[str, Any]:
        """Main method to process user messages with intelligent LLM-based analysis"""
        try:
            # For simple greetings, skip database analysis
            message_lower = message.lower().strip()
            if message_lower in ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']:
                ai_response = self.get_ai_response(message)
                return {
                    "response": ai_response,
                    "database_accessed": False,
                    "query_executed": False
                }
            
            # Step 1: Get simple database context
            db_context = self._get_database_context()
            
            # Step 2: Ask LLM to analyze if database query is needed
            needs_query, query_type = self._analyze_with_llm(message, db_context)
            
            if needs_query:
                # Step 3: Ask LLM to generate the SQL query
                sql_query = self._generate_sql_with_llm(message, db_context, query_type)
                
                if sql_query and sql_query.strip():
                    # Step 4: Execute the query
                    db_result = self.execute_database_query(sql_query)
                    
                    # Step 5: Ask LLM to format the result into human-readable response
                    ai_response = self._format_result_with_llm(message, db_result)
                    
                    return {
                        "response": ai_response,
                        "database_accessed": True,
                        "data": db_result.get("data", []) if db_result.get("success") else [],
                        "query_executed": True,
                        "sql_query": sql_query
                    }
                else:
                    # Fallback if no query generated
                    ai_response = self.get_ai_response(message)
                    return {
                        "response": ai_response,
                        "database_accessed": False,
                        "query_executed": False
                    }
            else:
                # Direct AI response without database
                ai_response = self.get_ai_response(message)
                return {
                    "response": ai_response,
                    "database_accessed": False,
                    "query_executed": False
                }
                
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                "response": "I encountered an error while processing your request. Please try again.",
                "error": True
            }
    
    
    def _get_comprehensive_database_context(self) -> str:
        """Get comprehensive database context for AI analysis"""
        if not self.db_connection:
            return "Database: Not connected"
        
        try:
            cursor = self.db_connection.cursor()
            
            # Get all table information with schemas
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
            
            tables_info = {}
            for row in cursor.fetchall():
                table_name, column_name, data_type, is_nullable = row
                if table_name not in tables_info:
                    tables_info[table_name] = []
                if column_name:  # Some tables might not have columns
                    tables_info[table_name].append({
                        'column': column_name,
                        'type': data_type,
                        'nullable': is_nullable
                    })

            
            # Get record counts for each table
            table_counts = {}
            for table_name in tables_info.keys():
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                    count = cursor.fetchone()[0]
                    table_counts[table_name] = count
                except:
                    table_counts[table_name] = 0
            
            # Get sample data from key tables
            # sample_data = {}
            # key_tables = ['app_user', 'child', 'parent', 'gaze_game', 'gesture_game', 'mirror_posture_game', 'dance_doodle_game', 'repeat_with_me_game']
            # for table in key_tables:
            #     if table in tables_info:
            #         try:
            #             cursor.execute(f"SELECT * FROM {table} LIMIT 3")
            #             sample_rows = cursor.fetchall()
            #             columns = [desc[0] for desc in cursor.description] if cursor.description else []
            #             sample_data[table] = {
            #                 'columns': columns,
            #                 'sample_rows': sample_rows[:2]  # Limit to 2 rows for context
            #             }
            #         except:
            #             pass
            
            cursor.close()
            
            # Format comprehensive context
            context = "=== DATABASE SCHEMA ===\n"
            for table_name, columns in tables_info.items():
                count = table_counts.get(table_name, 0)
                context += f"\nTable: {table_name} ({count} records)\n"
                for col in columns:
                    context += f"  - {col['column']}: {col['type']} {'(nullable)' if col['nullable'] == 'YES' else '(not null)'}\n"
            
            # context += "\n=== SAMPLE DATA ===\n"
            # for table_name, data in sample_data.items():
            #     context += f"\n{table_name}:\n"
            #     context += f"  Columns: {', '.join(data['columns'])}\n"
            #     for i, row in enumerate(data['sample_rows']):
            #         context += f"  Row {i+1}: {dict(zip(data['columns'], row))}\n"
            
            return context
            
        except Exception as e:
            logger.error(f"Error getting comprehensive database context: {e}")
            return "Database: Connected but context unavailable"
    
    def _analyze_with_llm(self, message: str, db_context: str) -> tuple:
        """Use LLM to analyze if database query is needed"""
        try:
            analysis_prompt = f"""You are analyzing a user message to determine if a database query is needed.

USER CONTEXT:
- Role: Admin (Full database access)
- Message: "{message}"

DATABASE CONTEXT:
{db_context}

ANALYSIS TASK:
Determine if this message requires a database query to answer properly.

Consider:
1. Does the user want specific data from the database?
2. Are they asking about records, progress, scores, or user information?
3. Do they need real-time data that's stored in the database?
4. Is this a general question that doesn't need database access?

Respond with ONLY a JSON object:
{{
    "needs_database_query": true/false,
    "query_type": "user_info/game_progress/general_data/table_info/none",
    "reasoning": "brief explanation of your decision"
}}

Examples:
- "Hello" -> needs_database_query: false, query_type: "none"
- "Show me all users" -> needs_database_query: true, query_type: "user_info"
- "What tables exist?" -> needs_database_query: true, query_type: "table_info"
- "How does gaze tracking work?" -> needs_database_query: false, query_type: "none"
- "Show me game progress data" -> needs_database_query: true, query_type: "game_progress"
"""

            full_prompt = f"You are a database query analyzer. Respond only with valid JSON.\n\n{analysis_prompt}"
            
            response = self.gemini_client.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,
                    max_output_tokens=200,
                )
            )
            
            # Handle Gemini response properly
            try:
                response_text = response.text
            except:
                # Fallback for complex responses
                response_text = ''.join([part.text for part in response.parts if hasattr(part, 'text')])
            
            result = json.loads(response_text.strip())
            needs_query = result.get("needs_database_query", False)
            query_type = result.get("query_type", "none")
            
            logger.info(f"LLM Analysis: needs_query={needs_query}, type={query_type}, reasoning={result.get('reasoning', '')}")
            
            return needs_query, query_type
            
        except Exception as e:
            logger.error(f"Error in LLM analysis: {e}")
            # Fallback to simple analysis
            return self._fallback_analyze_intent(message)
    
    def _generate_sql_with_llm(self, message: str, db_context: str, query_type: str) -> str:
        """Use LLM to generate SQL query"""
        try:
            sql_prompt = f"""You are a SQL query generator for the NeuroNurture database.

USER CONTEXT:
- Role: Admin (Full database access)
- Message: "{message}"
- Query Type: {query_type}

DATABASE SCHEMA:
{db_context}

TASK:
Generate a SQL query to answer the user's question. Follow these rules:

1. Use only SELECT queries (no INSERT, UPDATE, DELETE)
2. Use proper table and column names from the schema
3. Limit results appropriately (use LIMIT clause)
4. Admin has full access to all data

Respond with ONLY the SQL query, nothing else. No explanations, no markdown, just the query.

Example responses:
- "SELECT * FROM gaze_game LIMIT 10"
- "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
- "SELECT COUNT(*) FROM app_user"
- "SELECT * FROM app_user LIMIT 5" """

            full_prompt = f"You are a SQL query generator. Respond only with valid SQL queries.\n\n{sql_prompt}"
            
            response = self.gemini_client.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,
                    max_output_tokens=300,
                )
            )
            
            # Handle Gemini response properly
            try:
                sql_query = response.text.strip()
            except:
                # Fallback for complex responses
                sql_query = ''.join([part.text for part in response.parts if hasattr(part, 'text')]).strip()
            
            # Clean up the response (remove any markdown or extra text)
            sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
            
            logger.info(f"Generated SQL: {sql_query}")
            
            return sql_query
            
        except Exception as e:
            logger.error(f"Error generating SQL: {e}")
            return ""
    
    def _format_result_with_llm(self, original_message: str, db_result: Dict[str, Any]) -> str:
        """Use LLM to format database result into human-readable response"""
        try:
            if not db_result.get("success"):
                return f"I encountered an error while accessing the database: {db_result.get('error', 'Unknown error')}"
            
            data = db_result.get("data", [])
            if not data:
                return "I found no data matching your request."
            
            # Prepare data summary for LLM
            data_summary = f"Found {len(data)} records:\n"
            for i, record in enumerate(data[:5]):  # Show first 5 records
                data_summary += f"Record {i+1}: {record}\n"
            
            if len(data) > 5:
                data_summary += f"... and {len(data) - 5} more records\n"
            
            formatting_prompt = f"""You are formatting database query results into a helpful, human-readable response.

ORIGINAL USER MESSAGE: "{original_message}"
USER ROLE: Admin

DATABASE RESULTS:
{data_summary}

TASK:
Create a helpful, conversational response that:
1. Directly answers the user's question
2. Presents the data in an easy-to-understand format
3. Highlights key insights or patterns
4. Uses professional admin language
5. Keeps the response concise but informative

Make it sound natural and helpful, not like a database report."""

            full_prompt = f"You are a helpful assistant that formats database results into natural, conversational responses.\n\n{formatting_prompt}"
            
            response = self.gemini_client.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=500,
                )
            )
            
            # Handle Gemini response properly
            try:
                formatted_response = response.text.strip()
            except:
                # Fallback for complex responses
                formatted_response = ''.join([part.text for part in response.parts if hasattr(part, 'text')]).strip()
            logger.info(f"Formatted response: {formatted_response[:100]}...")
            
            return formatted_response
            
        except Exception as e:
            logger.error(f"Error formatting result: {e}")
            return f"I found {len(db_result.get('data', []))} records, but I had trouble formatting them. Here's the raw data: {str(db_result.get('data', [])[:3])}"
    
    def _fallback_analyze_intent(self, message: str) -> tuple:
        """Fallback intent analysis if LLM fails"""
        message_lower = message.lower()
        
        # Simple keyword-based fallback
        if any(word in message_lower for word in ["show", "get", "find", "list", "data", "table", "progress", "score", "result", "count"]):
            return True, "general_data"
        else:
            return False, "none"

# Global instance
ai_agent = NeuroNurtureAI()
