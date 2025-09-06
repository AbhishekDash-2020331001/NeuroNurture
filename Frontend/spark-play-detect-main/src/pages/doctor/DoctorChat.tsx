import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDoctorAuth } from '@/contexts/doctor/DoctorAuthContext';
import { mockPatients, mockChatSessions, mockMessages, type Patient, type ChatMessage, type ChatSession } from '@/data/doctorMockData';
import { 
  Search,
  Send,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Stethoscope,
  Heart,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Mic,
  MicOff
} from 'lucide-react';

const DoctorChat: React.FC = () => {
  const { doctor } = useDoctorAuth();
  const [searchParams] = useSearchParams();
  const patientIdFromUrl = searchParams.get('patient');
  
  // Initialize with patient from URL if provided
  const initialPatient = patientIdFromUrl 
    ? mockPatients.find(p => p.id === patientIdFromUrl) || null
    : null;
    
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter patients based on search term
  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.autismLikelihoodIndex.toString().includes(searchTerm) ||
    patient.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current messages for selected patient
  const currentMessages = selectedPatient ? mockMessages[selectedPatient.id] || [] : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedPatient) {
      // In a real app, this would send the message to the backend
      console.log('Sending message:', newMessage, 'to patient:', selectedPatient.id);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      case 'busy': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Patient List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Patient Chat</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, ALI score, or parent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Patient List */}
        <div className="flex-1 overflow-y-auto">
          {filteredPatients.map((patient) => {
            const chatSession = mockChatSessions.find(session => session.patientId === patient.id);
            return (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedPatient?.id === patient.id ? 'bg-purple-50 border-purple-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">
                        {patient.name.charAt(0)}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      patient.status === 'online' ? 'bg-green-500' : 
                      patient.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {patient.name}
                      </h3>
                      {chatSession && chatSession.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                          {chatSession.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      ALI Score: {patient.autismLikelihoodIndex}%
                    </p>
                    {chatSession && (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400 truncate">
                          {chatSession.lastMessage}
                        </p>
                        <span className="text-xs text-gray-400">
                          {chatSession.lastMessageTime ? formatTime(chatSession.lastMessageTime) : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedPatient ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">
                        {selectedPatient.name.charAt(0)}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      selectedPatient.status === 'online' ? 'bg-green-500' : 
                      selectedPatient.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{selectedPatient.name}</h2>
                    <p className="text-sm text-gray-500">
                      ALI Score: {selectedPatient.autismLikelihoodIndex}% • Age {selectedPatient.age}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPatient.status)}`}>
                        {getStatusText(selectedPatient.status)}
                      </span>
                      {selectedPatient.lastSeen && (
                        <span className="text-xs text-gray-400">
                          Last seen {selectedPatient.lastSeen}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((message, index) => {
                const showDate = index === 0 || 
                  formatDate(message.timestamp) !== formatDate(currentMessages[index - 1].timestamp);
                
                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="flex justify-center mb-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'doctor' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'doctor' ? 'text-purple-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                          {message.sender === 'doctor' && (
                            <span className="ml-1">
                              {message.isRead ? <CheckCircle className="inline h-3 w-3" /> : <Clock className="inline h-3 w-3" />}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                />
                
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    rows={1}
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording 
                      ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Patient Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
              <p className="text-gray-500">
                Choose a patient from the sidebar to start a conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorChat;