import React from 'react';
import { Outlet } from 'react-router-dom';
import DoctorNavbar from './DoctorNavbar';

const DoctorDashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="pt-20 px-4 sm:px-6 lg:px-12">
        <Outlet />
      </main>
    </div>
  );
};

export default DoctorDashboardLayout;
