import { EmailVerificationGuard } from "@/components/auth/EmailVerificationGuard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { stopAllCameraStreams } from "@/utils/cameraUtils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import RepeatWithMeGameplay from "./components/games/repeatWithMe/RepeatWithMeGameplay";
import AddChild from "./pages/AddChild";
import Auth from "./pages/Auth";
import ChildrenProfiles from "./pages/ChildrenProfiles";
import DanceDoodleGameInsights from "./pages/DanceDoodleGameInsights";
import DanceDoodleGamePage from "./pages/DanceDoodleGamePage";
import Dashboard from "./pages/Dashboard";
import EmailVerificationPage from "./pages/EmailVerification";
import EmailVerificationRequired from "./pages/EmailVerificationRequired";
import GazeGameInsights from "./pages/GazeGameInsights";
import GazeTrackingGamePage from "./pages/GazeTrackingGamePage";
import GazeTrackingGamePlayPage from "./pages/GazeTrackingGamePlayPage";
import GestureGame from "./pages/GestureGame";
import GestureGameInsights from "./pages/GestureGameInsights";
import LandingPage from "./pages/LandingPage";
import MirrorPostureGameInsights from "./pages/MirrorPostureGameInsights";
import MirrorPostureGamePage from "./pages/MirrorPostureGamePage";
import NotFound from "./pages/NotFound";
import ParentInfo from "./pages/ParentInfo";
import RepeatWithMeGameInsights from "./pages/RepeatWithMeGameInsights";
import RepeatWithMeGamePage from "./pages/RepeatWithMeGamePage";
import ViewParentInfo from "./pages/ViewParentInfo";
// Authentication pages
import DoctorLogin from "./pages/auth/DoctorLogin";
import DoctorRegister from "./pages/auth/DoctorRegister";
import ParentLogin from "./pages/auth/ParentLogin";
import ParentRegister from "./pages/auth/ParentRegister";
import SchoolLogin from "./pages/auth/SchoolLogin";
import SchoolRegister from "./pages/auth/SchoolRegister";
// School Dashboard imports
import SchoolDashboardLayout from "./components/school/SchoolDashboardLayout";
import SchoolDashboard from "./pages/school/SchoolDashboard";
import Children from "./pages/school/Children";
import ChildProfile from "./pages/school/ChildProfile";
import Tasks from "./pages/school/Tasks";
import TaskDetails from "./pages/school/TaskDetails";
import Tournaments from "./pages/school/Tournaments";
import { SchoolAuthProvider } from "./contexts/school/SchoolAuthContext";
import SchoolAuthGuard from "./components/school/SchoolAuthGuard";
const queryClient = new QueryClient();

// Component to handle global camera cleanup
const CameraCleanupHandler = () => {
  const location = useLocation();

  useEffect(() => {
    // Cleanup camera when navigating away from game routes
    const isGameRoute = location.pathname.startsWith('/games/');
    
    // If we're NOT on a game route, stop all cameras
    if (!isGameRoute) {
      stopAllCameraStreams();
    }
  }, [location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CameraCleanupHandler />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          {/* Authentication Routes */}
          <Route path="/auth/parent/login" element={<ParentLogin />} />
          <Route path="/auth/parent/register" element={<ParentRegister />} />
          <Route path="/auth/school/login" element={<SchoolLogin />} />
          <Route path="/auth/school/register" element={<SchoolRegister />} />
          <Route path="/auth/doctor/login" element={<DoctorLogin />} />
          <Route path="/auth/doctor/register" element={<DoctorRegister />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/email-verification-required" element={<EmailVerificationRequired />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <Dashboard />
              </EmailVerificationGuard>
            </ProtectedRoute>
          } />
          <Route path="/parent-info" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <ParentInfo />
              </EmailVerificationGuard>
            </ProtectedRoute>
          } />
          <Route path="/view-parent-info" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <ViewParentInfo />
              </EmailVerificationGuard>
            </ProtectedRoute>
          } />
          <Route path="/children" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <ChildrenProfiles />
              </EmailVerificationGuard>
            </ProtectedRoute>
          } />
          <Route path="/add-child" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <AddChild />
              </EmailVerificationGuard>
            </ProtectedRoute>
          } />
          <Route path="/games/gesture" element={<GestureGame />} />
          <Route path="/games/gesture/insights" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <GestureGameInsights />
              </EmailVerificationGuard>
            </ProtectedRoute>
          } />
          <Route path="/games/posture/insights" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <MirrorPostureGameInsights />
              </EmailVerificationGuard>
            </ProtectedRoute>
          } />
          <Route path="/games/mirror-posture" element={<MirrorPostureGamePage />} />
          <Route path="/games/gaze-tracking" element={<GazeTrackingGamePage />} />
          <Route path="/games/gaze-tracking/insights" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <GazeGameInsights />
              </EmailVerificationGuard>
            </ProtectedRoute>
          } />
          <Route path="/games/gaze-tracking/play" element={<GazeTrackingGamePlayPage />} />
          <Route path="/games/repeat-with-me" element={<RepeatWithMeGamePage />} />
          <Route path="/games/repeat-with-me/gameplay" element={<RepeatWithMeGameplay />} />
          <Route path="/games/repeat-with-me/insights" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <RepeatWithMeGameInsights />
              </EmailVerificationGuard>
            </ProtectedRoute>
          } />
          <Route path="/games/dance-doodle" element={<DanceDoodleGamePage />} />
          <Route path="/games/dance-doodle/insights" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <DanceDoodleGameInsights />
              </EmailVerificationGuard>
            </ProtectedRoute>
          } />
          {/* School Dashboard Routes */}
          <Route path="/school" element={
            <SchoolAuthProvider>
              <SchoolAuthGuard>
                <SchoolDashboardLayout />
              </SchoolAuthGuard>
            </SchoolAuthProvider>
          }>
            <Route path="dashboard" element={<SchoolDashboard />} />
            <Route path="children" element={<Children />} />
                              <Route path="children/:childId" element={<ChildProfile />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="tasks/:taskId" element={<TaskDetails />} />
                  <Route path="tournaments" element={<Tournaments />} />
                  {/* Additional school routes will be added here */}
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
