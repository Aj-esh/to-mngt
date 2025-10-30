import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
    const { isAuthenticated } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
            <Route
            path="/"
            element={
                <ProtectedRoute>
                    <DashboardPage />
                </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    )
}

function App() {
    return (
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
    );
}

export default App;
