// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Authentication/Login';
import Signup from './pages/Authentication/Signup';
import VerifyEmail from './pages/Authentication/VerifyEmail';
import ForgotPassword from './pages/Authentication/ForgotPassword';
import ResetPassword from './pages/Authentication/ResetPassword';
import AdminOverview from './pages/SuperAdmin/AdminOverview';
import AdminUsers from './pages/SuperAdmin/AdminUsers';
import AdminCampaigns from './pages/SuperAdmin/AdminCampaigns';
import AdminOrganizations from './pages/SuperAdmin/AdminOrganizations';
import AdminDonations from './pages/SuperAdmin/AdminDonations';

import Home from './pages/Home/Home';
import Campaigns from './pages/Campaigns/Campaigns';
import CampaignDetails from './pages/Campaigns/CampaignDetails';
import DonationFlow from './pages/Donation/DonationFlow';
import Organizations from './pages/Organizations/Organizations';
import OrgDetails from './pages/Organizations/OrgDetails';
import Profile from './pages/Profile/Profile';
import OrgDashboard from './pages/OrgAdmin/OrgDashboard';
import OrgCampaigns from './pages/OrgAdmin/OrgCampaigns';
import OrgDonations from './pages/OrgAdmin/OrgDonations';

import OrgSettings from './pages/OrgAdmin/OrgSettings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:kind/:id" element={<CampaignDetails />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/organizations/:id" element={<OrgDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/email-verified" element={<VerifyEmail verified />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/donate/:kind/:id" element={<ProtectedRoute><DonationFlow /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Organization admin routes */}
          <Route path="/org-admin" element={<ProtectedRoute role="orgadmin"><OrgDashboard /></ProtectedRoute>} />
          <Route path="/org-admin/campaigns" element={<ProtectedRoute role="orgadmin"><OrgCampaigns /></ProtectedRoute>} />
          <Route path="/org-admin/donations" element={<ProtectedRoute role="orgadmin"><OrgDonations /></ProtectedRoute>} />
        
          <Route path="/org-admin/settings" element={<ProtectedRoute role="orgadmin"><OrgSettings /></ProtectedRoute>} />

          {/* SuperAdmin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="superadmin"><AdminOverview /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="superadmin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/campaigns" element={<ProtectedRoute role="superadmin"><AdminCampaigns /></ProtectedRoute>} />
          <Route path="/admin/organizations" element={<ProtectedRoute role="superadmin"><AdminOrganizations /></ProtectedRoute>} />
          <Route path="/admin/donations" element={<ProtectedRoute role="superadmin"><AdminDonations /></ProtectedRoute>} />
    
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;