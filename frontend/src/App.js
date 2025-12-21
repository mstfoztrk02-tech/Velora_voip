import React, { useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Features from "./components/Features";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

import LoginModal from "./components/LoginModal";
import ContactModal from "./components/ContactModal";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";

import Products from "./pages/Products";
import Developers from "./pages/Developers";
import Partners from "./pages/Partners";
import Resources from "./pages/Resources";
import Pricing from "./pages/Pricing";
import CRM from "./pages/CRM";
import VoIPCRM from "./pages/VoIPCRMAdvanced";

import AdminApprovalCenter from "./pages/AdminApprovalCenter";
import SuperAdminPanel from "./pages/SuperAdminPanel";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import IntegrationsPage from "./pages/IntegrationsPage";
import DealerManagementPage from "./pages/DealerManagementPage";
import TrunkManagementPage from "./pages/TrunkManagementPage";
import SecurityPage from "./pages/SecurityPage";
import ReportingPage from "./pages/ReportingPage";
import TenantManagementPage from "./pages/TenantManagementPage";
import FraudManagementPage from "./pages/FraudManagementPage";
import SystemSettingsPage from "./pages/SystemSettingsPage";
import LiveCallsPage from "./pages/LiveCallsPage";

import ScriptStudio from "./pages/platinum/ScriptStudio";
import VoiceLibrary from "./pages/platinum/VoiceLibrary";
import TTSGenerator from "./pages/platinum/TTSGenerator";
import AutoDialer from "./pages/platinum/AutoDialer";
import PlatinumLiveCalls from "./pages/platinum/PlatinumLiveCalls";
import CDRAnalytics from "./pages/platinum/CDRAnalytics";

export default function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleLoginClick = () => setIsLoginModalOpen(true);
  const handleContactClick = () => setIsContactModalOpen(true);

  const handleLearnMore = () => {
    document.getElementById("urunler")?.scrollIntoView({ behavior: "smooth" });
  };

  const Landing = (
    <div className="min-h-screen">
      <Header onLoginClick={handleLoginClick} onContactClick={handleContactClick} />
      <Hero onGetStarted={handleLoginClick} onLearnMore={handleLearnMore} />
      <Services />
      <Features />
      <FAQ />
      <CTA onLoginClick={handleLoginClick} onContactClick={handleContactClick} />
      <Footer />
    </div>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={Landing} />

        <Route
          path="/urunler"
          element={<Products onLoginClick={handleLoginClick} onContactClick={handleContactClick} />}
        />
        <Route
          path="/gelistiriciler"
          element={<Developers onLoginClick={handleLoginClick} onContactClick={handleContactClick} />}
        />
        <Route
          path="/partnerler"
          element={<Partners onLoginClick={handleLoginClick} onContactClick={handleContactClick} />}
        />
        <Route
          path="/kaynaklar"
          element={<Resources onLoginClick={handleLoginClick} onContactClick={handleContactClick} />}
        />
        <Route
          path="/fiyatlandirma"
          element={<Pricing onLoginClick={handleLoginClick} onContactClick={handleContactClick} />}
        />

        <Route path="/crm" element={<CRM />} />
        <Route path="/voip-crm" element={<VoIPCRM />} />

        {/* Super Admin Login - Public */}
        <Route path="/admin/super-admin-login" element={<SuperAdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin/approval-center" element={<ProtectedRoute><AdminApprovalCenter /></ProtectedRoute>} />
        <Route path="/admin/super-admin-panel" element={<ProtectedRoute><SuperAdminPanel /></ProtectedRoute>} />
        <Route path="/admin/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
        <Route path="/admin/dealers" element={<ProtectedRoute><DealerManagementPage /></ProtectedRoute>} />
        <Route path="/admin/trunks" element={<ProtectedRoute><TrunkManagementPage /></ProtectedRoute>} />
        <Route path="/admin/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
        <Route path="/admin/reporting" element={<ProtectedRoute><ReportingPage /></ProtectedRoute>} />
        <Route path="/admin/tenants" element={<ProtectedRoute><TenantManagementPage /></ProtectedRoute>} />
        <Route path="/admin/fraud" element={<ProtectedRoute><FraudManagementPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><SystemSettingsPage /></ProtectedRoute>} />
        <Route path="/admin/live-calls" element={<ProtectedRoute><LiveCallsPage /></ProtectedRoute>} />

        {/* Platinum Routes */}
        <Route path="/crm/platinum/script-studio" element={<ProtectedRoute><ScriptStudio /></ProtectedRoute>} />
        <Route path="/crm/platinum/voice-library" element={<ProtectedRoute><VoiceLibrary /></ProtectedRoute>} />
        <Route path="/crm/platinum/tts-generator" element={<ProtectedRoute><TTSGenerator /></ProtectedRoute>} />
        <Route path="/crm/platinum/auto-dialer" element={<ProtectedRoute><AutoDialer /></ProtectedRoute>} />
        <Route path="/crm/platinum/live-calls" element={<ProtectedRoute><PlatinumLiveCalls /></ProtectedRoute>} />
        <Route path="/crm/platinum/cdr-analytics" element={<ProtectedRoute><CDRAnalytics /></ProtectedRoute>} />
      </Routes>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      <Toaster />
    </>
  );
}
