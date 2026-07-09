import { aisha, dana, maren, type MockPerson, tomas, yuki } from "./mock-data";

export type ProjectHealth = "On track" | "Needs attention" | "Planning";

export interface ProjectBoardStudy {
  id: string;
  name: string;
  color: string;
  cards: number;
  completed: number;
  updated: string;
  state: string;
}

export interface ProjectActivityStudy {
  person: MockPerson;
  action: string;
  target: string;
  when: string;
}

export interface ProjectStudy {
  id: string;
  code: string;
  name: string;
  summary: string;
  health: ProjectHealth;
  favorite?: boolean;
  progress: number;
  updated: string;
  members: MockPerson[];
  boards: ProjectBoardStudy[];
  activity: ProjectActivityStudy[];
}

export const projectStudies: ProjectStudy[] = [
  {
    id: "skylight",
    code: "SKY",
    name: "Skylight",
    summary:
      "Launch work across product, editorial, support, and the customer rollout.",
    health: "On track",
    favorite: true,
    progress: 68,
    updated: "Today, 11:42",
    members: [maren, tomas, aisha, dana, yuki],
    boards: [
      {
        id: "launch-checklist",
        name: "Launch checklist",
        color: "hsl(var(--chart-blue))",
        cards: 18,
        completed: 7,
        updated: "11:42",
        state: "In motion",
      },
      {
        id: "website-release",
        name: "Website release",
        color: "hsl(var(--chart-purple))",
        cards: 14,
        completed: 10,
        updated: "09:18",
        state: "Review",
      },
      {
        id: "support-readiness",
        name: "Support readiness",
        color: "hsl(var(--chart-green))",
        cards: 9,
        completed: 4,
        updated: "Yesterday",
        state: "In motion",
      },
      {
        id: "launch-archive",
        name: "Launch archive",
        color: "hsl(var(--muted-foreground))",
        cards: 12,
        completed: 12,
        updated: "Jul 5",
        state: "Complete",
      },
    ],
    activity: [
      {
        person: tomas,
        action: "moved",
        target: "Sharing links expire without warning",
        when: "12 min",
      },
      {
        person: aisha,
        action: "completed",
        target: "Performance budget review",
        when: "1 hr",
      },
      {
        person: maren,
        action: "created",
        target: "Launch-day support rotation",
        when: "3 hr",
      },
    ],
  },
  {
    id: "relay",
    code: "RLY",
    name: "Relay",
    summary:
      "A single operating view for customer requests, handoffs, and follow-through.",
    health: "On track",
    favorite: true,
    progress: 81,
    updated: "Today, 10:16",
    members: [dana, tomas, maren],
    boards: [
      {
        id: "customer-requests",
        name: "Customer requests",
        color: "hsl(var(--chart-cyan))",
        cards: 24,
        completed: 17,
        updated: "10:16",
        state: "In motion",
      },
      {
        id: "weekly-handoffs",
        name: "Weekly handoffs",
        color: "hsl(var(--chart-green))",
        cards: 11,
        completed: 8,
        updated: "Yesterday",
        state: "Review",
      },
      {
        id: "service-notes",
        name: "Service notes",
        color: "hsl(var(--chart-amber))",
        cards: 7,
        completed: 5,
        updated: "Jul 7",
        state: "Steady",
      },
    ],
    activity: [
      {
        person: dana,
        action: "assigned",
        target: "Enterprise onboarding follow-up",
        when: "34 min",
      },
      {
        person: tomas,
        action: "commented on",
        target: "Support escalation playbook",
        when: "2 hr",
      },
    ],
  },
  {
    id: "northstar",
    code: "NTH",
    name: "Northstar",
    summary:
      "Positioning, visual direction, and production for the next marketing release.",
    health: "Needs attention",
    progress: 42,
    updated: "Yesterday, 16:08",
    members: [yuki, maren, aisha, dana],
    boards: [
      {
        id: "campaign-system",
        name: "Campaign system",
        color: "hsl(var(--chart-pink))",
        cards: 21,
        completed: 6,
        updated: "Yesterday",
        state: "Blocked",
      },
      {
        id: "site-production",
        name: "Site production",
        color: "hsl(var(--chart-purple))",
        cards: 16,
        completed: 8,
        updated: "Jul 8",
        state: "In motion",
      },
      {
        id: "editorial-calendar",
        name: "Editorial calendar",
        color: "hsl(var(--chart-amber))",
        cards: 13,
        completed: 7,
        updated: "Jul 7",
        state: "Review",
      },
    ],
    activity: [
      {
        person: yuki,
        action: "flagged",
        target: "Homepage photography direction",
        when: "Yesterday",
      },
      {
        person: maren,
        action: "updated",
        target: "Campaign launch sequence",
        when: "Yesterday",
      },
    ],
  },
  {
    id: "field-notes",
    code: "FLD",
    name: "Field Notes",
    summary:
      "Quarterly research, interview synthesis, and product opportunity mapping.",
    health: "Planning",
    progress: 35,
    updated: "Jul 8, 14:30",
    members: [aisha, maren, tomas],
    boards: [
      {
        id: "research-plan",
        name: "Research plan",
        color: "hsl(var(--chart-indigo))",
        cards: 12,
        completed: 3,
        updated: "Jul 8",
        state: "Planning",
      },
      {
        id: "interview-synthesis",
        name: "Interview synthesis",
        color: "hsl(var(--chart-blue))",
        cards: 8,
        completed: 2,
        updated: "Jul 6",
        state: "Planning",
      },
    ],
    activity: [
      {
        person: aisha,
        action: "created",
        target: "Interview guide v2",
        when: "Jul 8",
      },
      {
        person: maren,
        action: "added",
        target: "Seven research participants",
        when: "Jul 7",
      },
    ],
  },
  {
    id: "studio-ops",
    code: "OPS",
    name: "Studio Ops",
    summary:
      "The internal production rhythm for resourcing, reviews, and studio systems.",
    health: "On track",
    progress: 57,
    updated: "Jul 7, 09:52",
    members: [maren, yuki, dana],
    boards: [
      {
        id: "production-desk",
        name: "Production desk",
        color: "hsl(var(--chart-blue))",
        cards: 15,
        completed: 7,
        updated: "Jul 7",
        state: "In motion",
      },
      {
        id: "design-critiques",
        name: "Design critiques",
        color: "hsl(var(--chart-pink))",
        cards: 9,
        completed: 5,
        updated: "Jul 6",
        state: "Steady",
      },
      {
        id: "system-maintenance",
        name: "System maintenance",
        color: "hsl(var(--chart-green))",
        cards: 6,
        completed: 3,
        updated: "Jul 4",
        state: "Steady",
      },
    ],
    activity: [
      {
        person: yuki,
        action: "completed",
        target: "July critique schedule",
        when: "Jul 7",
      },
      {
        person: dana,
        action: "moved",
        target: "Contractor onboarding notes",
        when: "Jul 6",
      },
    ],
  },
];

export const projectStudyTotals = {
  projects: projectStudies.length,
  boards: projectStudies.reduce(
    (total, project) => total + project.boards.length,
    0,
  ),
  members: new Set(
    projectStudies.flatMap((project) =>
      project.members.map((member) => member.name),
    ),
  ).size,
};
