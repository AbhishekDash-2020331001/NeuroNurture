import Navbar from '@/components/common/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { aiService, TicketClassification } from '@/shared/services/ai/aiService';
import { ticketService } from '@/shared/services/ticket/ticketService';
import { AlertCircle, ArrowLeft, Bot, CheckCircle, Loader2, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NewTicketPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiClassification, setAiClassification] = useState<TicketClassification | null>(null);
  const [showFinalPreview, setShowFinalPreview] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: ''
  });
  const [aiPriority, setAiPriority] = useState<string>('MEDIUM');
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    const fetchParentId = async () => {
      try {
        const emailResponse = await fetch('http://localhost:8080/auth/me', { 
          credentials: 'include' 
        });
        const email = await emailResponse.text();
        
        const parentResponse = await fetch(`http://localhost:8082/api/parents/by-email/${email}`, {
          credentials: 'include'
        });
        
        if (parentResponse.ok) {
          const parent = await parentResponse.json();
          setParentId(parent.id);
        }
      } catch (error) {
        console.error('Error fetching parent ID:', error);
      }
    };

    fetchParentId();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset AI classification when user changes input
    if (field === 'description' || field === 'subject') {
      setAiClassification(null);
      setShowFinalPreview(false);
    }
  };

  const handleProcessTicket = async () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      alert('Please fill in both subject and description before processing.');
      return;
    }

    setAiProcessing(true);
    try {
      const fullMessage = `Subject: ${formData.subject}\n\nDescription: ${formData.description}`;
      const classification = await aiService.classifyTicket(fullMessage, 'parent', parentId || undefined);
      
      // Extract only the description part from the AI response and clean up any JSON artifacts
      let aiRefinedDescription = classification.rewritten_message.replace(/^Subject:.*?\n\n/, '');
      // Remove any "rewritten_message" text that might be included
      aiRefinedDescription = aiRefinedDescription.replace(/^"rewritten_message":\s*"/, '').replace(/"$/, '');
      
      setAiClassification({
        ...classification,
        rewritten_message: aiRefinedDescription
      });
      setAiPriority(classification.priority);
      setShowFinalPreview(true);
    } catch (error) {
      console.error('Error processing with AI:', error);
      alert('Failed to process with AI. Please try again.');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleAcceptRefinedMessage = () => {
    if (aiClassification) {
      setFormData(prev => ({
        ...prev,
        description: aiClassification.rewritten_message
      }));
    }
  };

  const handleKeepOriginalMessage = () => {
    // Keep original message - no changes needed
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parentId) {
      alert('Unable to identify parent. Please try again.');
      return;
    }

    if (!formData.subject.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    // Ensure AI has processed the ticket
    if (!aiClassification) {
      alert('Please process your ticket with AI before submitting.');
      return;
    }

    setLoading(true);

    try {
      const ticket = await ticketService.createTicket({
        parentId,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: aiPriority
      });

      if (ticket) {
        navigate(`/tickets/${ticket.id}`);
      } else {
        alert('Failed to create ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('An error occurred while creating the ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200';
      case 'MEDIUM':
        return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200';
      case 'HIGH':
        return 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200';
      case 'URGENT':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200';
      default:
        return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/tickets')}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Tickets</span>
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Support Ticket</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Describe your issue and our AI-powered system will help prioritize and refine your request for faster resolution.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-100/50">
            <CardHeader className="pb-6 pt-8 px-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">Ticket Information</h2>
                <p className="text-slate-600">Fill in the details below and our AI will help optimize your request</p>
              </div>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Subject */}
                <div className="space-y-3">
                  <Label htmlFor="subject" className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                    <span>Subject</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Brief description of your issue"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full h-12 px-4 text-slate-700 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder:text-slate-400"
                      maxLength={100}
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        {formData.subject.length}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Priority Display */}
                {aiClassification && (
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">AI-Determined Priority</h3>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getPriorityColor(aiPriority)} border-0 text-sm font-medium px-4 py-2 rounded-full`}>
                        {aiPriority}
                      </Badge>
                      <span className="text-sm text-slate-600">
                        Automatically determined based on your message content
                      </span>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                    <span>Description</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="description"
                      placeholder="Please provide detailed information about your issue. Include steps to reproduce, expected behavior, and any error messages you're seeing."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full min-h-[200px] px-4 py-4 text-slate-700 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder:text-slate-400 resize-none"
                      maxLength={2000}
                      required
                    />
                    <div className="absolute bottom-3 right-3">
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        {formData.description.length}/2000
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final Preview Box */}
                {showFinalPreview && aiClassification && (
                  <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 border-2 border-emerald-200 rounded-3xl p-8 shadow-xl shadow-emerald-100/50">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-slate-800">Ticket Preview</h4>
                        <p className="text-slate-600">Review your ticket before submitting</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Subject */}
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                        <Label className="text-sm font-semibold text-slate-700 mb-3 block">Subject</Label>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                          <p className="text-slate-800 font-medium">{formData.subject}</p>
                        </div>
                      </div>

                      {/* Priority */}
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                        <Label className="text-sm font-semibold text-slate-700 mb-3 block">Priority (AI-Determined)</Label>
                        <div className="flex items-center space-x-4">
                          <Badge className={`${getPriorityColor(aiPriority)} border-0 text-sm font-semibold px-6 py-3 rounded-full`}>
                            {aiPriority}
                          </Badge>
                          <p className="text-sm text-slate-600 flex-1">
                            {aiClassification.reasoning}
                          </p>
                        </div>
                      </div>

                      {/* Message Choice */}
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                        <Label className="text-sm font-semibold text-slate-700 mb-4 block">Description</Label>
                        <div className="space-y-4">
                          {/* Original Message */}
                          <div>
                            <Label className="text-xs font-semibold text-slate-600 mb-2 block">Original Message</Label>
                            <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
                              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{formData.description}</p>
                            </div>
                          </div>

                          {/* Refined Message */}
                          <div>
                            <Label className="text-xs font-semibold text-slate-600 mb-2 block">AI-Refined Message</Label>
                            <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl">
                              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{aiClassification.rewritten_message}</p>
                            </div>
                          </div>

                          {/* Message Choice Buttons */}
                          <div className="flex space-x-3 pt-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleAcceptRefinedMessage}
                              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200/50 transition-all duration-200"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Use Refined Message
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleKeepOriginalMessage}
                              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                            >
                              Keep Original Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800">Tips for Better Support</h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-sm text-slate-700">Be specific about what you were trying to do</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-sm text-slate-700">Include any error messages you received</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-sm text-slate-700">Mention which device or browser you're using</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                        <p className="text-sm text-slate-700">Click "Process Ticket" for AI assistance</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                        <p className="text-sm text-slate-700">Priority is automatically determined by AI</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/tickets')}
                    disabled={loading}
                    className="px-8 py-3 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  
                  {!showFinalPreview ? (
                    <Button
                      type="button"
                      onClick={handleProcessTicket}
                      disabled={loading || !formData.subject.trim() || !formData.description.trim() || aiProcessing}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-purple-200/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiProcessing ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing with AI...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Bot className="h-5 w-5" />
                          <span>Process Ticket</span>
                        </div>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Creating Ticket...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="h-5 w-5" />
                          <span>Submit Ticket</span>
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewTicketPage;
