import { useQbr } from "@/contexts/QbrContext";
import CoverPage from "@/components/qbr/CoverPage";
import AgendaOverview from "@/components/qbr/AgendaOverview";
import TeamSection from "@/components/qbr/TeamSection";
import FeatureAdoption from "@/components/qbr/FeatureAdoption";
import TeamAgentOverview from "@/components/qbr/TeamAgentOverview";
import DeepDive from "@/components/qbr/DeepDive";
import IntegrationOpportunities from "@/components/qbr/IntegrationOpportunities";
import FutureState from "@/components/qbr/FutureState";
import ProductRoadmap from "@/components/qbr/ProductRoadmap";
import NewFeatures from "@/components/qbr/NewFeatures";
import NextSteps from "@/components/qbr/NextSteps";
import ThankYouSlide from "@/components/qbr/ThankYouSlide";
import AdminPanel from "@/components/qbr/AdminPanel";
import DataSourceBadge from "@/components/qbr/DataSourceBadge";

export default function QbrDashboard() {
  const { data } = useQbr();
  const navItems = data.navItems ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-0.5 overflow-x-auto px-4 py-2">
          {navItems.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
          <DataSourceBadge />
        </div>
      </nav>

      <CoverPage />
      <AgendaOverview />
      <TeamSection />

      {/* Current State */}
      <section id="current-state" className="qbr-section section-alt px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Analytics</p>
            <h2 className="text-2xl font-semibold text-foreground">Current State</h2>
          </div>
          <FeatureAdoption />
          <TeamAgentOverview />
          <DeepDive />
        </div>
      </section>

      <IntegrationOpportunities />
      <FutureState />

      {/* Roadmap + New Features */}
      <section className="section-alt px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-12">
          <ProductRoadmap />
          <NewFeatures />
        </div>
      </section>

      <NextSteps />
      <ThankYouSlide />

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-xs text-muted-foreground">
        Prepared for {data.customerName} · {data.quarter} · {data.footerNote} · <DataSourceBadge variant="text" />
      </footer>

      {typeof window !== "undefined" && new URLSearchParams(window.location.search).has("admin") && <AdminPanel />}
    </div>
  );
}
