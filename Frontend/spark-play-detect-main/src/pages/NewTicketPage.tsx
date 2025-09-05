import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ticketService } from '@/services/ticketService';
import { AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NewTicketPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM'
  });
  const [parentId, setParentId] = useState<number | null>(null);

  useState(() => {
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
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

    setLoading(true);

    try {
      const ticket = await ticketService.createTicket({
        parentId,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority
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

  const priorityOptions = [
    { value: 'LOW', label: 'Low - General inquiry or minor issue' },
    { value: 'MEDIUM', label: 'Medium - Standard support request' },
    { value: 'HIGH', label: 'High - Important issue affecting functionality' },
    { value: 'URGENT', label: 'Urgent - Critical issue requiring immediate attention' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/tickets')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tickets</span>
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-blue-600" />
                <span>Create New Support Ticket</span>
              </CardTitle>
              <p className="text-gray-600">
                Describe your issue and our support team will help you resolve it.
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    {formData.subject.length}/100 characters
                  </p>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                    Priority Level *
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.value}</span>
                            <span className="text-xs text-gray-500">{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your issue. Include steps to reproduce, expected behavior, and any error messages you're seeing."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full min-h-[200px]"
                    maxLength={2000}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/2000 characters
                  </p>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Tips for better support:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be specific about what you were trying to do</li>
                    <li>• Include any error messages you received</li>
                    <li>• Mention which device or browser you're using</li>
                    <li>• Attach screenshots if helpful (you can describe them in the message)</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/tickets')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !formData.subject.trim() || !formData.description.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>Create Ticket</span>
                      </div>
                    )}
                  </Button>
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
