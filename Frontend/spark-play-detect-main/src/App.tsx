import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { stopAllCameraStreams } from "@/utils/cameraUtils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import AddChild from "./pages/AddChild";
import Auth from "./pages/Auth";
import ChildrenProfiles from "./pages/ChildrenProfiles";
import Dashboard from "./pages/Dashboard";
import GestureGame from "./pages/GestureGame";
import Index from "./pages/Index";
import MirrorPostureGamePage from "./pages/MirrorPostureGamePage";
import NotFound from "./pages/NotFound";
import ParentInfo from "./pages/ParentInfo";
import ViewParentInfo from "./pages/ViewParentInfo";

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
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/parent-info" element={
            <ProtectedRoute>
              <ParentInfo />
            </ProtectedRoute>
          } />
          <Route path="/view-parent-info" element={
            <ProtectedRoute>
              <ViewParentInfo />
            </ProtectedRoute>
          } />
          <Route path="/children" element={
            <ProtectedRoute>
              <ChildrenProfiles />
            </ProtectedRoute>
          } />
          <Route path="/add-child" element={
            <ProtectedRoute>
              <AddChild />
            </ProtectedRoute>
          } />
          <Route path="/games/gesture" element={<GestureGame />} />
          <Route path="/games/mirror-posture" element={<MirrorPostureGamePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
