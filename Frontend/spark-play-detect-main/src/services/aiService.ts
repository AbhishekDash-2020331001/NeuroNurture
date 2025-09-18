// AI service for ticket classification and message refinement
const AI_SERVICE_URL = 'http://localhost:8005';

export interface TicketClassification {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  rewritten_message: string;
  reasoning: string;
  error?: boolean;
}

export interface ChatResponse {
  response: string;
  database_accessed?: boolean;
  web_searched?: boolean;
  tools_used?: number;
  error?: boolean;
}

export const aiService = {
  // Classify ticket priority and rewrite message
  async classifyTicket(message: string, userType: string = 'parent', userId?: number): Promise<TicketClassification> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/ticket/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          user_type: userType,
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error classifying ticket:', error);
      return {
        priority: 'MEDIUM',
        rewritten_message: message,
        reasoning: 'Error occurred during AI classification',
        error: true
      };
    }
  },

  // Get AI chat response
  async getChatResponse(message: string, userType: string = 'parent', userId?: number, context?: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          user_type: userType,
          user_id: userId,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting AI response:', error);
      return {
        response: 'I encountered an error while processing your request. Please try again.',
        error: true
      };
    }
  },

  // Check AI service health
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('AI service health check failed:', error);
      return false;
    }
  }
};
