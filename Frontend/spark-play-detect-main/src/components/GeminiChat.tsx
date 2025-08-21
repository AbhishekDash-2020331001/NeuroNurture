import React, { useEffect, useRef, useState } from 'react';
import geminiService from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'gemini';
  timestamp: Date;
}

interface GeminiChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeminiChat: React.FC<GeminiChatProps> = ({ isOpen, onClose }) => {
     const [messages, setMessages] = useState<Message[]>([
     {
       id: '1',
       text: "Hi there! 👋 I'm Ella, your friendly AI assistant! I'm here to help you with questions, homework, or just to chat. What would you like to talk about today?",
       sender: 'gemini',
       timestamp: new Date()
     }
   ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Try to get response from Gemini API
      const response = await geminiService.sendMessage(inputText);
      
      const geminiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'gemini',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, geminiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Use fallback response if API fails
      const fallbackResponse = geminiService.getFallbackResponse(inputText);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        sender: 'gemini',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

        return (
     <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
       {/* Backdrop */}
       <div 
         className="absolute inset-0 bg-black/20"
         onClick={onClose}
       />
       
       {/* Chat Panel */}
       <div className={`absolute right-4 top-20 bottom-4 w-80 bg-white rounded-2xl shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         {/* Header */}
         <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white p-4 rounded-t-2xl">
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-lg">
                 <span className="text-2xl">👧</span>
               </div>
               <div>
                 <h3 className="font-bold text-lg">Ella</h3>
                 <p className="text-xs opacity-90 font-medium">Your friendly friend</p>
               </div>
             </div>
             <button
               onClick={onClose}
               className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
             >
               <span className="text-xl font-bold">✕</span>
             </button>
           </div>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                     {messages.map((message) => (
             <div
               key={message.id}
               className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
             >
               <div className={`flex items-start space-x-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                   message.sender === 'user' 
                     ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                     : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                 }`}>
                   {message.sender === 'user' ? <span className="text-sm">👤</span> : <span className="text-sm">👧</span>}
                 </div>
                 <div className={`rounded-xl px-3 py-2 shadow-sm ${
                   message.sender === 'user'
                     ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                     : 'bg-white text-gray-800 border border-gray-100'
                 }`}>
                   <p className="text-xs leading-relaxed">{message.text}</p>
                   <p className={`text-xs mt-1 opacity-70 ${
                     message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                   }`}>
                     {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                 </div>
               </div>
             </div>
           ))}
          
                     {isLoading && (
             <div className="flex justify-start">
               <div className="flex items-start space-x-2 max-w-[85%]">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 text-white flex items-center justify-center shadow-md">
                   <span className="text-sm">👧</span>
                 </div>
                 <div className="bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100">
                   <div className="flex space-x-1">
                     <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                     <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                   </div>
                 </div>
               </div>
             </div>
           )}
          
          <div ref={messagesEndRef} />
        </div>

                          {/* Input */}
         <div className="border-t border-gray-200 p-3 bg-white rounded-b-2xl">
           <div className="flex space-x-2">
             <div className="flex-1 relative">
               <textarea
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyPress={handleKeyPress}
                 placeholder="Type your message..."
                 className="w-full px-3 py-2 border border-gray-200 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                 rows={1}
                 disabled={isLoading}
               />
             </div>
             <button
               onClick={handleSendMessage}
               disabled={!inputText.trim() || isLoading}
               className="w-8 h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:scale-105"
             >
               <span className="text-sm">📤</span>
             </button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default GeminiChat;
