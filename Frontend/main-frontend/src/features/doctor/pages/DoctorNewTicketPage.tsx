import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import { ArrowLeft, Send } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorNewTicketPage = () => {
  const { doctor } = useDoctorAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple alert for now
    alert('Ticket created successfully! (This is a demo - no actual ticket was created)');
    navigate('/doctor/tickets');
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/doctor/tickets')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
          <p className="text-gray-600">Describe your issue and we'll help you resolve it</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about your issue..."
                rows={6}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Create Ticket
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/doctor/tickets')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorNewTicketPage;
