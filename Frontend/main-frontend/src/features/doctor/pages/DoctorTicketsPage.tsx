import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import { MessageSquare, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorTicketsPage = () => {
  const { doctor } = useDoctorAuth();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600">Manage your support requests and get help from our team</p>
        </div>
        <Button onClick={() => navigate('/doctor/tickets/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              No Tickets Yet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You haven't created any support tickets yet. Click "New Ticket" to get started.
            </p>
            <Button onClick={() => navigate('/doctor/tickets/new')} variant="outline">
              Create Your First Ticket
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorTicketsPage;
