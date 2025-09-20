import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import { patientService, type Patient } from '@/shared/services/doctor/patientService';
import { makeAuthenticatedDoctorRequest } from '@/shared/utils/apiUtils';
import {
    CheckCircle,
    Clock,
    MessageSquare,
    Mic,
    MicOff,
    MoreVertical,
    Paperclip,
    Phone,
    Search,
    Send,
    Users,
    Video,
    XCircle
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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

const DoctorChat: React.FC = () => {
  const { doctor } = useDoctorAuth();
  const [searchParams] = useSearchParams();
  const patientIdFromUrl = searchParams.get('patient');
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [patientLastMessages, setPatientLastMessages] = useState<Map<number, ChatMessage>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load patients on component mount
  useEffect(() => {
    loadPatients();
  }, [doctor]);

  // Set initial patient from URL
  useEffect(() => {
    if (patientIdFromUrl && patients.length > 0) {
      const patient = patients.find(p => p.id.toString() === patientIdFromUrl);
      if (patient) {
        setSelectedPatient(patient);
      }
    }
  }, [patientIdFromUrl, patients]);

  // Load messages when patient is selected
  useEffect(() => {
    if (selectedPatient && doctor) {
      loadChatHistory();
      markMessagesAsRead();
    }
  }, [selectedPatient, doctor]);

  const loadPatients = async () => {
    if (!doctor) return;
    
    try {
      setIsLoadingPatients(true);
      setError(null);
      const patientsData = await patientService.getPatientsByDoctor(parseInt(doctor.id));
      setPatients(patientsData);
      
      // Load last messages for all patients
      await loadLastMessagesForAllPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Failed to load patients');
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const loadLastMessagesForAllPatients = async (patientsList: Patient[]) => {
    if (!doctor) return;
    
    const lastMessagesMap = new Map<number, ChatMessage>();
    
    // Load last message for each patient
    for (const patient of patientsList) {
      try {
        const response = await makeAuthenticatedDoctorRequest(
          `http://localhost:8093/api/doctor/chat/history/${patient.id}/${doctor.id}`
        );
        
        if (response.ok) {
          const messages = await response.json();
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            lastMessagesMap.set(patient.id, lastMessage);
          }
        }
      } catch (error) {
        console.error(`Error loading last message for patient ${patient.id}:`, error);
      }
    }
    
    setPatientLastMessages(lastMessagesMap);
  };

  const loadChatHistory = async () => {
    if (!selectedPatient || !doctor) return;
    
    try {
      setIsLoadingMessages(true);
      const response = await makeAuthenticatedDoctorRequest(
        `http://localhost:8093/api/doctor/chat/history/${selectedPatient.id}/${doctor.id}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const messages = await response.json();
      setCurrentMessages(messages);
      
      // Store the last message for this patient
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        setPatientLastMessages(prev => new Map(prev.set(selectedPatient.id, lastMessage)));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Failed to load chat history');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedPatient || !doctor) return;
    
    try {
      await makeAuthenticatedDoctorRequest(
        `http://localhost:8093/api/doctor/chat/mark-read/${selectedPatient.id}/${doctor.id}`,
        { method: 'PUT' }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPatient || !doctor) return;

    try {
      const response = await makeAuthenticatedDoctorRequest(
        'http://localhost:8093/api/doctor/chat/send',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            childId: selectedPatient.id,
            doctorId: doctor.id,
            message: newMessage.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const sentMessage = await response.json();
      setCurrentMessages(prev => [...prev, sentMessage]);
      
      // Update the last message for this patient
      setPatientLastMessages(prev => new Map(prev.set(selectedPatient.id, sentMessage)));
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
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
    <div className="flex bg-gray-50" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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
          {isLoadingPatients ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading patients...</p>
              </div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No patients found</p>
              </div>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const lastMessage = patientLastMessages.get(patient.id);
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
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-gray-400"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {patient.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        Age {patient.age} • {patient.problem || 'No condition specified'}
                      </p>
                      {lastMessage && (
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400 truncate">
                            {lastMessage.message}
                          </p>
                          <span className="text-xs text-gray-400">
                            {formatTime(lastMessage.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
          {selectedPatient ? (
            <>
              {/* Fixed Patient Information Header */}
              <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-600">
                          {selectedPatient.name.charAt(0)}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-gray-400"></div>
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">{selectedPatient.name}</h2>
                      <p className="text-sm text-gray-500">
                        Age {selectedPatient.age} • {selectedPatient.problem || 'No condition specified'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                          Patient
                        </span>
                        <span className="text-xs text-gray-400">
                          Parent: {selectedPatient.parentName}
                        </span>
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

              {/* Scrollable Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading messages...</p>
                  </div>
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                </div>
              ) : (
                currentMessages.map((message, index) => {
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
                      <div className={`flex ${message.senderType === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderType === 'doctor' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderType === 'doctor' ? 'text-purple-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                            {message.senderType === 'doctor' && (
                              <span className="ml-1">
                                {message.isRead ? <CheckCircle className="inline h-3 w-3" /> : <Clock className="inline h-3 w-3" />}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              
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

              {/* Fixed Message Input */}
              <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
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