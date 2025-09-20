// Nuru Chat Service API
const NURU_CHAT_API_BASE_URL = 'http://localhost:8094';

export interface NuruChatRequest {
  message: string;
  userType: string;
  userId: string;
  conversationId?: string;
  context?: string; // Optional conversation context
}

export interface NuruChatResponse {
  response: string;
  conversationId: string;
  userType: string;
  userId: string;
  timestamp: string;
  error: boolean;
  errorMessage?: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
  createdAt: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isTyping: boolean;
}

export class NuruService {
  static async sendMessage(request: NuruChatRequest): Promise<NuruChatResponse> {
    try {
      const response = await fetch(`${NURU_CHAT_API_BASE_URL}/api/v1/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling Nuru Chat API:', error);
      // Return a fallback response if API is unavailable
      return {
        response: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        conversationId: '',
        userType: request.userType,
        userId: request.userId,
        timestamp: new Date().toISOString(),
        error: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getConversations(userType: string, userId: string): Promise<{ conversations: Conversation[] }> {
    try {
      const response = await fetch(`${NURU_CHAT_API_BASE_URL}/api/v1/chat/conversations/${userType}/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { conversations: data.conversations || [] };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { conversations: [] };
    }
  }

  static async getMessages(userType: string, userId: string, conversationId: string): Promise<{ messages: Message[] }> {
    try {
      const response = await fetch(`${NURU_CHAT_API_BASE_URL}/api/v1/chat/conversations/${userType}/${userId}/${conversationId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { messages: data.messages || [] };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { messages: [] };
    }
  }

  static async deleteConversation(userType: string, userId: string, conversationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${NURU_CHAT_API_BASE_URL}/api/v1/chat/conversations/${userType}/${userId}/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  static async getAvailableRoles(): Promise<{ roles: Array<{ value: string; label: string }> }> {
    try {
      const response = await fetch(`${NURU_CHAT_API_BASE_URL}/roles`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      return {
        roles: [
          { value: "parent", label: "Parent" },
          { value: "school", label: "School" },
          { value: "admin", label: "Admin" }
        ]
      };
    }
  }
}
