import {
    AlertCircle,
    Bot,
    CheckCircle,
    Clock,
    MessageSquare,
    User,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../../components/common/badge';
import { Button } from '../../../components/common/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/card';

interface Ticket {
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

interface Message {
  id: string;
  senderId: number;
  senderType: 'PARENT' | 'ADMIN';
  content: string;
  timestamp: string;
  isRead: boolean;
}

const ADMIN_SERVICE_URL = 'http://localhost:8090';

const TicketManagement = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [adminId, setAdminId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAdminIdAndTickets = async () => {
      try {
        // Get admin user info from admin service
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No admin token found');
        }

        const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get admin info');
        }
        
        const adminData = await response.json();
        console.log('Admin data:', adminData);
        
        setAdminId(adminData.adminId);
        
        // Fetch tickets for this admin
        const ticketsData = await fetchTicketsByAdminId(adminData.adminId);
        setTickets(ticketsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminIdAndTickets();
  }, []);

  const fetchTicketsByAdminId = async (adminId: number): Promise<Ticket[]> => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }

      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/tickets/admin/${adminId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'CLOSED':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedTicket || !adminId || sending) return;

    setSending(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }

      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: adminId,
          senderType: 'ADMIN',
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        setSelectedTicket(updatedTicket);
        setNewMessage('');
        
        // Update tickets list
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred while sending the message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket || !adminId) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }

      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/tickets/${selectedTicket.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        setSelectedTicket(updatedTicket);
        
        // Update tickets list
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      } else {
        alert('Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating the status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
          {adminId && (
            <p className="text-sm text-gray-600 mt-1">
              Assigned to Admin ID: {adminId}
            </p>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">All Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tickets.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tickets assigned to you</p>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">{ticket.subject}</h3>
                      <Badge className={`${getStatusColor(ticket.status)} border text-xs`}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={`${getPriorityColor(ticket.priority)} border text-xs`}>
                        {ticket.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details and Chat */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="bg-white border border-gray-200 h-[600px] flex flex-col">
              <CardHeader className="pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {selectedTicket.subject}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{selectedTicket.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(selectedTicket.status)} border`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(selectedTicket.status)}
                        <span>{selectedTicket.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                    <Badge className={`${getPriorityColor(selectedTicket.priority)} border`}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {selectedTicket.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    selectedTicket.messages.map((message: Message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderType === 'ADMIN'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.senderType === 'ADMIN' ? (
                              <Bot className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                            <span className="text-xs font-medium">
                              {message.senderType === 'ADMIN' ? 'You' : 'Parent'}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderType === 'ADMIN' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatDate(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>

              {/* Message Input and Actions */}
              <div className="border-t border-gray-200 p-4 space-y-4">
                {selectedTicket.status !== 'CLOSED' && (
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sending}
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </Button>
                  </form>
                )}

                {/* Status Actions */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  {selectedTicket.status === 'OPEN' && (
                    <Button
                      onClick={() => handleUpdateStatus('IN_PROGRESS')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                    >
                      Mark In Progress
                    </Button>
                  )}
                  {selectedTicket.status === 'IN_PROGRESS' && (
                    <Button
                      onClick={() => handleUpdateStatus('RESOLVED')}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm"
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {selectedTicket.status === 'RESOLVED' && (
                    <Button
                      onClick={() => handleUpdateStatus('CLOSED')}
                      className="bg-gray-600 hover:bg-gray-700 text-white text-sm"
                    >
                      Close Ticket
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-white border border-gray-200 h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Select a ticket to view details and start chatting</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketManagement;