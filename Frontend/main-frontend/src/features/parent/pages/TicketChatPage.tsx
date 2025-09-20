import Navbar from '@/components/common/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Message, Ticket, ticketService } from '@/shared/services/ticket/ticketService';
import {
    AlertCircle,
    ArrowLeft,
    Bot,
    CheckCircle,
    Clock,
    Send,
    User,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TicketChatPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!ticketId) return;

      try {
        // Get parent ID
        const emailResponse = await fetch('http://localhost:8080/auth/me', { 
          credentials: 'include' 
        });
        const email = await emailResponse.text();
        
        const parentResponse = await fetch(`http://localhost:8082/api/parents/by-email/${email}`, {
          credentials: 'include'
        });
        
        if (parentResponse.ok) {
          const parent = await parentResponse.json();
          setParentId(parent.id);
        }

        // Fetch ticket
        const ticketData = await ticketService.getTicketById(ticketId);
        if (ticketData) {
          setTicket(ticketData);
        } else {
          navigate('/tickets');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticketId, navigate]);

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
    
    if (!newMessage.trim() || !ticketId || !parentId || sending) return;

    setSending(true);

    try {
      const updatedTicket = await ticketService.addMessage(
        ticketId,
        newMessage.trim(),
        parentId
      );

      if (updatedTicket) {
        setTicket(updatedTicket);
        setNewMessage('');
        // Scroll to bottom
        setTimeout(() => {
          const chatContainer = document.getElementById('chat-container');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">Ticket not found</p>
            <Button onClick={() => navigate('/tickets')} className="mt-4">
              Back to Tickets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/tickets')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tickets</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Ticket Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600">{ticket.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <Badge className={`${getStatusColor(ticket.status)} border`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(ticket.status)}
                        <span>{ticket.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Priority</span>
                    <Badge className={`${getPriorityColor(ticket.priority)} border`}>
                      {ticket.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Created</span>
                    <span className="text-sm text-gray-600">{formatDate(ticket.createdAt)}</span>
                  </div>

                  {ticket.adminId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Assigned To</span>
                      <span className="text-sm text-gray-600">Admin #{ticket.adminId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white border border-gray-200 h-[600px] flex flex-col">
              <CardHeader className="pb-4 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900">Conversation</CardTitle>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4" id="chat-container">
                <div className="space-y-4">
                  {ticket.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    ticket.messages.map((message: Message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'PARENT' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderType === 'PARENT'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.senderType === 'PARENT' ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                            <span className="text-xs font-medium">
                              {message.senderType === 'PARENT' ? 'You' : 'Admin'}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderType === 'PARENT' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatDate(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>

              {/* Message Input */}
              {ticket.status !== 'CLOSED' && (
                <div className="border-t border-gray-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                      disabled={sending}
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {ticket.status === 'CLOSED' && (
                <div className="border-t border-gray-200 p-4 text-center text-gray-500">
                  <p>This ticket has been closed and no new messages can be sent.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketChatPage;
