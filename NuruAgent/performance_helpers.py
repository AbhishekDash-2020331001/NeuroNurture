#!/usr/bin/env python3
"""
Helper functions for performance overview functionality
"""

import logging
from simple_langchain_agent import simple_langchain_agent

logger = logging.getLogger(__name__)

def process_dance_doodle_data(data):
    """Process dance doodle game data"""
    if not data:
        return {'sessions': 0, 'recent_scores': [], 'average_score': 0, 'latest_session': None}
    
    # Calculate total activity score from all gesture counts
    scores = []
    for row in data:
        # Sum all gesture counts (excluding date_time which is last column)
        total_activity = sum([val for val in row[:-1] if val is not None and isinstance(val, int)])
        scores.append(total_activity)
    
    return {
        'sessions': len(data),
        'recent_scores': scores,
        'average_score': sum(scores) / len(scores) if scores else 0,
        'latest_session': data[0] if data else None
    }

def process_gesture_game_data(data):
    """Process gesture game data"""
    if not data:
        return {'sessions': 0, 'recent_scores': [], 'average_score': 0, 'latest_session': None}
    
    scores = []
    for row in data:
        # Sum all gesture counts (excluding date_time which is last column)
        total_activity = sum([val for val in row[:-1] if val is not None and isinstance(val, int)])
        scores.append(total_activity)
    
    return {
        'sessions': len(data),
        'recent_scores': scores,
        'average_score': sum(scores) / len(scores) if scores else 0,
        'latest_session': data[0] if data else None
    }

def process_gaze_game_data(data):
    """Process gaze game data"""
    if not data:
        return {'sessions': 0, 'recent_rounds': [], 'latest_session': None}
    
    rounds = []
    for row in data:
        rounds.append({
            'round1': row[0] if row[0] is not None else 0,  # round1count
            'round2': row[1] if row[1] is not None else 0,  # round2count
            'round3': row[2] if row[2] is not None else 0   # round3count
        })
    
    return {
        'sessions': len(data),
        'recent_rounds': rounds,
        'latest_session': data[0] if data else None
    }

def process_mirror_posture_data(data):
    """Process mirror posture game data"""
    if not data:
        return {'sessions': 0, 'recent_sessions': [], 'latest_session': None}
    
    sessions = []
    for row in data:
        sessions.append({
            'looking_sideways': row[0] if row[0] is not None else 0,  # looking_sideways
            'mouth_open': row[1] if row[1] is not None else 0,        # mouth_open
            'showing_teeth': row[2] if row[2] is not None else 0,     # showing_teeth
            'kiss': row[3] if row[3] is not None else 0,              # kiss
            'looking_left': row[4] if row[4] is not None else 0,      # looking_left
            'looking_right': row[5] if row[5] is not None else 0      # looking_right
        })
    
    return {
        'sessions': len(data),
        'recent_sessions': sessions,
        'latest_session': data[0] if data else None
    }

def process_repeat_with_me_data(data):
    """Process repeat with me game data"""
    if not data:
        return {'sessions': 0, 'recent_scores': [], 'average_score': 0, 'latest_session': None}
    
    scores = []
    for row in data:
        # Get average_score column (first column)
        avg_score = row[0] if row[0] is not None else 0
        scores.append(avg_score)
    
    return {
        'sessions': len(data),
        'recent_scores': scores,
        'average_score': sum(scores) / len(scores) if scores else 0,
        'latest_session': data[0] if data else None
    }

async def get_child_performance_data(child_id: str):
    """Retrieve performance data for a child across all games using direct SQL queries"""
    try:
        if not simple_langchain_agent.db_connection:
            return None
        
        # Get child basic info first
        cursor = simple_langchain_agent.db_connection.cursor()
        cursor.execute("""
            SELECT c.name, c.date_of_birth, c.gender, c.parent_id
            FROM child c 
            WHERE c.id = %s
        """, (child_id,))
        child_info = cursor.fetchone()
        
        if not child_info:
            cursor.close()
            return None
        
        performance_data = {
            'child_info': {
                'name': child_info[0],
                'date_of_birth': child_info[1],
                'gender': child_info[2],
                'parent_id': child_info[3]
            }
        }
        
        # Use direct SQL queries based on known schema
        game_queries = {
            "dance_doodle": "SELECT cool_arms, crossy_play, happy_stand_left, happy_stand_right, open_wings, shh_fun, silly_boxer, stretch_left, stretch_right, happy_stand, stretch, date_time FROM dance_doodle_game WHERE child_id = %s ORDER BY date_time DESC LIMIT 5",
            "gesture_game": "SELECT butterfly, closed_fist, dua, heart, iloveyou, open_palm, pointing_up, spectacle, thumbs_down, thumbs_up, victory, date_time FROM gesture_game WHERE child_id = %s ORDER BY date_time DESC LIMIT 5",
            "gaze_game": "SELECT round1count, round2count, round3count, date_time FROM gaze_game WHERE child_id = %s ORDER BY date_time DESC LIMIT 5",
            "mirror_posture": "SELECT looking_sideways, mouth_open, showing_teeth, kiss, looking_left, looking_right, date_time FROM mirror_posture_game WHERE child_id = %s ORDER BY date_time DESC LIMIT 5",
            "repeat_with_me": "SELECT average_score, completed_rounds, date_time FROM repeat_with_me_game WHERE child_id = %s ORDER BY date_time DESC LIMIT 5"
        }
        
        # Execute queries for each game
        for game_name, query in game_queries.items():
            try:
                cursor.execute(query, (child_id,))
                game_data = cursor.fetchall()
                
                # Process the data based on game type
                if game_name == 'dance_doodle':
                    performance_data[game_name] = process_dance_doodle_data(game_data)
                elif game_name == 'gesture_game':
                    performance_data[game_name] = process_gesture_game_data(game_data)
                elif game_name == 'gaze_game':
                    performance_data[game_name] = process_gaze_game_data(game_data)
                elif game_name == 'mirror_posture':
                    performance_data[game_name] = process_mirror_posture_data(game_data)
                elif game_name == 'repeat_with_me':
                    performance_data[game_name] = process_repeat_with_me_data(game_data)
                    
            except Exception as e:
                logger.error(f"Error executing query for {game_name}: {e}")
                performance_data[game_name] = {'sessions': 0, 'error': str(e)}
        
        cursor.close()
        return performance_data
        
    except Exception as e:
        logger.error(f"Error retrieving performance data for child {child_id}: {e}")
        return None

async def generate_performance_insights(child_id: str, performance_data: dict):
    """Generate AI-powered performance insights using LLM"""
    try:
        if not performance_data:
            return "No performance data available for analysis."
        
        # Prepare data summary for LLM
        data_summary = f"""
Child: {performance_data['child_info']['name']}
Age: {performance_data['child_info']['date_of_birth']}
Gender: {performance_data['child_info']['gender']}

Performance Summary:
- Dance Doodle Game: {performance_data['dance_doodle']['sessions']} sessions, avg score: {performance_data['dance_doodle']['average_score']:.1f}
- Gesture Game: {performance_data['gesture_game']['sessions']} sessions, avg score: {performance_data['gesture_game']['average_score']:.1f}
- Gaze Game: {performance_data['gaze_game']['sessions']} sessions
- Mirror Posture Game: {performance_data['mirror_posture']['sessions']} sessions
- Repeat With Me Game: {performance_data['repeat_with_me']['sessions']} sessions, avg score: {performance_data['repeat_with_me']['average_score']:.1f}
"""
        
        prompt = f"""As an AI assistant for NeuroNurture, analyze this child's performance data and provide a personalized, encouraging message for their parent.

{data_summary}

Generate a warm, supportive message that:

dont give greetings or sign-offs like this "Dear Parent of Mehraz,"

Celebrates the child’s achievements and progress

Provides a simple one-line insight on how the child is playing in 2-3 randomly selected games (not all)

Gives a short one-line advice for each of those games

Uses an encouraging, parent-friendly tone with optional emojis

Keeps the response very short and simple (2-3 sentences total)

Does not use any formatting like this "**Dance Doodle Game:**"

For each game there should be sections.

Focus only on the selected games with brief insights and advice, nothing extra.
"""

        response = simple_langchain_agent.claude_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text
        
    except Exception as e:
        logger.error(f"Error generating performance insights: {e}")
        return "Unable to generate performance insights at this time. Please try again later."
