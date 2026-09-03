export type UsageLevel = "high" | "medium" | "low";
export type TrendDirection = "up" | "down" | "flat";
export type FeatureStatus = "live" | "public-beta" | "private-beta" | "upcoming";
export type TeamStatus = "active" | "moderate" | "new" | "planning";

/**
 * A named icon. Stored as a plain string rather than a React component so the
 * account data stays serializable JSON — a component could not survive a round
 * trip through the HubSpot API. Each component maps the names it needs onto
 * real lucide-react icons at render time.
 */
export type IconName =
  | "users" | "chart" | "rocket" | "checklist" | "plug"
  | "shield" | "briefcase" | "scale" | "dollar" | "cart" | "building"
  | "mail" | "message" | "bug" | "trending" | "headphones" | "share"
  | "clock" | "thumbsup" | "zap";

export interface TeamMember {
  name: string;
  role: string;
  email: string;
  photoUrl?: string;
}

export interface Feature {
  name: string;
  usage: UsageLevel;
  description?: string;
}

export interface EngagementMetric {
  label: string;
  value: number;
  trend: TrendDirection;
  change?: string;
}

export interface TrendDataPoint {
  date: string;
  mau: number;
  wau: number;
  dau: number;
}

export interface BenefitCard {
  title: string;
  metric: string;
  description: string;
  icon?: IconName;
}

export interface RoadmapItem {
  name: string;
  quarter: string;
  status: FeatureStatus;
  impactTags: string[];
  description: string;
  videoUrl?: string;
}

export interface NewFeatureCard {
  title: string;
  shortDescription: string;
  longDescription: string;
  status: FeatureStatus;
  impactTags: string[];
  videoUrl?: string;
}

export interface Integration {
  name: string;
  icon?: IconName;
}

export interface NextStepRow {
  outcome: string;
  initiative: string;
  actions: string[];
}

export interface AgentTeam {
  name: string;
  agentCount: number;
  status: TeamStatus;
  icon?: IconName;
}

/** One link in the sticky nav bar. `id` must match a section's DOM id. */
export interface NavItem {
  id: string;
  label: string;
}

/** One card in the "Today's Agenda" grid. */
export interface AgendaSection {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

/** One heading in the Product Roadmap; items whose quarter is listed appear here. */
export interface RoadmapGroup {
  title: string;
  matchQuarters: string[];
}

/** The workflow diagram at the top of the Future State section. */
export interface FutureStateContent {
  workflowTitle: string;
  workflowSteps: string[];
}

export interface QbrData {
  customerName: string;
  customerLogoUrl: string;
  qbrTitle: string;
  quarter: string;
  date: string;

  team: TeamMember[];

  totalFeaturesOnPlan: number;
  featuresInUse: number;
  features: Feature[];

  licensedSeats: number;
  engagement: EngagementMetric[];
  trendData: TrendDataPoint[];

  agentTeams: AgentTeam[];

  workingWell: string[];
  toImprove: string[];

  benefits: BenefitCard[];

  connectedIntegrations: Integration[];
  availableIntegrations: Integration[];

  roadmap: RoadmapItem[];

  newFeatures: NewFeatureCard[];

  nextSteps: NextStepRow[];

  navItems: NavItem[];
  agendaSections: AgendaSection[];
  futureState: FutureStateContent;
  roadmapGroups: RoadmapGroup[];
  /** Selectable impact tags in the admin panel's roadmap editor. */
  impactTagOptions: string[];
  /** Selectable quarters in the admin panel's roadmap editor. */
  quarterOptions: string[];
  /** Trailing note in the page footer, e.g. "Confidential". */
  footerNote: string;

  adminPassword: string;
}
