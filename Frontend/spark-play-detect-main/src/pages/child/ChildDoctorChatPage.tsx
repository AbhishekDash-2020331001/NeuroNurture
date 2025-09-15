import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  childId: number;
  doctorId: number;
  senderType: 'child' | 'doctor';
  senderId: number;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface ChildDoctorChatPageProps {
  childId: string;
  childName: string;
  doctorId: number;
  doctorName: string;
}

export default function ChildDoctorChatPage({ childId, childName, doctorId, doctorName }: ChildDoctorChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
    // Mark messages as read when component mounts
    markMessagesAsRead();
  }, [childId, doctorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8082/api/parents/chat/history/${childId}/${doctorId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const chatMessages = await response.json();
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await fetch(`http://localhost:8082/api/parents/chat/mark-read/${childId}/${doctorId}/child`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      setError(null);

      const response = await fetch('http://localhost:8082/api/parents/chat/send-from-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId: parseInt(childId),
          doctorId: doctorId,
          message: newMessage.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const sentMessage = await response.json();
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto">
      {/* Chat Header */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-1.5 rounded-full">
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Chat with {doctorName}</h3>
              <p className="text-xs text-gray-600">Patient: {childName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Messages Area */}
      <Card className="flex-1 mb-4">
        <CardContent className="p-4 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages yet. Start a conversation with your doctor!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'child' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderType === 'child'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        {message.senderType === 'child' ? childName : doctorName}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderType === 'child' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
