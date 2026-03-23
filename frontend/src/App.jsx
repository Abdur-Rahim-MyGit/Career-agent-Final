import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import DirectionSelection from './pages/DirectionSelection';
import Dashboard from './pages/Dashboard';
import Passport from './pages/Passport';
import MarketInsights from './pages/MarketInsights';
import AdminDashboard from './pages/AdminDashboard';
import PODashboard from './pages/PODashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/insights" element={<MarketInsights />} />

            {/* Protected routes — require authentication */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/directions" element={<ProtectedRoute><DirectionSelection /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/passport" element={<ProtectedRoute><Passport /></ProtectedRoute>} />

            {/* Admin-only routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/po/:collegeCode" element={<ProtectedRoute adminOnly><PODashboard /></ProtectedRoute>} />
            <Route path="/po" element={<ProtectedRoute adminOnly><PODashboard /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
