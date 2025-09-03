import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { 
  MessageSquare, 
  Send
} from 'lucide-react'

interface Ticket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'account' | 'general'
  userId: string
  userName: string
  userEmail: string
  userType: 'parent' | 'school' | 'doctor'
  createdAt: string
  updatedAt: string
  messages: Message[]
}

interface Message {
  id: string
  content: string
  sender: 'user' | 'admin'
  senderName: string
  timestamp: string
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Payment processing issue',
    description: 'Unable to complete subscription payment.',
    status: 'open',
    priority: 'high',
    category: 'billing',
    userId: 'user1',
    userName: 'Dr. Sarah Wilson',
    userEmail: 'dr.wilson@clinic.com',
    userType: 'doctor',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    messages: [
      {
        id: 'm1',
        content: 'Unable to complete subscription payment.',
        sender: 'user',
        senderName: 'Dr. Sarah Wilson',
        timestamp: '2024-01-15T10:30:00Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Cannot access child progress reports',
    description: 'Getting permission denied error.',
    status: 'in_progress',
    priority: 'medium',
    category: 'technical',
    userId: 'user2',
    userName: 'John Smith',
    userEmail: 'john.smith@email.com',
    userType: 'parent',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    messages: [
      {
        id: 'm2',
        content: 'Getting permission denied error.',
        sender: 'user',
        senderName: 'John Smith',
        timestamp: '2024-01-14T14:20:00Z'
      },
      {
        id: 'm3',
        content: 'Our technical team is investigating.',
        sender: 'admin',
        senderName: 'Admin Support',
        timestamp: '2024-01-15T09:15:00Z'
      }
    ]
  }
]

export default function TicketManagement() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all')
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set())
  const [replyMessages, setReplyMessages] = useState<Record<string, string>>({})

  const toggleTicketExpansion = (ticketId: string) => {
    const newExpanded = new Set(expandedTickets)
    if (newExpanded.has(ticketId)) {
      newExpanded.delete(ticketId)
    } else {
      newExpanded.add(ticketId)
    }
    setExpandedTickets(newExpanded)
  }

  const handleStatusChange = (ticketId: string, newStatus: Ticket['status']) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
          : ticket
      )
    )
  }

  const handleReply = (ticketId: string) => {
    const replyContent = replyMessages[ticketId]
    if (!replyContent?.trim()) return

    const newMessage: Message = {
      id: `m${Date.now()}`,
      content: replyContent,
      sender: 'admin',
      senderName: 'Admin Support',
      timestamp: new Date().toISOString()
    }

    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              messages: [...ticket.messages, newMessage],
              updatedAt: new Date().toISOString()
            }
          : ticket
      )
    )

    setReplyMessages(prev => ({ ...prev, [ticketId]: '' }))
  }

  const filteredTickets = selectedStatus === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.status === selectedStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100'
      case 'in_progress': return 'text-yellow-600 bg-yellow-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'urgent': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Ticket Management</h2>
        <div className="flex space-x-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
          >
            All Status
          </Button>
          <Button
            variant={selectedStatus === 'open' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('open')}
          >
            Open
          </Button>
          <Button
            variant={selectedStatus === 'in_progress' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('in_progress')}
          >
            In Progress
          </Button>
          <Button
            variant={selectedStatus === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('resolved')}
          >
            Resolved
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{ticket.title}</CardTitle>
                    <p className="text-sm text-gray-600">{ticket.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{ticket.userName}</p>
                  <p className="text-xs text-gray-500">{ticket.userEmail}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(ticket.createdAt)}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTicketExpansion(ticket.id)}
                  className="w-full justify-between text-left"
                >
                  <span>
                    {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                  </span>
                  {expandedTickets.has(ticket.id) ? 'Hide' : 'View'}
                </Button>
                
                <div className="flex space-x-2">
                  {ticket.status === 'open' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                    >
                      Start Progress
                    </Button>
                  )}
                  {ticket.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(ticket.id, 'resolved')}
                    >
                      Mark Resolved
                    </Button>
                  )}

                </div>
              </div>
              
              {expandedTickets.has(ticket.id) && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Conversation</h4>
                    <div className="space-y-3">
                      {ticket.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.sender === 'admin' 
                              ? 'bg-blue-100 ml-8' 
                              : 'bg-white mr-8'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {message.senderName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your reply..."
                      value={replyMessages[ticket.id] || ''}
                      onChange={(e) => setReplyMessages(prev => ({
                        ...prev,
                        [ticket.id]: e.target.value
                      }))}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleReply(ticket.id)}
                      disabled={!replyMessages[ticket.id]?.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
