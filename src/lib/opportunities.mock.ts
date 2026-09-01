/**
 * Sample opportunity dataset.
 *
 * This is the fallback data source used while no external opportunity API is
 * connected. The shape intentionally mirrors what a real provider (Devpost,
 * Internshala, Coursera, university portals, ...) would return, so the service
 * layer in `opportunity-service.ts` can swap sources without touching the UI.
 */

export type OpportunityType =
  | "hackathon"
  | "internship"
  | "course"
  | "workshop"
  | "competition"
  | "mentorship"
  | "grant";

export type OpportunityRecord = {
  id: string;
  title: string;
  host: string | null;
  type: string;
  description: string | null;
  skills: string[] | null;
  domains?: string[] | null;
  eligibility: string[] | null;
  levels?: string[] | null;
  mode: string | null;
  location: string | null;
  starts_at: string | null;
  deadline_at: string | null;
  url: string | null;
  prize: string | null;
  certificate: boolean | null;
  image_url?: string | null;
  source?: string;
};

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const mockOpportunities: OpportunityRecord[] = [
  {
    id: "mock-hack-web",
    title: "Campus Web Dev Hackathon",
    host: "TechCampus Collective",
    type: "hackathon",
    description:
      "A 48-hour build sprint where student teams ship a working web product around civic problems. Mentors from local startups review every submission and the top three teams present to a founder panel.",
    skills: ["html", "css", "javascript", "react", "ui-design"],
    domains: ["web-development", "social-impact"],
    eligibility: ["undergraduate", "high-school", "team-based"],
    levels: ["beginner", "intermediate"],
    mode: "hybrid",
    location: "Bengaluru + Online",
    starts_at: daysFromNow(21),
    deadline_at: daysFromNow(12),
    url: "https://example.com/campus-web-hackathon",
    prize: "₹1,00,000 pool",
    certificate: true,
    source: "mock",
  },
  {
    id: "mock-hack-ai",
    title: "OpenAI for Good Student Hack",
    host: "Applied AI Society",
    type: "hackathon",
    description:
      "Build an assistive tool that helps a real community organisation. Teams get dataset credits, weekly office hours, and a demo day livestream.",
    skills: ["python", "machine-learning", "data-science", "prompt-engineering"],
    domains: ["artificial-intelligence", "social-impact"],
    eligibility: ["undergraduate", "graduate", "team-based"],
    levels: ["intermediate", "advanced"],
    mode: "remote",
    location: "Remote",
    starts_at: daysFromNow(34),
    deadline_at: daysFromNow(26),
    url: "https://example.com/ai-for-good",
    prize: "$5,000 + compute credits",
    certificate: true,
    source: "mock",
  },
  {
    id: "mock-intern-swe",
    title: "Summer Software Engineering Internship",
    host: "Northwind Systems",
    type: "internship",
    description:
      "Twelve paid weeks on a product team shipping customer-facing features. You pair with a senior engineer, own a small service, and present your work at the end of the programme.",
    skills: ["java", "python", "git", "sql", "problem-solving"],
    domains: ["software-development", "backend"],
    eligibility: ["undergraduate", "graduate"],
    levels: ["intermediate"],
    mode: "onsite",
    location: "Hyderabad, India",
    starts_at: daysFromNow(80),
    deadline_at: daysFromNow(19),
    url: "https://example.com/northwind-swe-intern",
    prize: "Paid · ₹60,000/month",
    certificate: true,
    source: "mock",
  },
  {
    id: "mock-intern-data",
    title: "Data Analytics Intern (Remote)",
    host: "Bluepeak Analytics",
    type: "internship",
    description:
      "Support the insights team with dashboards, SQL analysis and reporting for retail clients. Structured onboarding designed for first-time interns.",
    skills: ["sql", "python", "excel", "data-visualisation"],
    domains: ["data-science", "analytics"],
    eligibility: ["undergraduate", "recent-grad"],
    levels: ["beginner", "intermediate"],
    mode: "remote",
    location: "Remote",
    starts_at: daysFromNow(45),
    deadline_at: daysFromNow(9),
    url: "https://example.com/bluepeak-data-intern",
    prize: "Stipend + certificate",
    certificate: true,
    source: "mock",
  },
  {
    id: "mock-intern-design",
    title: "Product Design Internship",
    host: "Studio Kite",
    type: "internship",
    description:
      "Work alongside two product designers on research, wireframes and a shipped feature. Portfolio review included at the end of the internship.",
    skills: ["ui-design", "figma", "user-research", "prototyping"],
    domains: ["design", "product"],
    eligibility: ["undergraduate", "recent-grad"],
    levels: ["beginner", "intermediate"],
    mode: "hybrid",
    location: "Pune, India",
    starts_at: daysFromNow(60),
    deadline_at: daysFromNow(30),
    url: "https://example.com/studio-kite-design",
    prize: "Paid internship",
    certificate: true,
    source: "mock",
  },
  {
    id: "mock-course-webdev",
    title: "Modern Frontend Development Track",
    host: "OpenLearn Academy",
    type: "course",
    description:
      "Eight self-paced modules covering semantic HTML, responsive CSS, JavaScript fundamentals and a React capstone project reviewed by instructors.",
    skills: ["html", "css", "javascript", "react"],
    domains: ["web-development"],
    eligibility: ["high-school", "undergraduate", "no-experience"],
    levels: ["beginner"],
    mode: "remote",
    location: "Self-paced online",
    starts_at: daysFromNow(3),
    deadline_at: null,
    url: "https://example.com/frontend-track",
    prize: null,
    certificate: true,
    source: "mock",
  },
  {
    id: "mock-course-ml",
    title: "Machine Learning Foundations",
    host: "Institute of Applied Computing",
    type: "course",
    description:
      "A ten-week cohort course on supervised learning, model evaluation and deployment basics, with weekly graded notebooks.",
    skills: ["python", "statistics", "machine-learning", "numpy"],
    domains: ["artificial-intelligence", "data-science"],
    eligibility: ["undergraduate", "graduate"],
    levels: ["intermediate", "advanced"],
    mode: "remote",
    location: "Live online",
    starts_at: daysFromNow(28),
    deadline_at: daysFromNow(21),
    url: "https://example.com/ml-foundations",
    prize: null,
    certificate: true,
    source: "mock",
  },
  {
    id: "mock-workshop-cloud",
    title: "Hands-on Cloud Deployment Workshop",
    host: "DevOps Student Chapter",
    type: "workshop",
    description:
      "A single-day practical workshop: containerise an app, push it to a registry and deploy it with a managed service. Laptops required.",
    skills: ["docker", "linux", "git", "cloud"],
    domains: ["devops", "software-development"],
    eligibility: ["undergraduate", "graduate"],
    levels: ["intermediate"],
    mode: "onsite",
    location: "Delhi, India",
    starts_at: daysFromNow(14),
    deadline_at: daysFromNow(7),
    url: "https://example.com/cloud-workshop",
    prize: null,
    certificate: true,
    source: "mock",
  },
  {
    id: "mock-workshop-portfolio",
    title: "Portfolio & Interview Prep Workshop",
    host: "SkillScout Community",
    type: "workshop",
    description:
      "Two evening sessions on structuring a student portfolio, writing project case studies, and answering behavioural interview questions.",
    skills: ["communication", "portfolio", "interviewing"],
    domains: ["career"],
    eligibility: ["high-school", "undergraduate", "no-experience"],
    levels: ["beginner"],
    mode: "remote",
    location: "Online",
    starts_at: daysFromNow(10),
    deadline_at: daysFromNow(5),
    url: "https://example.com/portfolio-workshop",
    prize: null,
    certificate: true,
    source: "mock",
  },
  {
    id: "mock-comp-case",
    title: "National Product Case Challenge",
    host: "Meridian Business School",
    type: "competition",
    description:
      "Teams of three analyse a real product problem and pitch a go-to-market plan. Finalists present to industry judges in the national round.",
    skills: ["product-management", "research", "presentation", "analytics"],
    domains: ["product", "business"],
    eligibility: ["undergraduate", "graduate", "team-based"],
    levels: ["intermediate", "advanced"],
    mode: "hybrid",
    location: "Mumbai, India",
    starts_at: daysFromNow(40),
    deadline_at: daysFromNow(16),
    url: "https://example.com/case-challenge",
    prize: "₹2,50,000 pool",
    certificate: true,
    source: "mock",
  },
  {
    id: "mock-comp-datathon",
    title: "Open Datathon: Urban Mobility",
    host: "CityData Foundation",
    type: "competition",
    description:
      "Public transit datasets, one week, one leaderboard. Individual or team entries welcome; starter notebooks provided for newcomers.",
    skills: ["python", "data-science", "sql", "machine-learning"],
    domains: ["data-science", "social-impact"],
    eligibility: ["undergraduate", "graduate", "individual", "team-based"],
    levels: ["beginner", "intermediate", "advanced"],
    mode: "remote",
    location: "Remote",
    starts_at: daysFromNow(18),
    deadline_at: daysFromNow(11),
    url: "https://example.com/urban-datathon",
    prize: "$2,000 + internship interviews",
    certificate: true,
    source: "mock",
  },
  {
    id: "mock-mentorship-women",
    title: "Women in Tech Mentorship Cohort",
    host: "Elevate Network",
    type: "mentorship",
    description:
      "A three-month mentorship pairing students with engineers and designers in industry. Fortnightly one-to-one calls plus a group learning track.",
    skills: ["communication", "career-planning", "software-development"],
    domains: ["career", "software-development"],
    eligibility: ["undergraduate", "graduate", "recent-grad"],
    levels: ["beginner", "intermediate"],
    mode: "remote",
    location: "Remote",
    starts_at: daysFromNow(35),
    deadline_at: daysFromNow(23),
    url: "https://example.com/elevate-mentorship",
    prize: null,
    certificate: true,
    source: "mock",
  },
  {
    id: "mock-grant-research",
    title: "Undergraduate Research Micro-Grant",
    host: "OpenScience Fund",
    type: "grant",
    description:
      "Micro-grants of up to $1,500 for undergraduate research projects in computing, climate or health. Two-page proposal, rolling review.",
    skills: ["research", "writing", "data-science"],
    domains: ["research", "climate-tech", "healthcare"],
    eligibility: ["undergraduate", "individual"],
    levels: ["intermediate", "advanced"],
    mode: "remote",
    location: "Global",
    starts_at: null,
    deadline_at: daysFromNow(48),
    url: "https://example.com/research-grant",
    prize: "Up to $1,500",
    certificate: false,
    source: "mock",
  },
];
