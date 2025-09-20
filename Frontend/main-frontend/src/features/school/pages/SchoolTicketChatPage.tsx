import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import { ArrowLeft, Bot, Send, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SchoolTicketChatPage = () => {
  const { school } = useSchoolAuth();
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Simple alert for now
    alert('Message sent! (This is a demo - no actual message was sent)');
    setNewMessage('');
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/school/tickets')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticketId}</h1>
          <p className="text-gray-600">Support conversation</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Support Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {/* Demo messages */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm">I need help with my account settings. Can you please assist me?</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <p className="text-sm">Hello! I'd be happy to help you with your account settings. What specific issue are you experiencing?</p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                rows={3}
              />
              <Button type="submit" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolTicketChatPage;
