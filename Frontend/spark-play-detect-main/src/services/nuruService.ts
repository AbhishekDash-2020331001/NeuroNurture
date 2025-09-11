// NuruAgent API Service
const NURU_API_BASE_URL = 'http://localhost:8010';

export interface NuruChatRequest {
  message: string;
  user_type: string;
  user_id?: string;
}

export interface NuruChatResponse {
  response: string;
  error?: boolean;
}

export class NuruService {
  static async sendMessage(request: NuruChatRequest): Promise<NuruChatResponse> {
    try {
      const response = await fetch(`${NURU_API_BASE_URL}/chat`, {
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
      console.error('Error calling NuruAgent API:', error);
      // Return a fallback response if API is unavailable
      return {
        response: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        error: true
      };
    }
  }

  static async getAvailableRoles(): Promise<{ roles: Array<{ value: string; label: string }> }> {
    try {
      const response = await fetch(`${NURU_API_BASE_URL}/roles`);
      
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
