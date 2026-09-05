// Relative (not the "@/" alias) so the serverless function in api/ can import
// this file too — that alias only exists inside the Vite build.
import type { QbrData } from "../types/qbr.js";

export const accountData: QbrData = {
  customerName: "Acme Corp",
  customerDomain: "acme.com",
  customerLogoUrl: "",
  qbrTitle: "Quarterly Business Review",
  quarter: "Q1 2026",
  date: "February 2026",

  team: [
    { name: "Sarah Chen", role: "Customer Success Manager", email: "sarah@vendor.io" },
    { name: "Marcus Johnson", role: "Solutions Engineer", email: "marcus@vendor.io" },
    { name: "Emily Rodriguez", role: "Account Executive", email: "emily@vendor.io" },
  ],

  totalFeaturesOnPlan: 12,
  featuresInUse: 10,
  features: [
    { name: "Alert Management", usage: "high", description: "Incident alert routing & escalation" },
    { name: "Change Management", usage: "high", description: "Controlled change request workflows" },
    { name: "Project Management", usage: "high", description: "Cross-team project tracking" },
    { name: "Analytics Pro", usage: "high", description: "Advanced reporting & insights" },
    { name: "Release Management", usage: "high", description: "Software release planning & tracking" },
    { name: "Service Health Monitoring", usage: "high", description: "Real-time service status visibility" },
    { name: "Team Dashboard", usage: "medium", description: "Unified team performance view" },
    { name: "Workload Management", usage: "medium", description: "Agent capacity & queue balancing" },
    { name: "Custom Objects", usage: "medium", description: "Flexible data model extensions" },
    { name: "Workflow Automator", usage: "medium", description: "No-code automation builder" },
    { name: "Cloud Orchestration", usage: "low", description: "Multi-cloud workflow coordination" },
    { name: "Custom Fields", usage: "low", description: "Flexible data capture on records" },
  ],

  licensedSeats: 150,
  engagement: [
    { label: "Monthly Active Users", value: 128, trend: "up", change: "+8%" },
    { label: "Weekly Active Users", value: 94, trend: "up", change: "+5%" },
    { label: "Daily Active Users", value: 71, trend: "flat", change: "0%" },
  ],
  trendData: [
    { date: "Nov 1", mau: 112, wau: 78, dau: 55 },
    { date: "Nov 15", mau: 115, wau: 80, dau: 58 },
    { date: "Dec 1", mau: 118, wau: 83, dau: 60 },
    { date: "Dec 15", mau: 120, wau: 86, dau: 63 },
    { date: "Jan 1", mau: 122, wau: 88, dau: 66 },
    { date: "Jan 15", mau: 125, wau: 91, dau: 69 },
    { date: "Feb 1", mau: 128, wau: 94, dau: 71 },
  ],

  agentTeams: [
    { name: "IT Support", agentCount: 42, status: "active", icon: "shield" },
    { name: "HR", agentCount: 18, status: "active", icon: "users" },
    { name: "Legal", agentCount: 8, status: "moderate", icon: "scale" },
    { name: "Finance", agentCount: 15, status: "moderate", icon: "dollar" },
    { name: "Sales Ops", agentCount: 22, status: "new", icon: "cart" },
    { name: "Facilities", agentCount: 6, status: "planning", icon: "building" },
  ],

  workingWell: [
    "Live chat resolution time decreased by 22% quarter-over-quarter",
    "Knowledge base articles deflecting 35% of common tickets",
    "AI Copilot adoption at 85% among agents — saving avg 4 min per ticket",
    "CSAT consistently above 4.5/5.0 for the past 90 days",
    "Multi-channel inbox consolidation reduced context-switching by 40%",
  ],
  toImprove: [
    "Chatbot builder adoption remains low — only 2 bots deployed vs. 10 planned",
    "Customer Portal has <15% end-user awareness; needs promotion campaign",
    "Advanced Analytics dashboards underutilized — team still relying on spreadsheets",
    "Proactive Messaging not yet launched — missed opportunity for churn reduction",
    "Quality Assurance module not enabled — no systematic conversation reviews",
  ],

  benefits: [
    { title: "Ticket Deflection", metric: "40%", description: "Reduce inbound tickets with bots + KB", icon: "trending" },
    { title: "Avg Handle Time", metric: "-30%", description: "Faster resolution with AI Copilot", icon: "clock" },
    { title: "CSAT Score", metric: "4.7/5", description: "Target through proactive engagement", icon: "thumbsup" },
    { title: "Agent Productivity", metric: "+25%", description: "More tickets handled per agent", icon: "zap" },
  ],

  connectedIntegrations: [
    { name: "Salesforce", icon: "trending" },
    { name: "Email", icon: "mail" },
  ],
  availableIntegrations: [
    { name: "Slack", icon: "message" },
    { name: "Jira", icon: "bug" },
    { name: "Google Analytics", icon: "chart" },
    { name: "Zendesk", icon: "headphones" },
    { name: "HubSpot", icon: "share" },
  ],

  roadmap: [
    { name: "AI Auto-Resolve", quarter: "Q1 2026", status: "live", impactTags: ["Faster Resolution", "Deflection"], description: "AI automatically resolves common issues end-to-end without agent involvement." },
    { name: "Sentiment Analysis", quarter: "Q1 2026", status: "public-beta", impactTags: ["Increased CSAT", "Proactive"], description: "Real-time customer sentiment detection to prioritize at-risk conversations." },
    { name: "Unified Customer 360", quarter: "Q2 2026", status: "private-beta", impactTags: ["Agent Productivity"], description: "Single pane of glass showing complete customer history across all channels." },
    { name: "Predictive Escalation", quarter: "Q2 2026", status: "upcoming", impactTags: ["Faster Resolution", "Reduced Escalations"], description: "ML model predicts which tickets will escalate and routes them proactively." },
    { name: "Smart Scheduling", quarter: "H2 2026", status: "upcoming", impactTags: ["Agent Productivity", "Cost Savings"], description: "AI-driven workforce scheduling based on predicted ticket volume." },
  ],

  newFeatures: [
    {
      title: "AI Auto-Resolve",
      shortDescription: "Automatically resolve common tickets without agent involvement.",
      longDescription: "AI Auto-Resolve analyzes incoming tickets, matches them against your knowledge base, and resolves straightforward issues end-to-end. Agents are only looped in for complex cases.",
      status: "live",
      impactTags: ["Faster Resolution", "40% Deflection"],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      title: "Sentiment Analysis",
      shortDescription: "Detect customer frustration in real-time.",
      longDescription: "Real-time NLP analysis detects negative sentiment shifts during conversations, automatically flagging at-risk interactions for supervisor review or priority routing.",
      status: "public-beta",
      impactTags: ["Increased CSAT", "Churn Prevention"],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      title: "Unified Customer 360",
      shortDescription: "Complete customer context in one view.",
      longDescription: "See every interaction, purchase, and support ticket in a single timeline. Agents no longer need to switch between tools to understand the full customer story.",
      status: "private-beta",
      impactTags: ["Agent Productivity", "Better CX"],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  ],

  nextSteps: [
    {
      outcome: "Reduce ticket volume by 40% through self-service",
      initiative: "Chatbot & Knowledge Base Expansion",
      actions: ["Deploy 5 new chatbot flows by end of Q2", "Audit and update top-50 KB articles", "Launch customer portal awareness campaign"],
    },
    {
      outcome: "Improve agent efficiency by 25%",
      initiative: "AI Copilot Full Rollout & Training",
      actions: ["Complete AI Copilot training for remaining 15% of agents", "Enable auto-suggest for top 20 ticket categories", "Set up QA scoring for AI-assisted conversations"],
    },
    {
      outcome: "Achieve 4.7+ CSAT across all channels",
      initiative: "Proactive Engagement Program",
      actions: ["Launch proactive messaging for at-risk accounts", "Enable sentiment analysis routing rules", "Create escalation playbook for negative-sentiment tickets"],
    },
  ],

  // Sticky nav bar at the top of the page (was hardcoded in QbrDashboard.tsx).
  navItems: [
    { id: "cover", label: "Home" },
    { id: "agenda", label: "Agenda" },
    { id: "team", label: "Team" },
    { id: "current-state", label: "Current State" },
    { id: "integrations", label: "Tech Stack" },
    { id: "future-state", label: "Future State" },
    { id: "next-steps", label: "Next Steps" },
  ],

  // "Today's Agenda" cards (was hardcoded in AgendaOverview.tsx).
  agendaSections: [
    { id: "team", title: "Your Team", description: "Meet the team dedicated to your success", icon: "users" },
    { id: "current-state", title: "Current State", description: "Adoption, engagement & deep dive analysis", icon: "chart" },
    { id: "integrations", title: "Tech Stack", description: "Connected tools & integration opportunities", icon: "plug" },
    { id: "future-state", title: "Future State", description: "Roadmap, new features & product vision", icon: "rocket" },
    { id: "next-steps", title: "Next Steps", description: "Action items & desired outcomes", icon: "checklist" },
  ],

  // Workflow diagram in the Future State section (was hardcoded in FutureState.tsx).
  futureState: {
    workflowTitle: "Optimized Support Flow",
    workflowSteps: [
      "Customer Query",
      "AI Triage",
      "Auto-Resolve / Route",
      "Agent Assist",
      "Resolution + CSAT",
    ],
  },

  // Roadmap headings and which quarters fall under each (was hardcoded in ProductRoadmap.tsx).
  // NOTE: these are literal 2026 strings. A roadmap item whose quarter is not
  // listed here renders nowhere — see "Known gaps" in CLAUDE.md.
  roadmapGroups: [
    { title: "This Quarter", matchQuarters: ["Q1 2026"] },
    { title: "Next Quarter", matchQuarters: ["Q2 2026"] },
    { title: "Later This Year", matchQuarters: ["H2 2026"] },
  ],

  // Admin panel dropdown choices (were hardcoded in AdminPanel.tsx).
  impactTagOptions: [
    "Faster Resolution", "Increased CSAT", "Deflection", "Agent Productivity",
    "Cost Savings", "Proactive", "Reduced Escalations", "Better CX", "Churn Prevention",
  ],
  quarterOptions: ["Q1 2026", "Q2 2026", "H2 2026"],

  // Trailing note in the page footer (was hardcoded in QbrDashboard.tsx).
  footerNote: "Confidential",

  // Where each sourced section came from. Everything is hand-entered today, so
  // there is no sourceDate to record yet; the extraction pipeline will set both
  // the kind and the source date.
  provenance: {
    features: { kind: "manual" },
    integrations: { kind: "manual" },
    roadmap: { kind: "manual" },
    newFeatures: { kind: "manual" },
  },

  adminPassword: "qbr2026",
};
