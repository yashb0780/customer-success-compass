import { QbrData } from "@/types/qbr";

export const defaultQbrData: QbrData = {
  customerName: "Acme Corp",
  customerLogoUrl: "",
  qbrTitle: "Quarterly Business Review",
  quarter: "Q1 2026",
  date: "February 2026",

  team: [
    { name: "Sarah Chen", role: "Customer Success Manager", email: "sarah@vendor.io" },
    { name: "Marcus Johnson", role: "Solutions Engineer", email: "marcus@vendor.io" },
    { name: "Emily Rodriguez", role: "Account Executive", email: "emily@vendor.io" },
  ],

  totalFeaturesOnPlan: 18,
  featuresInUse: 12,
  features: [
    { name: "Live Chat", usage: "high", description: "Real-time customer messaging" },
    { name: "Ticketing System", usage: "high", description: "Support ticket management" },
    { name: "Knowledge Base", usage: "high", description: "Self-service help center" },
    { name: "AI Copilot", usage: "high", description: "Agent assist with AI suggestions" },
    { name: "CSAT Surveys", usage: "high", description: "Post-resolution satisfaction surveys" },
    { name: "SLA Management", usage: "medium", description: "Service level tracking" },
    { name: "Canned Responses", usage: "high", description: "Pre-built reply templates" },
    { name: "Reporting Dashboard", usage: "medium", description: "Analytics and insights" },
    { name: "Multi-channel Inbox", usage: "high", description: "Unified messaging across channels" },
    { name: "Automations", usage: "medium", description: "Workflow automation rules" },
    { name: "Custom Fields", usage: "high", description: "Flexible data capture" },
    { name: "API Integrations", usage: "medium", description: "Third-party connections" },
    { name: "Chatbot Builder", usage: "low", description: "No-code bot creation" },
    { name: "Customer Portal", usage: "low", description: "Self-service customer hub" },
    { name: "Advanced Analytics", usage: "low", description: "Deep-dive reporting" },
    { name: "Workforce Management", usage: "low", description: "Agent scheduling & capacity" },
    { name: "Quality Assurance", usage: "low", description: "Conversation review scoring" },
    { name: "Proactive Messaging", usage: "low", description: "Outbound engagement campaigns" },
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
    { name: "IT Support", agentCount: 42, status: "active" },
    { name: "HR", agentCount: 18, status: "active" },
    { name: "Legal", agentCount: 8, status: "moderate" },
    { name: "Finance", agentCount: 15, status: "moderate" },
    { name: "Sales Ops", agentCount: 22, status: "new" },
    { name: "Facilities", agentCount: 6, status: "planning" },
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
    { title: "Ticket Deflection", metric: "40%", description: "Reduce inbound tickets with bots + KB" },
    { title: "Avg Handle Time", metric: "-30%", description: "Faster resolution with AI Copilot" },
    { title: "CSAT Score", metric: "4.7/5", description: "Target through proactive engagement" },
    { title: "Agent Productivity", metric: "+25%", description: "More tickets handled per agent" },
  ],

  connectedIntegrations: [
    { name: "Salesforce" },
    { name: "Email" },
  ],
  availableIntegrations: [
    { name: "Slack" },
    { name: "Jira" },
    { name: "Google Analytics" },
    { name: "Zendesk" },
    { name: "HubSpot" },
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

  adminPassword: "qbr2026",
};
