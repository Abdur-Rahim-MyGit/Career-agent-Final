import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/directions" element={<DirectionSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/passport" element={<Passport />} />
          <Route path="/insights" element={<MarketInsights />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/po/:collegeCode" element={<PODashboard />} />
          <Route path="/po" element={<PODashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
