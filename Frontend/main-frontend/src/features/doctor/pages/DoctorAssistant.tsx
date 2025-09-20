import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import '@/features/parent/pages/assistant-animations.css';
import ChatInterface, { Message } from '@/features/parent/pages/ChatInterface';
import ChatList, { Chat } from '@/features/parent/pages/ChatList';
import FloatingAssistantButton from '@/features/parent/pages/FloatingAssistantButton';
import { Conversation, NuruService, Message as ServiceMessage } from '@/shared/services/nuru/nuruService';
import React, { useEffect, useState } from 'react';

interface DoctorAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

const DoctorAssistant: React.FC<DoctorAssistantProps> = ({ isOpen, onToggle }) => {
  const { doctor } = useDoctorAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string>('doctor');

  // Set user data from doctor context
  useEffect(() => {
    if (doctor) {
      setUserId(parseInt(doctor.id));
      setRole('doctor');
    }
  }, [doctor]);

  // Load conversations from Spring Boot service
  useEffect(() => {
    const loadConversations = async () => {
      if (!userId || !role) return;
      
      try {
        const response = await NuruService.getConversations(role, userId.toString());
        console.log('Doctor conversations response:', response);
        
        const conversationChats: Chat[] = response.conversations.map((conv: Conversation) => ({
          id: conv.id,
          title: conv.title,
          lastMessage: conv.lastMessage,
          timestamp: new Date(conv.lastMessageTime),
          unreadCount: 0,
          isActive: false
        }));
        
        setChats(conversationChats);
      } catch (error) {
        console.error('Error loading doctor conversations:', error);
      }
    };

    loadConversations();
  }, [userId, role]);

  // Load messages for a specific conversation
  const loadMessages = async (conversationId: string) => {
    if (!userId || !role) return;
    
    try {
      const response = await NuruService.getMessages(role, userId.toString(), conversationId);
      console.log('Doctor messages response:', response);
      
      const frontendMessages: Message[] = response.messages.map((msg: ServiceMessage) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender as "user" | "assistant",
        timestamp: new Date(msg.timestamp),
        isTyping: msg.isTyping
      }));
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: frontendMessages
      }));
    } catch (error) {
      console.error('Error loading doctor messages:', error);
    }
  };

  const createNewChat = () => {
    setActiveChatId(null); // Signal new chat creation
    setMessages(prev => ({
      ...prev,
      'new': []
    }));
  };

  const selectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setChats(prev => prev.map(chat => ({
      ...chat,
      isActive: chat.id === chatId,
      unreadCount: chat.id === chatId ? 0 : chat.unreadCount
    })));
    
    // Load messages for this conversation
    loadMessages(chatId);
  };

  const deleteChat = async (chatId: string) => {
    if (!userId || !role) return;
    
    try {
      await NuruService.deleteConversation(role, userId.toString(), chatId);
      
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[chatId];
        return newMessages;
      });
      
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
    } catch (error) {
      console.error('Error deleting doctor conversation:', error);
    }
  };

  const renameChat = (chatId: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const sendMessage = async (content: string) => {
    if (!userId || !role) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    // Determine the chat ID to use
    const currentChatId = activeChatId || 'new';
    
    // Add user message immediately
    setMessages(prev => ({
      ...prev,
      [currentChatId]: [...(prev[currentChatId] || []), userMessage]
    }));

    setIsLoading(true);

    // Add typing indicator message
    const typingMessageId = (Date.now() + 1).toString();
    const typingMessage: Message = {
      id: typingMessageId,
      content: '',
      sender: 'assistant',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => ({
      ...prev,
      [currentChatId]: [...(prev[currentChatId] || []), typingMessage]
    }));

    // Call Spring Boot Chat Service
    setTimeout(async () => {
      try {
        const apiResponse = await NuruService.sendMessage({
          message: content,
          userType: role,
          userId: userId.toString(),
          conversationId: activeChatId || undefined
        });

        const fullResponse = apiResponse.response || "I'm sorry, I couldn't process your request right now.";
        
        // If this is a new conversation, update activeChatId and move messages
        if (!activeChatId && apiResponse.conversationId) {
          const newChatId = apiResponse.conversationId;
          
          // Move messages from 'new' to the actual conversation ID
          setMessages(prev => {
            const newMessages = { ...prev };
            if (newMessages['new']) {
              newMessages[newChatId] = newMessages['new'];
              delete newMessages['new'];
            }
            return newMessages;
          });
          
          setActiveChatId(newChatId);
          
          // Add new conversation to chats list
          const newChat: Chat = {
            id: newChatId,
            title: content.length > 50 ? content.substring(0, 50) + '...' : content,
            lastMessage: fullResponse,
            timestamp: new Date(),
            unreadCount: 0,
            isActive: true
          };
          
          setChats(prev => [newChat, ...prev]);
        }
        
        const responseMessageId = (Date.now() + 2).toString();
        const responseMessage: Message = {
          id: responseMessageId,
          content: '',
          sender: 'assistant',
          timestamp: new Date()
        };

        const finalChatId = activeChatId || apiResponse.conversationId || currentChatId;
        
        setMessages(prev => {
          const currentMessages = prev[finalChatId] || [];
          const messagesWithoutTyping = currentMessages.filter(msg => msg.id !== typingMessageId);
          
          return {
            ...prev,
            [finalChatId]: [...messagesWithoutTyping, responseMessage]
          };
        });

        // Character-by-character typing effect
        let currentText = '';
        let charIndex = 0;
        
        const typeText = () => {
          if (charIndex < fullResponse.length) {
            currentText += fullResponse[charIndex];
            charIndex++;
            
            // Update the message with current text
            setMessages(prev => ({
              ...prev,
              [finalChatId]: prev[finalChatId].map(msg => 
                msg.id === responseMessageId 
                  ? { ...msg, content: currentText }
                  : msg
              )
            }));
            
            // Random delay between characters (5-15ms for very fast typing speed)
            const delay = Math.random() * 10 + 5;
            setTimeout(typeText, delay);
          } else {
            // Typing complete - update chat last message
            setChats(prev => prev.map(chat => 
              chat.id === finalChatId 
                ? { ...chat, lastMessage: fullResponse, timestamp: new Date() }
                : chat
            ));
            setIsLoading(false);
          }
        };
        
        // Start typing after a short delay
        setTimeout(typeText, 30);
      } catch (error) {
        console.error('Error calling Nuru Chat Service for doctor:', error);
        
        // Fallback response
        const fallbackResponse = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
        
        // Remove typing message and add fallback response
        const responseMessageId = (Date.now() + 2).toString();
        const responseMessage: Message = {
          id: responseMessageId,
          content: fallbackResponse,
          sender: 'assistant',
          timestamp: new Date()
        };

        const errorChatId = activeChatId || 'new';
        
        setMessages(prev => {
          const currentMessages = prev[errorChatId] || [];
          const messagesWithoutTyping = currentMessages.filter(msg => msg.id !== typingMessageId);
          
          return {
            ...prev,
            [errorChatId]: [...messagesWithoutTyping, responseMessage]
          };
        });

        // Update chat last message
        setChats(prev => prev.map(chat => 
          chat.id === errorChatId 
            ? { ...chat, lastMessage: fallbackResponse, timestamp: new Date() }
            : chat
        ));
        setIsLoading(false);
      }
    }, 500);
  };

  const clearChat = () => {
    if (!activeChatId) return;
    
    setMessages(prev => ({
      ...prev,
      [activeChatId]: []
    }));
  };

  const getTotalUnreadCount = () => {
    return chats.reduce((total, chat) => total + chat.unreadCount, 0);
  };

  const currentMessages = activeChatId ? messages[activeChatId] || [] : (activeChatId === null ? messages['new'] || [] : []);
  const currentChat = chats.find(chat => chat.id === activeChatId);

  return (
    <>
      {/* Floating Button */}
      <FloatingAssistantButton
        isOpen={isOpen}
        onClick={onToggle}
        unreadCount={getTotalUnreadCount()}
      />

      {/* Assistant Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-20 animate-in fade-in duration-300"
            onClick={onToggle}
          />
          
          {/* Assistant Panel */}
          <div className="relative w-1/2 h-full bg-white shadow-2xl flex animate-in slide-in-from-right duration-300" style={{ top: '65px', height: 'calc(100vh - 80px)' }}>
            {/* Chat List */}
            <div className="w-48 border-r border-gray-200 flex-shrink-0">
              <ChatList
                chats={chats}
                activeChatId={activeChatId}
                onChatSelect={selectChat}
                onNewChat={createNewChat}
                onDeleteChat={deleteChat}
                onRenameChat={renameChat}
              />
            </div>

            {/* Chat Interface */}
            <div className="flex-1">
              {(activeChatId && currentChat) || activeChatId === null ? (
                <ChatInterface
                  messages={currentMessages}
                  onSendMessage={sendMessage}
                  onClearChat={clearChat}
                  isLoading={isLoading}
                  chatTitle={currentChat?.title || "New Chat"}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">Select a chat to start</h3>
                    <p className="text-sm">Choose an existing conversation or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorAssistant;
