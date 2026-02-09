export type UsageLevel = "high" | "medium" | "low";
export type TrendDirection = "up" | "down" | "flat";
export type FeatureStatus = "live" | "public-beta" | "private-beta" | "upcoming";

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
  icon?: string;
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
  icon?: string;
}

export interface NextStepRow {
  outcome: string;
  initiative: string;
  actions: string[];
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

  workingWell: string[];
  toImprove: string[];

  benefits: BenefitCard[];

  connectedIntegrations: Integration[];
  availableIntegrations: Integration[];

  roadmap: RoadmapItem[];

  newFeatures: NewFeatureCard[];

  nextSteps: NextStepRow[];

  adminPassword: string;
}
