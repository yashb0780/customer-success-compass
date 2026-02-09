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
import { Separator } from "@/components/ui/separator";

export default function QbrDashboard() {
  const { data } = useQbr();

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-2 text-xs font-medium">
          {[
            { id: "cover", label: data.customerName },
            { id: "agenda", label: "Agenda" },
            { id: "team", label: "Team" },
            { id: "current-state", label: "Current State" },
            { id: "integrations", label: "Integrations" },
            { id: "future-state", label: "Future State" },
            { id: "next-steps", label: "Next Steps" },
          ].map((n) => (
            <a key={n.id} href={`#${n.id}`} className="shrink-0 rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {n.label}
            </a>
          ))}
        </div>
      </nav>

      <CoverPage />
      <Separator />
      <AgendaOverview />
      <Separator />
      <TeamSection />
      <Separator />

      {/* Current State */}
      <section id="current-state" className="qbr-section px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-16">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Current State</h2>
            <p className="mt-1 text-muted-foreground">Adoption, engagement & analysis</p>
          </div>
          <FeatureAdoption />
          <UserEngagement />
          <DeepDive />
        </div>
      </section>

      <Separator />
      <IntegrationOpportunities />
      <Separator />
      <FutureState />
      <Separator />

      {/* Roadmap + New Features */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-16">
          <ProductRoadmap />
          <NewFeatures />
        </div>
      </section>

      <Separator />
      <NextSteps />

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-xs text-muted-foreground">
        Prepared for {data.customerName} &middot; {data.quarter} &middot; Confidential
      </footer>

      <AdminPanel />
    </div>
  );
}
