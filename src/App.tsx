import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { LoginPage } from "@/pages/LoginPage";
import { WorkspaceRoute } from "@/pages/WorkspaceRoute";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

import { useParams } from "react-router-dom";

function ProjectRedirect() {
  const { id } = useParams();
  return <Navigate to={`/app/projects/${id}`} replace />;
}

export function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/app/*" element={<WorkspaceRoute />} />
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/projects" element={<Navigate to="/app/projects" replace />} />
            <Route path="/projects/:id" element={<ProjectRedirect />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
