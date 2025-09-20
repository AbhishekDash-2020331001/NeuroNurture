import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DoctorAssistant from '../pages/DoctorAssistant';
import DoctorNavbar from './DoctorNavbar';

const DoctorDashboardLayout: React.FC = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="pt-20 px-4 sm:px-6 lg:px-12">
        <Outlet />
      </main>
      
      {/* AI Assistant */}
      <DoctorAssistant 
        isOpen={isAssistantOpen}
        onToggle={() => setIsAssistantOpen(!isAssistantOpen)}
      />
    </div>
  );
};

export default DoctorDashboardLayout;
