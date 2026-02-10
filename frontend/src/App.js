import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Pages } from "@/pages/Pages";
import { PageEditor } from "@/pages/PageEditor";
import { Media } from "@/pages/Media";
import { Settings } from "@/pages/Settings";
import { Toaster } from "sonner";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pages"
            element={
              <ProtectedRoute>
                <Pages />
              </ProtectedRoute>
            }
          />
          {/* Explicit edit route to match navigation */}
          <Route
            path="/admin/pages/edit/:id"
            element={
              <ProtectedRoute>
                <PageEditor />
              </ProtectedRoute>
            }
          />
          {/* Catch-all for pages parameters (e.g., /admin/pages/new) */}
          <Route
            path="/admin/pages/:id"
            element={
              <ProtectedRoute>
                <PageEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/media"
            element={
              <ProtectedRoute>
                <Media />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
