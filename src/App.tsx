import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import RoutesPage from "./pages/Routes";
import BookingFlow from "./pages/BookingFlow";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (adminOnly && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RoutesPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/booking/:routeId"
                element={
                  <ProtectedRoute>
                    <BookingFlow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
