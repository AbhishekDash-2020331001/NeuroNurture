import ChatInterface from '@/features/parent/pages/ChatInterface';
import ChatList, { Chat } from '@/features/parent/pages/ChatList';
import FloatingAssistantButton from '@/features/parent/pages/FloatingAssistantButton';
import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import { Message, NuruService } from '@/shared/services/nuru/nuruService';
import React, { useEffect, useState } from 'react';

interface SchoolAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SchoolAssistant: React.FC<SchoolAssistantProps> = ({ isOpen, onToggle }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string>('school');

  const { school } = useSchoolAuth();

  // Get school ID from localStorage
  useEffect(() => {
    if (school?.id) {
      setUserId(school.id);
    } else {
      // Fallback: try to get from localStorage directly
      const savedSchool = localStorage.getItem('schoolAuth');
      if (savedSchool) {
        try {
          const schoolData = JSON.parse(savedSchool);
          setUserId(schoolData.id);
        } catch (error) {
          console.error('Error parsing school data from localStorage:', error);
        }
      }
    }
  }, [school]);

  // Load conversations from Spring Boot service
  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  const loadConversations = async () => {
    if (!userId) return;
    
    try {
      const response = await NuruService.getConversations(role, userId);
      
      // Transform Conversation[] to Chat[]
      const transformedChats: Chat[] = (response.conversations || []).map(conv => ({
        id: conv.id,
        title: conv.title,
        lastMessage: conv.lastMessage || '',
        timestamp: new Date(conv.createdAt),
        unreadCount: 0,
        isActive: false
      }));
      
      setChats(transformedChats);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setChats([]);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!userId) return;
    
    try {
      const response = await NuruService.getMessages(role, userId, conversationId);
      setMessages(prev => ({
        ...prev,
        [conversationId]: response.messages || []
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createNewChat = () => {
    setActiveChatId(null);
    setMessages(prev => ({
      ...prev,
      'new': []
    }));
  };

  const selectChat = (chatId: string) => {
    setActiveChatId(chatId);
    if (!messages[chatId]) {
      loadMessages(chatId);
    }
  };

  const sendMessage = async (message: string) => {
    if (!userId) return;

    const currentChatId = activeChatId || 'new';
    
    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user' as 'user' | 'assistant',
      timestamp: new Date().toISOString(),
      isTyping: false
    };

    setMessages(prev => ({
      ...prev,
      [currentChatId]: [...(prev[currentChatId] || []), userMessage]
    }));

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      content: '',
      sender: 'assistant' as 'user' | 'assistant',
      timestamp: new Date().toISOString(),
      isTyping: true
    };

    setMessages(prev => ({
      ...prev,
      [currentChatId]: [...(prev[currentChatId] || []), typingMessage]
    }));

    try {
      setIsLoading(true);
      
      const apiResponse = await NuruService.sendMessage({
        message,
        userType: role,
        userId,
        conversationId: activeChatId || undefined
      });

      // Remove typing indicator
      setMessages(prev => ({
        ...prev,
        [currentChatId]: prev[currentChatId]?.filter(msg => msg.id !== 'typing') || []
      }));

      // Add AI response with typing effect
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: '',
        sender: 'assistant' as 'user' | 'assistant',
        timestamp: new Date().toISOString(),
        isTyping: false
      };

      setMessages(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), aiMessage]
      }));

      // Simulate typing effect
      const responseText = apiResponse.response;
      let displayText = '';
      for (let i = 0; i < responseText.length; i++) {
        displayText += responseText[i];
        setMessages(prev => ({
          ...prev,
          [currentChatId]: prev[currentChatId]?.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, content: displayText }
              : msg
          ) || []
        }));
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // Update chat list
      if (activeChatId) {
        // Update existing chat
        setChats(prev => prev.map(chat => 
          chat.id === activeChatId 
            ? { ...chat, lastMessage: responseText, timestamp: new Date() }
            : chat
        ));
      } else {
        // Create new chat
        const newChat: Chat = {
          id: apiResponse.conversationId,
          title: message.length > 50 ? message.substring(0, 50) + '...' : message,
          lastMessage: responseText,
          timestamp: new Date(),
          unreadCount: 0,
          isActive: false
        };
        
        setChats(prev => [newChat, ...prev]);
        setActiveChatId(apiResponse.conversationId);
        
        // Move messages from 'new' to actual conversation ID
        setMessages(prev => {
          const newMessages = prev['new'] || [];
          return {
            ...prev,
            [apiResponse.conversationId]: newMessages,
            'new': []
          };
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator and show error
      setMessages(prev => ({
        ...prev,
        [currentChatId]: [
          ...(prev[currentChatId]?.filter(msg => msg.id !== 'typing') || []),
          {
            id: Date.now().toString(),
            content: 'Sorry, I encountered an error. Please try again.',
            sender: 'assistant' as 'user' | 'assistant',
            timestamp: new Date().toISOString(),
            isTyping: false
          }
        ]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!userId) return;
    
    try {
      await NuruService.deleteConversation(role, userId, chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
      
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[chatId];
        return newMessages;
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const currentChat = activeChatId ? chats.find(chat => chat.id === activeChatId) : null;
  const currentMessages = activeChatId ? messages[activeChatId] || [] : messages['new'] || [];

  // Convert messages to the format expected by ChatInterface
  const formattedMessages = currentMessages.map(msg => ({
    ...msg,
    timestamp: new Date(msg.timestamp),
    sender: msg.sender as 'user' | 'assistant'
  }));

  const clearChat = () => {
    if (activeChatId) {
      deleteChat(activeChatId);
    } else {
      setMessages(prev => ({
        ...prev,
        'new': []
      }));
    }
  };

  if (!isOpen) {
    return <FloatingAssistantButton isOpen={isOpen} onClick={onToggle} />;
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black bg-opacity-50 flex">
      <div className="bg-white w-full max-w-6xl mx-auto my-4 rounded-lg shadow-xl flex">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <ChatList
            chats={chats || []}
            activeChatId={activeChatId}
            onChatSelect={selectChat}
            onNewChat={createNewChat}
            onDeleteChat={deleteChat}
            onRenameChat={(chatId: string, newTitle: string) => {
              // Handle rename if needed
              console.log('Rename chat:', chatId, newTitle);
            }}
          />
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {(activeChatId && currentChat) || activeChatId === null ? (
            <ChatInterface
              messages={formattedMessages}
              onSendMessage={sendMessage}
              onClearChat={clearChat}
              isLoading={isLoading}
              chatTitle={currentChat?.title || 'New Chat'}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No chat selected</h3>
                <p className="text-sm">Choose a conversation or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolAssistant;
