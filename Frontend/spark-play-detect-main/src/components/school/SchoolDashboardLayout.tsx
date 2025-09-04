import React from 'react';
import { Outlet } from 'react-router-dom';
import SchoolNavbar from './SchoolNavbar';

const SchoolDashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <SchoolNavbar />
      
      {/* Main content */}
      <main className="pt-24 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default SchoolDashboardLayout;
