// Ticket service for parent frontend
const PARENT_SERVICE_URL = 'http://localhost:8082';

export interface Ticket {
  id: string;
  parentId: number;
  adminId?: number;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: Message[];
}

export interface Message {
  id: string;
  senderId: number;
  senderType: 'PARENT' | 'ADMIN';
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface CreateTicketRequest {
  parentId: number;
  subject: string;
  description: string;
  priority: string;
}

export const ticketService = {
  // Get all tickets for a parent
  async getTicketsByParentId(parentId: number): Promise<Ticket[]> {
    try {
      const response = await fetch(`${PARENT_SERVICE_URL}/api/tickets/parent/${parentId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  },

  // Get a specific ticket by ID
  async getTicketById(ticketId: string): Promise<Ticket | null> {
    try {
      const response = await fetch(`${PARENT_SERVICE_URL}/api/tickets/${ticketId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return null;
    }
  },

  // Create a new ticket
  async createTicket(request: CreateTicketRequest): Promise<Ticket | null> {
    try {
      const response = await fetch(`${PARENT_SERVICE_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating ticket:', error);
      return null;
    }
  },

  // Add a message to a ticket
  async addMessage(ticketId: string, content: string, senderId: number): Promise<Ticket | null> {
    try {
      const response = await fetch(`${PARENT_SERVICE_URL}/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          senderId,
          senderType: 'PARENT',
          content
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  }
};
