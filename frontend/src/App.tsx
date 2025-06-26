import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/dashboard/DashboardPage';
import UploadPage from './pages/dashboard/Upload';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StarredPage from './pages/dashboard/Starred';
import RecentPage from './pages/dashboard/Recent';
import FolderView from './pages/dashboard/FolderView';
import ProtectedRoute from './router/ProtectedRoute';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/folder/:folderId"
          element={
            <ProtectedRoute>
              <FolderView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/starred"
          element={
            <ProtectedRoute>
              <StarredPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/recent"
          element={
            <ProtectedRoute>
              <RecentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
