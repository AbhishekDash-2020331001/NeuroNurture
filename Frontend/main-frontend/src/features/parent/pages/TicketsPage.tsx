import Navbar from '@/components/common/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket, ticketService } from '@/shared/services/ticket/ticketService';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    MessageSquare,
    MoreHorizontal,
    Plus,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    const fetchParentIdAndTickets = async () => {
      try {
        // Get parent ID from email
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
          
          // Fetch tickets
          const ticketsData = await ticketService.getTicketsByParentId(parent.id);
          setTickets(ticketsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParentIdAndTickets();
  }, []);

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

  const handleCreateTicket = () => {
    navigate('/tickets/new');
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tickets...</p>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600 mt-2">Manage your support requests and get help from our team</p>
          </div>
          <Button 
            onClick={handleCreateTicket}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Ticket</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'RESOLVED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.filter(t => t.priority === 'URGENT').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets yet</h3>
              <p className="text-gray-600 mb-6">Create your first support ticket to get help from our team</p>
              <Button 
                onClick={handleCreateTicket}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create New Ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className="bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewTicket(ticket.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                        <Badge className={`${getStatusColor(ticket.status)} border`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(ticket.status)}
                            <span>{ticket.status.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                        <Badge className={`${getPriorityColor(ticket.priority)} border`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Created: {formatDate(ticket.createdAt)}</span>
                        <span>•</span>
                        <span>Messages: {ticket.messages.length}</span>
                        {ticket.adminId && (
                          <>
                            <span>•</span>
                            <span>Assigned to Admin</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTicket(ticket.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
