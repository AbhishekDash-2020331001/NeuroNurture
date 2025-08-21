interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

class GeminiService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

  constructor() {
    // Get API key from environment variable
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file');
    }
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      console.log('Sending message to Gemini:', message);
      
      const requestBody: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: this.createPrompt(message)
              }
            ]
          }
        ]
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      console.log('Gemini response data:', data);
      
      if (data.candidates && data.candidates.length > 0) {
        const responseText = data.candidates[0].content.parts[0].text;
        console.log('Gemini response text:', responseText);
        return responseText;
      } else {
        throw new Error('No response from Gemini');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  private createPrompt(userMessage: string): string {
    return `You are Ella, a friendly and helpful girl who loves to help children learn and have fun. You should:

1. Be warm, encouraging, and child-friendly in your responses
2. Use simple language that children can understand
3. Include appropriate emojis to make responses engaging
4. Be educational and informative while being fun
5. Keep responses concise but helpful
6. Always be positive and supportive
7. If asked about inappropriate topics, gently redirect to appropriate subjects
8. Use a conversational tone as if talking to a friend
9. Always introduce yourself as Ella
10. Act like a friendly older sister or friend, not a robot or AI

User message: ${userMessage}

Please respond in a child-friendly way with appropriate emojis and simple language, as if you're a friendly girl named Ella.`;
  }

  // Fallback responses for when API is not available
  getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Contextual responses based on the user's message
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello there! 👋 I'm so happy to chat with you! How are you doing today?";
    }
    
    if (lowerMessage.includes('how are you')) {
      return "I'm doing great, thank you for asking! 😊 I'm excited to help you learn and explore today!";
    }
    
         if (lowerMessage.includes('name')) {
       return "My name is Ella! 👧 I'm your friendly friend who loves to help you learn and have fun! What's your name?";
     }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return "I can help you with lots of things! 📚 I can answer questions, help with homework, tell stories, explain science, math, history, and much more! What would you like to learn about?";
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're very welcome! 😊 I love helping you learn and discover new things!";
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return "Goodbye! 👋 It was wonderful chatting with you! Come back anytime!";
    }
    
    if (lowerMessage.includes('weather')) {
      return "I'd love to help you with weather information! 🌤️ However, I don't have access to real-time weather data right now. You could check a weather app or website for the current forecast!";
    }
    
    if (lowerMessage.includes('story') || lowerMessage.includes('tell me a story')) {
      return "I'd be happy to tell you a story! 📖 What kind of story would you like? A fairy tale, adventure story, or maybe a story about animals?";
    }
    
    if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
      return "Here's a fun joke for you! 😄 Why don't scientists trust atoms? Because they make up everything! Get it? 😂";
    }
    
    // Default responses for other messages
    const defaultResponses = [
      `That's a great question about "${userMessage}"! 🤔 I'd love to help you learn more about that. Can you tell me what specifically you'd like to know?`,
      `Interesting! You're asking about "${userMessage}"! 🌟 I'm here to help you explore and discover new things. What would you like to learn?`,
      `You're curious about "${userMessage}"! 🧠 That's wonderful! I'd be happy to help you understand this better.`,
      `Great question about "${userMessage}"! ✨ I'm excited to help you learn something new today!`,
      `You're asking about "${userMessage}"! 🌈 I love helping curious minds like yours explore new topics!`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
}

export default new GeminiService();
