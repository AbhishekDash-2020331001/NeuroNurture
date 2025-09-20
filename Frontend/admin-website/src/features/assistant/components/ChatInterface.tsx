import { Bot, Check, Copy, Loader2, ThumbsDown, ThumbsUp, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import './assistant-animations.css';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClearChat?: () => void;
  isLoading: boolean;
  chatTitle?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onClearChat: _onClearChat,
  isLoading,
  chatTitle: _chatTitle
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 128; // 8rem = 128px (max 4 lines)
      const newHeight = Math.min(scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyMessage = async (content: string, messageId: string) => {
    if (!content.trim()) return;
    
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedMessageId(null), 2000);
      console.log('Message copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopiedMessageId(messageId);
          setTimeout(() => setCopiedMessageId(null), 2000);
          console.log('Message copied to clipboard (fallback)');
        } else {
          console.error('Fallback copy command failed');
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white assistant-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Welcome to Nuru</h3>
            <p className="text-base text-center max-w-lg text-gray-600 leading-relaxed">
              I'm your AI assistant specialized in child development and autism support. 
              I'm here to help you with questions, concerns, and guidance for your child's journey.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">Child Development</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Autism Support</span>
              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">Parent Guidance</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`group flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} px-2 py-2`}
              >
                <div className={`flex max-w-[65%] min-w-0 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                      : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} flex-1 min-w-0 max-w-full`}>
                    <div className={`px-5 py-4 rounded-2xl leading-relaxed w-full overflow-hidden shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center gap-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-sm text-gray-600 font-medium">Nuru is typing...</span>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap message-text">
                          {message.content}
                          {message.sender === 'assistant' && isLoading && (
                            <span className="inline-block w-0.5 h-4 bg-gray-500 ml-1 animate-pulse"></span>
                          )}
                        </p>
                      )}
                    </div>
                    
                    {/* Message Actions for Assistant */}
                    {message.sender === 'assistant' && !message.isTyping && (
                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleCopyMessage(message.content, message.id)}
                          className={`p-1 rounded transition-colors ${
                            copiedMessageId === message.id 
                              ? 'bg-green-100 text-green-600' 
                              : 'hover:bg-gray-200'
                          }`}
                          title={copiedMessageId === message.id ? "Copied!" : "Copy"}
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-500" />
                          )}
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded transition-colors" title="Good response">
                          <ThumbsUp className="w-3 h-3 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded transition-colors" title="Bad response">
                          <ThumbsDown className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-200/60 bg-white/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to Nuru..."
              disabled={isLoading}
              className="w-full resize-none border-2 border-gray-200 rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 overflow-hidden bg-gray-50 focus:bg-white"
              rows={1}
              style={{ 
                minHeight: '52px',
                maxHeight: '128px'
              }}
            />
          </div>

          {inputMessage.trim() && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-md flex items-center justify-center transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
