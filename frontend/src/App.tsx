import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FoundingPartnerStrip } from './components/FoundingPartnerStrip';
import { OutcomesFraming } from './components/OutcomesFraming';
import { CoreCapabilities } from './components/CoreCapabilities';
import { WorkspacesSection } from './components/WorkspacesSection';
import { AiAssistantDemo } from './components/AiAssistantDemo';
import { InstitutionalOversight } from './components/InstitutionalOversight';
import { SocialProof } from './components/SocialProof';
import { ProfessionalAlignment } from './components/ProfessionalAlignment';
import { WalkthroughBooking } from './components/WalkthroughBooking';
import { Footer } from './components/Footer';
import { ScoreExplainerModal } from './components/ScoreExplainerModal';
import { PartnerModal } from './components/PartnerModal';
import { InstitutionDashboard } from './components/institution/InstitutionDashboard';
import type { HealthResponse } from './types';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'institution'>('landing');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scoreModalOpen, setScoreModalOpen] = useState<boolean>(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState<boolean>(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  const checkApiHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/health/`);
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      } else {
        setHealth(null);
      }
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  const handleScrollToBooking = () => {
    const el = document.getElementById('booking-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (currentView === 'institution') {
    return <InstitutionDashboard onBackToLanding={() => setCurrentView('landing')} />;
  }

  return (
    <div className="app-root">
      {/* Top Navbar */}
      <Navbar
        health={health}
        loading={loading}
        onOpenBooking={handleScrollToBooking}
        onOpenScoreModal={() => setScoreModalOpen(true)}
        onOpenInstitutionPortal={() => setCurrentView('institution')}
      />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero Section */}
        <Hero
          onOpenBooking={handleScrollToBooking}
          onOpenScoreModal={() => setScoreModalOpen(true)}
        />

        {/* 2. Founding Partner Strip */}
        <FoundingPartnerStrip
          onOpenPartnerModal={() => setPartnerModalOpen(true)}
        />

        {/* 3. Outcomes Framing (Three Columns, Zero Fake Numbers) */}
        <OutcomesFraming />

        {/* 4. Core Capabilities (Pathways, Counselling, Employer Pipeline) */}
        <CoreCapabilities />

        {/* 5. Four Workspaces, One Record */}
        <WorkspacesSection />

        {/* 6. Grounded AI Assistant Demo */}
        <AiAssistantDemo />

        {/* 7. Institutional Oversight & Taxonomy */}
        <InstitutionalOversight />

        {/* 8. Social Proof & Early Partner Advisory Voice */}
        <SocialProof
          onOpenPartnerModal={() => setPartnerModalOpen(true)}
        />

        {/* 9. Professional Alignment */}
        <ProfessionalAlignment />

        {/* 10. Walkthrough Booking & Closing CTA with Trust Strip */}
        <WalkthroughBooking />
      </main>

      {/* 11. Footer */}
      <Footer
        health={health}
        onOpenScoreModal={() => setScoreModalOpen(true)}
        onOpenPartnerModal={() => setPartnerModalOpen(true)}
      />

      {/* Modals */}
      <ScoreExplainerModal
        isOpen={scoreModalOpen}
        onClose={() => setScoreModalOpen(false)}
        onOpenBooking={handleScrollToBooking}
      />

      <PartnerModal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
      />
    </div>
  );
}
