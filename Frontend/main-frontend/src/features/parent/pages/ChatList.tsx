import React, { useState } from 'react';
import { MessageSquare, Clock, MoreVertical, Trash2, Edit3, Bot, User, Check, X } from 'lucide-react';
import './assistant-animations.css';

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isActive: boolean;
}

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onRenameChat
}) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  const handleStartEdit = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingTitle.trim() && editingChatId) {
      onRenameChat(editingChatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-50 to-white border-r border-gray-200/60 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nuru</h2>
            <p className="text-sm text-gray-600">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Add New Chat Button - Always Visible */}
      <div className="p-4 border-b border-gray-200/60">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center p-4 text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-200 group border-2 border-dashed border-gray-300 hover:border-indigo-300"
        >
          <span className="text-sm font-semibold">Start New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto assistant-scrollbar relative">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium mb-2">No conversations yet</p>
            <p className="text-xs text-gray-400">Start a new conversation above</p>
          </div>
        ) : (
          <div className="py-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative px-4 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${
                  chat.id === activeChatId ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-r-4 border-indigo-500' : ''
                }`}
                onClick={() => !editingChatId && onChatSelect(chat.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {editingChatId === chat.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyPress={handleKeyPress}
                          onBlur={handleSaveEdit}
                          className="text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-1"
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit();
                          }}
                          className="p-1 hover:bg-green-100 rounded transition-colors"
                          title="Save"
                        >
                          <Check className="w-3 h-3 text-green-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    ) : (
                                  <h3 className={`text-sm truncate font-medium ${
                                    chat.id === activeChatId ? 'text-indigo-900' : 'text-gray-800'
                                  }`}>
                                    {chat.title}
                                  </h3>
                    )}
                  </div>

                  {/* Actions Menu - Show on Hover (only when not editing) */}
                  {editingChatId !== chat.id && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(chat.id, chat.title);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Rename"
                      >
                        <Edit3 className="w-3 h-3 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this chat?')) {
                            onDeleteChat(chat.id);
                          }
                        }}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <p>Nuru can make mistakes. Check important info.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
