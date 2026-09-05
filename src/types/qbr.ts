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

/* ------------------------------------------------------------------------ *
 * Content provenance
 *
 * Says where a section's content came from. Built for the extraction pipeline:
 * read unstructured internal context (CRM deal notes, success plans, internal
 * docs), pull structured content out of it, let the CSM edit the result.
 * ------------------------------------------------------------------------ */

export type ContentSourceKind =
  | "manual"        // typed by hand in the admin panel
  | "deal-notes"    // CRM deal / opportunity notes
  | "success-plan"  // customer success plan
  | "internal-doc"  // internal knowledge base or product doc
  | "hubspot";      // structured HubSpot fields

export interface ContentProvenance {
  kind: ContentSourceKind;

  /**
   * The specific source, e.g. "Q1 renewal deal notes". Shown in the tooltip
   * rather than inline, so the indicator stays short.
   */
  label?: string;

  /**
   * ISO date of the SOURCE MATERIAL — when the note was written, NOT when we
   * read it. This is the date that is displayed and the one staleness is
   * measured against. An eighteen-month-old note extracted this morning is
   * still eighteen months stale, which is the whole point of tracking this.
   */
  sourceDate?: string;

  /** ISO timestamp of when extraction ran. Bookkeeping only; never displayed. */
  extractedAt?: string;
}

/** Sections whose content can come from an extracted source. */
export type SourcedSection = "features" | "integrations" | "roadmap" | "newFeatures";

export type ProvenanceMap = Partial<Record<SourcedSection, ContentProvenance>>;

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
  /**
   * The customer's web domain, e.g. "acme.com". An IDENTIFIER used to find
   * their internal records — deal notes, success plans, KB docs. It is never
   * rendered on the customer-facing page, and it is deliberately NOT a source
   * of tech-stack information: public web signals describe a marketing site,
   * not what a customer runs internally.
   */
  customerDomain: string;
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

  /** Where each sourced section's content came from. See ContentProvenance. */
  provenance: ProvenanceMap;
}

/* ------------------------------------------------------------------------ *
 * API envelope
 *
 * QbrData above is the payload — the account content the page renders.
 * AccountResponse is what /api/account actually returns: that payload plus a
 * little context about where it came from. Keeping them separate means the
 * page components never need to know an API exists.
 * ------------------------------------------------------------------------ */

/** Where the payload came from. "static" is the bundled demo account. */
export type AccountSource = "static" | "hubspot";

export interface AccountMeta {
  /** The customer this payload describes; echoes back the requested id. */
  customerId: string;
  source: AccountSource;
  /** ISO 8601 timestamp of when the server produced this payload. */
  generatedAt: string;
}

/** Success body of GET /api/account. */
export interface AccountResponse {
  data: QbrData;
  meta: AccountMeta;
}

/** Error body of GET /api/account. Never returned alongside `data`. */
export interface AccountErrorResponse {
  error: {
    code: "invalid_customer_id" | "not_found" | "upstream_error" | "internal_error" | "method_not_allowed";
    message: string;
  };
}
