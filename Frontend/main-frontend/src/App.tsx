import { EmailVerificationGuard } from "@/components/layout/EmailVerificationGuard";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { stopAllCameraStreams } from "@/shared/utils/cameraUtils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
// Game components
import RepeatWithMeGameplay from "./features/games/repeat-with-me/components/RepeatWithMeGameplay";
// Pages
import Auth from "./features/auth/pages/Auth";
import AddChild from "./features/parent/pages/AddChild";
import ChildrenProfiles from "./features/parent/pages/ChildrenProfiles";
import Dashboard from "./features/parent/pages/Dashboard";
import NewTicketPage from "./features/parent/pages/NewTicketPage";
import ParentInfo from "./features/parent/pages/ParentInfo";
import TicketChatPage from "./features/parent/pages/TicketChatPage";
import TicketsPage from "./features/parent/pages/TicketsPage";
import ViewParentInfo from "./features/parent/pages/ViewParentInfo";
import EmailVerificationPage from "./pages/EmailVerification";
import EmailVerificationRequired from "./pages/EmailVerificationRequired";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
// Game pages
import DanceDoodleGameInsights from "./features/games/dance-doodle/pages/DanceDoodleGameInsights";
import DanceDoodleGamePage from "./features/games/dance-doodle/pages/DanceDoodleGamePage";
import GazeGameInsights from "./features/games/gaze-tracking/pages/GazeGameInsights";
import GazeTrackingGamePage from "./features/games/gaze-tracking/pages/GazeTrackingGamePage";
import GazeTrackingGamePlayPage from "./features/games/gaze-tracking/pages/GazeTrackingGamePlayPage";
import GestureGame from "./features/games/gesture-recognition/pages/GestureGame";
import GestureGameInsights from "./features/games/gesture-recognition/pages/GestureGameInsights";
import MirrorPostureGameInsights from "./features/games/mirror-posture/pages/MirrorPostureGameInsights";
import MirrorPostureGamePage from "./features/games/mirror-posture/pages/MirrorPostureGamePage";
import RepeatWithMeGameInsights from "./features/games/repeat-with-me/pages/RepeatWithMeGameInsights";
import RepeatWithMeGamePage from "./features/games/repeat-with-me/pages/RepeatWithMeGamePage";
// Authentication pages
import DoctorLogin from "./features/auth/pages/DoctorLogin";
import DoctorRegister from "./features/auth/pages/DoctorRegister";
import ParentLogin from "./features/auth/pages/ParentLogin";
import ParentRegister from "./features/auth/pages/ParentRegister";
import SchoolLogin from "./features/auth/pages/SchoolLogin";
import SchoolRegister from "./features/auth/pages/SchoolRegister";
// Doctor pages
import DoctorCheckoutPage from "./features/doctor/pages/DoctorCheckoutPage";
import DoctorEmailVerification from "./features/doctor/pages/DoctorEmailVerification";
import DoctorNewTicketPage from "./features/doctor/pages/DoctorNewTicketPage";
import DoctorPendingApproval from "./features/doctor/pages/DoctorPendingApproval";
import DoctorPricingPage from "./features/doctor/pages/DoctorPricingPage";
import DoctorSubscriptionPage from "./features/doctor/pages/DoctorSubscriptionPage";
import DoctorTicketChatPage from "./features/doctor/pages/DoctorTicketChatPage";
import DoctorTicketsPage from "./features/doctor/pages/DoctorTicketsPage";
import PaymentSuccessPage from "./features/doctor/pages/PaymentSuccessPage";
// School components and pages
import SchoolRedirectGuard from "./features/auth/components/SchoolRedirectGuard";
import SchoolAuthGuard from "./features/school/components/SchoolAuthGuard";
import SchoolDashboardLayout from "./features/school/components/SchoolDashboardLayout";
import { SchoolAuthProvider } from "./features/school/contexts/SchoolAuthContext";
import ChildProfile from "./features/school/pages/ChildProfile";
import ChildProgress from "./features/school/pages/ChildProgress";
import ChildProgressComparison from "./features/school/pages/ChildProgressComparison";
import Children from "./features/school/pages/Children";
import SchoolCheckoutPage from "./features/school/pages/SchoolCheckoutPage";
import SchoolDashboard from "./features/school/pages/SchoolDashboard";
import SchoolEmailVerification from "./features/school/pages/SchoolEmailVerification";
import SchoolNewTicketPage from "./features/school/pages/SchoolNewTicketPage";
import SchoolPaymentSuccessPage from "./features/school/pages/SchoolPaymentSuccessPage";
import SchoolPendingApproval from "./features/school/pages/SchoolPendingApproval";
import SchoolPricingPage from "./features/school/pages/SchoolPricingPage";
import SchoolSubscriptionPage from "./features/school/pages/SchoolSubscriptionPage";
import SchoolTicketChatPage from "./features/school/pages/SchoolTicketChatPage";
import SchoolTicketsPage from "./features/school/pages/SchoolTicketsPage";
import TaskDetails from "./features/school/pages/TaskDetails";
import Tasks from "./features/school/pages/Tasks";
import TournamentDetails from "./features/school/pages/TournamentDetails";
import Tournaments from "./features/school/pages/tournaments";
// Doctor components and pages
import DoctorAuthGuard from "./features/doctor/components/DoctorAuthGuard";
import DoctorDashboardLayout from "./features/doctor/components/DoctorDashboardLayout";
import { DoctorAuthProvider } from "./features/doctor/contexts/DoctorAuthContext";
import DoctorChat from "./features/doctor/pages/DoctorChat";
import DoctorDashboard from "./features/doctor/pages/DoctorDashboard";
import EnrolledChildren from "./features/doctor/pages/EnrolledChildren";
import TaskHistory from "./features/doctor/pages/TaskHistory";
import TaskManagement from "./features/doctor/pages/TaskManagement";
// Child frontend imports
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
      <DoctorAuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CameraCleanupHandler />
          <Routes>
          <Route path="/" element={
            <>
              <SchoolRedirectGuard />
              <LandingPage />
            </>
          } />
          <Route path="/auth" element={
            <>
              <SchoolRedirectGuard />
              <Auth />
            </>
          } />
          {/* Authentication Routes */}
          <Route path="/auth/parent/login" element={<ParentLogin />} />
          <Route path="/auth/parent/register" element={<ParentRegister />} />
          <Route path="/auth/school/login" element={<SchoolLogin />} />
          <Route path="/auth/school/register" element={<SchoolRegister />} />
          <Route path="/auth/doctor/login" element={<DoctorLogin />} />
          <Route path="/auth/doctor/register" element={<DoctorRegister />} />
          {/* Doctor specific routes */}
          <Route path="/doctor/verify-email" element={<DoctorEmailVerification />} />
          <Route path="/doctor/pending-approval" element={<DoctorPendingApproval />} />
          <Route path="/doctor/tickets" element={<DoctorTicketsPage />} />
          <Route path="/doctor/tickets/new" element={<DoctorNewTicketPage />} />
          <Route path="/doctor/tickets/:ticketId" element={<DoctorTicketChatPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/email-verification-required" element={<EmailVerificationRequired />} />
          {/* School specific routes - must be before nested /school route */}
          <Route path="/school/login" element={<SchoolLogin />} />
          <Route path="/school/register" element={<SchoolRegister />} />
          <Route path="/school/verify-email" element={<SchoolEmailVerification />} />
          <Route path="/school/pending-approval" element={<SchoolPendingApproval />} />
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
          <Route path="/tickets" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <TicketsPage />
              </EmailVerificationGuard>
            </ProtectedRoute>
          } />
          <Route path="/tickets/new" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <NewTicketPage />
              </EmailVerificationGuard>
            </ProtectedRoute>
          } />
          <Route path="/tickets/:ticketId" element={
            <ProtectedRoute>
              <EmailVerificationGuard>
                <TicketChatPage />
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
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SchoolDashboard />} />
            <Route path="children" element={<Children />} />
            <Route path="children/:childId" element={<ChildProfile />} />
            <Route path="children/:childId/progress" element={<ChildProgress />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/:taskId" element={<TaskDetails />} />
            <Route path="tournaments" element={<Tournaments />} />
            <Route path="tournaments/:id" element={<TournamentDetails />} />
            <Route path="progress-comparison" element={<ChildProgressComparison />} />
            <Route path="tickets" element={<SchoolTicketsPage />} />
            <Route path="tickets/new" element={<SchoolNewTicketPage />} />
            <Route path="tickets/:ticketId" element={<SchoolTicketChatPage />} />
            <Route path="pricing" element={<SchoolPricingPage />} />
            <Route path="subscription" element={<SchoolSubscriptionPage />} />
            <Route path="checkout" element={<SchoolCheckoutPage />} />
            <Route path="payment-success" element={<SchoolPaymentSuccessPage />} />
            {/* Additional school routes will be added here */}
          </Route>
          
          {/* Doctor Dashboard Routes */}
          <Route path="/doctor" element={
            <DoctorAuthGuard>
              <DoctorDashboardLayout />
            </DoctorAuthGuard>
          }>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="children" element={<EnrolledChildren />} />
            <Route path="children/:childId/progress" element={<ChildProgress />} />
            <Route path="tasks" element={<TaskManagement />} />
            <Route path="tasks/history" element={<TaskHistory />} />
            <Route path="chat" element={<DoctorChat />} />
            <Route path="pricing" element={<DoctorPricingPage />} />
            <Route path="subscription/checkout" element={<DoctorCheckoutPage />} />
            <Route path="payment-success" element={<PaymentSuccessPage />} />
            <Route path="subscription" element={<DoctorSubscriptionPage />} />
            {/* Additional doctor routes will be added here */}
          </Route>
          
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </DoctorAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
