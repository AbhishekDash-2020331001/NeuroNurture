import React, { useState, useEffect } from 'react';
import FloatingAssistantButton from './FloatingAssistantButton';
import ChatList, { Chat } from './ChatList';
import ChatInterface, { Message } from './ChatInterface';
import './assistant-animations.css';

interface AssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Assistant: React.FC<AssistantProps> = ({ isOpen, onToggle }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load chats from localStorage on component mount
  useEffect(() => {
    const savedChats = localStorage.getItem('assistant-chats');
    const savedMessages = localStorage.getItem('assistant-messages');
    
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
        ...chat,
        timestamp: new Date(chat.timestamp)
      }));
      setChats(parsedChats);
    } else {
      // Add some dummy chats for demonstration
      const dummyChats: Chat[] = [
        {
          id: '1',
          title: 'Help with child development',
          lastMessage: 'Thank you for the advice!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          unreadCount: 0,
          isActive: false
        },
        {
          id: '2',
          title: 'Autism support questions',
          lastMessage: 'That makes sense, I\'ll try that approach.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          unreadCount: 1,
          isActive: false
        },
        {
          id: '3',
          title: 'Learning activities for 5-year-old',
          lastMessage: 'Great suggestions!',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          unreadCount: 0,
          isActive: false
        },
        {
          id: '4',
          title: 'Behavior management tips',
          lastMessage: 'I\'ll implement these strategies.',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          unreadCount: 0,
          isActive: false
        },
        {
          id: '5',
          title: 'Speech therapy exercises',
          lastMessage: 'The exercises are working well!',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          unreadCount: 0,
          isActive: false
        },
        {
          id: '6',
          title: 'Sensory processing issues',
          lastMessage: 'Thanks for the recommendations.',
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
          unreadCount: 0,
          isActive: false
        },
        {
          id: '7',
          title: 'School preparation advice',
          lastMessage: 'This is very helpful!',
          timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
          unreadCount: 0,
          isActive: false
        },
        {
          id: '8',
          title: 'Social skills development',
          lastMessage: 'I\'ll try these activities.',
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
          unreadCount: 0,
          isActive: false
        },
        {
          id: '9',
          title: 'Sleep routine problems',
          lastMessage: 'The routine is much better now.',
          timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          unreadCount: 0,
          isActive: false
        },
        {
          id: '10',
          title: 'Mealtime challenges',
          lastMessage: 'Thank you for your help!',
          timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
          unreadCount: 0,
          isActive: false
        }
      ];
      setChats(dummyChats);
    }
    
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      const messagesWithDates = Object.keys(parsedMessages).reduce((acc, chatId) => {
        acc[chatId] = parsedMessages[chatId].map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        return acc;
      }, {} as { [chatId: string]: Message[] });
      setMessages(messagesWithDates);
    } else {
      // Add some dummy messages for demonstration
      const dummyMessages: { [chatId: string]: Message[] } = {
        '1': [
          {
            id: '1-1',
            content: 'Hi! I need help with my 4-year-old child\'s development. They seem to be behind in speech compared to other kids their age.',
            sender: 'user',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '1-2',
            content: 'I understand your concern about your child\'s speech development. Every child develops at their own pace, but there are some signs we can look for and strategies to support their language development.\n\nHere are some things you can try:\n\n1. **Read together daily** - Even 10-15 minutes can make a big difference\n2. **Talk about everything** - Describe what you\'re doing, what you see, etc.\n3. **Use simple, clear language** - Avoid baby talk\n4. **Give them time to respond** - Don\'t rush to fill silences\n5. **Celebrate attempts** - Even if words aren\'t perfect, acknowledge their effort\n\nWould you like me to suggest some specific activities or games that might help?',
            sender: 'assistant',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000)
          },
          {
            id: '1-3',
            content: 'Thank you for the advice! I\'ll start implementing these strategies right away.',
            sender: 'user',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000)
          }
        ],
        '2': [
          {
            id: '2-1',
            content: 'My child was recently diagnosed with autism. I\'m feeling overwhelmed and don\'t know where to start.',
            sender: 'user',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          {
            id: '2-2',
            content: 'I can only imagine how overwhelming this must feel. Please know that you\'re not alone, and there are many resources and support systems available to help you and your child.\n\nHere are some immediate steps you can take:\n\n1. **Connect with support groups** - Other parents can be invaluable resources\n2. **Work with early intervention services** - They can provide specialized support\n3. **Create a structured routine** - Many children with autism thrive with predictability\n4. **Focus on your child\'s strengths** - Every child has unique abilities\n5. **Take care of yourself** - You can\'t pour from an empty cup\n\nRemember, this diagnosis doesn\'t change who your child is - they\'re still the same wonderful person you love.',
            sender: 'assistant',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45000)
          }
        ]
      };
      setMessages(dummyMessages);
    }
  }, []);

  // Save chats and messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('assistant-chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('assistant-messages', JSON.stringify(messages));
  }, [messages]);

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat: Chat = {
      id: newChatId,
      title: `Chat ${chats.length + 1}`,
      lastMessage: 'New conversation started',
      timestamp: new Date(),
      unreadCount: 0,
      isActive: false
    };

    setChats(prev => [newChat, ...prev]);
    setMessages(prev => ({
      ...prev,
      [newChatId]: []
    }));
    setActiveChatId(newChatId);
  };

  const selectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setChats(prev => prev.map(chat => ({
      ...chat,
      isActive: chat.id === chatId,
      unreadCount: chat.id === chatId ? 0 : chat.unreadCount
    })));
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[chatId];
      return newMessages;
    });
    
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const renameChat = (chatId: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const sendMessage = async (content: string) => {
    if (!activeChatId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message
    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), userMessage]
    }));

    // Update chat last message
    setChats(prev => prev.map(chat => 
      chat.id === activeChatId 
        ? { ...chat, lastMessage: content, timestamp: new Date() }
        : chat
    ));

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
      [activeChatId]: [...(prev[activeChatId] || []), typingMessage]
    }));

    // Simulate AI response with character-by-character typing effect
    setTimeout(() => {
      const fullResponse = generateAIResponse(content);
      
      // Remove typing message and add empty response message
      const responseMessageId = (Date.now() + 2).toString();
      const responseMessage: Message = {
        id: responseMessageId,
        content: '',
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => {
        const currentMessages = prev[activeChatId] || [];
        const messagesWithoutTyping = currentMessages.filter(msg => msg.id !== typingMessageId);
        
        return {
          ...prev,
          [activeChatId]: [...messagesWithoutTyping, responseMessage]
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
            [activeChatId]: prev[activeChatId].map(msg => 
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
            chat.id === activeChatId 
              ? { ...chat, lastMessage: fullResponse, timestamp: new Date() }
              : chat
          ));
          setIsLoading(false);
        }
      };
      
      // Start typing after a short delay
      setTimeout(typeText, 30);
    }, 500);
  };

  const generateAIResponse = (userMessage: string): string => {
    // Simple response generation (replace with actual AI integration)
    const responses = [
      "That's a great question! Based on your child's profile, I'd recommend focusing on sensory-friendly activities that can help with their development.",
      "I understand your concern. Many parents face similar challenges. Let me suggest some strategies that have worked well for other families.",
      "That's an important observation. Early intervention and consistent support can make a significant difference in your child's progress.",
      "I'm here to help you navigate this journey. Would you like me to provide more specific guidance based on your child's current needs?",
      "Thank you for sharing that with me. It sounds like you're doing a wonderful job supporting your child's development.",
      "Based on what you've shared, I can suggest some evidence-based approaches that have shown positive results for children with similar needs.",
      "It's completely normal to have these concerns. Let me help you understand what to expect and how to best support your child.",
      "I appreciate you reaching out. Your proactive approach to your child's development is commendable. Let's work together to find the best solutions."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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

  const currentMessages = activeChatId ? messages[activeChatId] || [] : [];
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
              {activeChatId && currentChat ? (
                <ChatInterface
                  messages={currentMessages}
                  onSendMessage={sendMessage}
                  onClearChat={clearChat}
                  isLoading={isLoading}
                  chatTitle={currentChat.title}
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

export default Assistant;
