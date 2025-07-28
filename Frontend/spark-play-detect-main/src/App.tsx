import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddChild from "./pages/AddChild";
import Auth from "./pages/Auth";
import ChildrenProfiles from "./pages/ChildrenProfiles";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ParentInfo from "./pages/ParentInfo";
import ViewParentInfo from "./pages/ViewParentInfo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
