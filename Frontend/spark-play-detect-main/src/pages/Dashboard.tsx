import DashboardNavbar from '@/components/DashboardNavbar';
import { getCurrentChild } from '@/utils/childUtils';
import { performLogout } from '@/utils/logoutUtils';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingGeminiButton from '../components/FloatingGeminiButton';
import GeminiChat from '../components/GeminiChat';
import ChildDoctorPage from './child/ChildDoctorPage';
import ChildPlaygroundPage from './child/ChildPlaygroundPage';
import ChildSchoolPage from './child/ChildSchoolPage';

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'playground' | 'school' | 'doctor'>('playground');

  useEffect(() => {
    fetch('http://localhost:8080/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(authenticated => {
        if (!authenticated) {
          navigate('/');
        } else {
          fetch('http://localhost:8080/auth/me', { credentials: 'include' })
            .then(res => res.text())
            .then(name => setUsername(name));
          
          // Get selected child data
          const childData = getCurrentChild();
          if (childData) {
            setSelectedChild(childData);
          }
          
          setAuthChecked(true);
        }
      });
  }, [navigate]);

  const handleLogout = async () => {
    console.log('Logout button clicked');
    await performLogout();
  };

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-soft font-nunito custom-scrollbar relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-50 via-orange-50 to-red-50 opacity-20"></div>
        
        {/* Floating Bubbles */}
        <div className="absolute top-1/4 left-1/6 w-4 h-4 bg-blue-300 rounded-full animate-float opacity-60" style={{ animationDelay: '0s', animationDuration: '6s' }}></div>
        <div className="absolute top-1/3 right-1/5 w-6 h-6 bg-purple-300 rounded-full animate-float opacity-50" style={{ animationDelay: '2s', animationDuration: '7s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-pink-300 rounded-full animate-float opacity-70" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-5 h-5 bg-yellow-300 rounded-full animate-float opacity-60" style={{ animationDelay: '3s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/4 left-1/5 w-4 h-4 bg-green-300 rounded-full animate-float opacity-50" style={{ animationDelay: '1.5s', animationDuration: '6.5s' }}></div>
        
        {/* Rainbow Trail Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 via-purple-400 to-pink-400 opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 via-green-400 via-yellow-400 to-red-400 opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Enhanced Dashboard Navbar with Tab Navigation */}
      <DashboardNavbar 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <div className="max-w-7xl mx-auto space-y-6 px-1 py-4 pt-20 relative z-10">
        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'playground' && <ChildPlaygroundPage username={username} />}
          {activeTab === 'school' && <ChildSchoolPage />}
          {activeTab === 'doctor' && <ChildDoctorPage />}
        </div>
      </div>
      
      {/* Gemini Chat Components */}
      <FloatingGeminiButton 
        onClick={() => setIsGeminiOpen(true)}
        isOpen={isGeminiOpen}
      />
      <GeminiChat 
        isOpen={isGeminiOpen}
        onClose={() => setIsGeminiOpen(false)}
      />
    </div>
  );
}