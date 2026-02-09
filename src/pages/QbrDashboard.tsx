import { useQbr } from "@/contexts/QbrContext";
import CoverPage from "@/components/qbr/CoverPage";
import AgendaOverview from "@/components/qbr/AgendaOverview";
import TeamSection from "@/components/qbr/TeamSection";
import FeatureAdoption from "@/components/qbr/FeatureAdoption";
import UserEngagement from "@/components/qbr/UserEngagement";
import DeepDive from "@/components/qbr/DeepDive";
import IntegrationOpportunities from "@/components/qbr/IntegrationOpportunities";
import FutureState from "@/components/qbr/FutureState";
import ProductRoadmap from "@/components/qbr/ProductRoadmap";
import NewFeatures from "@/components/qbr/NewFeatures";
import NextSteps from "@/components/qbr/NextSteps";
import AdminPanel from "@/components/qbr/AdminPanel";
import { useState } from "react";

const navItems = [
  { id: "cover", label: "Home" },
  { id: "agenda", label: "Agenda" },
  { id: "team", label: "Team" },
  { id: "current-state", label: "Current State" },
  { id: "integrations", label: "Tech Stack" },
  { id: "future-state", label: "Future State" },
  { id: "next-steps", label: "Next Steps" },
];

export default function QbrDashboard() {
  const { data } = useQbr();

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-40 border-b-2 bg-background/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-3">
          {navItems.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
            >
              {n.label}
            </a>
          ))}
        </div>
      </nav>

      <CoverPage />
      <AgendaOverview />
      <TeamSection />

      {/* Current State */}
      <section id="current-state" className="qbr-section section-alt px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Analytics</p>
            <h2 className="text-4xl font-extrabold text-foreground">Current State</h2>
            <p className="mt-2 text-lg text-muted-foreground">Adoption, engagement & analysis</p>
          </div>
          <FeatureAdoption />
          <UserEngagement />
          <DeepDive />
        </div>
      </section>

      <IntegrationOpportunities />
      <FutureState />

      {/* Roadmap + New Features */}
      <section className="section-alt px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-16">
          <ProductRoadmap />
          <NewFeatures />
        </div>
      </section>

      <NextSteps />

      {/* Footer */}
      <footer className="border-t-2 px-6 py-10 text-center text-sm text-muted-foreground font-medium">
        Prepared for {data.customerName} &middot; {data.quarter} &middot; Confidential
      </footer>

      <AdminPanel />
    </div>
  );
}
