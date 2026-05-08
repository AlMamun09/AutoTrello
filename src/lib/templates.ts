export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  columns: string[];
  systemPrompt: string;
}

function buildSystemPrompt(role: string, outcome: string, columns: string[]) {
  return `${role}
Your goal is to parse the provided document and create a practical, board-ready backlog for ${outcome}.
Use only this exact workflow, matching column names character-for-character: [${columns.join(', ')}].
Create specific work cards, not vague categories. Prefer outcome-focused titles, concrete descriptions, realistic priorities, useful labels, and 2-6 checklist subtasks for complex work.
Treat columns as the planned execution flow, not only current status. Place each card in the list where that work naturally belongs in the delivery sequence. If the stage is unclear, use "${columns[1] ?? columns[0]}".`;
}

const SDLC_COLUMNS = [
  'Ideas & Requests',
  'Product Backlog',
  'Ready for Sprint',
  'Sprint Backlog',
  'In Progress',
  'Code Review',
  'QA / Testing',
  'Blocked',
  'Ready for Release',
  'Released / Done',
  'Bugs & Hotfixes',
  'Retrospective & Improvements',
];

const SMALL_BUSINESS_COLUMNS = [
  'Business Goals',
  'Ideas & Opportunities',
  'To Do',
  'This Week',
  'In Progress',
  'Waiting on Client / Vendor',
  'Finance & Payments',
  'Marketing Activities',
  'Completed',
  'Archived',
];

const EDUCATION_COLUMNS = [
  'Course Planning',
  'Study Materials',
  'Assignments To Do',
  'In Progress',
  'Revision',
  'Exams & Quizzes',
  'Group Projects',
  'Submitted',
  'Grades & Feedback',
  'Completed Topics',
];

const HR_COLUMNS = [
  'Hiring Requests',
  'Job Postings',
  'Applicants Received',
  'Screening',
  'Interviews Scheduled',
  'Final Evaluation',
  'Offer & Negotiation',
  'Onboarding',
  'Employee Engagement',
  'Closed Positions',
];

const MARKETING_COLUMNS = [
  'Marketing Goals',
  'Campaign Ideas',
  'Content Planning',
  'Content Creation',
  'Design Review',
  'Scheduled',
  'Running Campaigns',
  'Analytics & Performance',
  'Optimizations',
  'Completed Campaigns',
];

const CRM_COLUMNS = [
  'Leads',
  'Qualified Leads',
  'Discovery Calls',
  'Proposal Sent',
  'Negotiation',
  'Follow Up',
  'Won Deals',
  'Lost Deals',
  'Client Onboarding',
  'Customer Retention',
];

const OPERATIONS_COLUMNS = [
  'Requests & Tickets',
  'Planning',
  'Pending Approval',
  'In Progress',
  'Vendor Coordination',
  'Quality Check',
  'Blocked Issues',
  'Completed',
  'Reports & Documentation',
  'Continuous Improvement',
];

const DESIGN_COLUMNS = [
  'Design Requests',
  'Research & Inspiration',
  'Wireframes',
  'UI Design',
  'Internal Review',
  'Client Feedback',
  'Revisions',
  'Ready for Handoff',
  'Development Support',
  'Final Assets / Completed',
];

export const TEMPLATES: Record<string, ProjectTemplate> = {
  ai: {
    id: 'ai',
    name: 'AI Generated',
    description: 'AI decides the best workflow for the provided document.',
    columns: ['Backlog', 'Ready', 'In Progress', 'Review', 'Done'],
    systemPrompt: `You are an expert project operations architect.
Your goal is to parse the provided document, infer the project domain, design the best Kanban workflow for that specific work, and create a practical board-ready backlog.
Create specific work cards, not vague categories. Prefer outcome-focused titles, concrete descriptions, realistic priorities, useful labels, and 2-6 checklist subtasks for complex work.
When designing columns, use concise list names, order them from initial setup/planning to completion, and include specialist stages only when the document justifies them.`,
  },
  sdlc: {
    id: 'sdlc',
    name: 'Software Development (SDLC)',
    description: 'Standard Agile software development lifecycle.',
    columns: SDLC_COLUMNS,
    systemPrompt: buildSystemPrompt('You are an expert Agile Project Manager and Technical Lead.', 'software development, SDLC, and Agile delivery', SDLC_COLUMNS),
  },
  hr: {
    id: 'hr',
    name: 'Human Resources (HR)',
    description: 'Recruitment and employee onboarding pipeline.',
    columns: HR_COLUMNS,
    systemPrompt: buildSystemPrompt('You are an expert HR Manager.', 'human resources, hiring, onboarding, and employee operations', HR_COLUMNS),
  },
  crm: {
    id: 'crm',
    name: 'Sales CRM',
    description: 'Sales pipeline and lead management.',
    columns: CRM_COLUMNS,
    systemPrompt: buildSystemPrompt('You are an expert Sales Manager.', 'sales CRM, lead qualification, deals, and retention', CRM_COLUMNS),
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Campaigns',
    description: 'Marketing content and campaign planning.',
    columns: MARKETING_COLUMNS,
    systemPrompt: buildSystemPrompt('You are an expert Marketing Director.', 'marketing goals, campaigns, content, performance, and optimization', MARKETING_COLUMNS),
  },
  operations: {
    id: 'operations',
    name: 'Operations',
    description: 'General business operations and logistics.',
    columns: OPERATIONS_COLUMNS,
    systemPrompt: buildSystemPrompt('You are an expert Operations Manager.', 'business operations, tickets, approvals, vendors, quality, and reporting', OPERATIONS_COLUMNS),
  },
  design: {
    id: 'design',
    name: 'Design',
    description: 'Creative design and asset production.',
    columns: DESIGN_COLUMNS,
    systemPrompt: buildSystemPrompt('You are an expert Design Lead.', 'design research, UI/UX production, review, handoff, and asset completion', DESIGN_COLUMNS),
  },
  smallbiz: {
    id: 'smallbiz',
    name: 'Small Business Management',
    description: 'Manage tasks for running a small business.',
    columns: SMALL_BUSINESS_COLUMNS,
    systemPrompt: buildSystemPrompt('You are an expert Business Consultant.', 'small business goals, operations, finance, marketing, vendors, and completion tracking', SMALL_BUSINESS_COLUMNS),
  },
  education: {
    id: 'education',
    name: 'Education / Course Planning',
    description: 'Curriculum and course material planning.',
    columns: EDUCATION_COLUMNS,
    systemPrompt: buildSystemPrompt('You are an expert Educator and Curriculum Designer.', 'course planning, materials, assignments, exams, feedback, and completed topics', EDUCATION_COLUMNS),
  },
  business: {
    id: 'business',
    name: 'Small Business Management',
    description: 'Manage tasks for running a small business.',
    columns: SMALL_BUSINESS_COLUMNS,
    systemPrompt: buildSystemPrompt('You are an expert Business Consultant.', 'small business goals, operations, finance, marketing, vendors, and completion tracking', SMALL_BUSINESS_COLUMNS),
  },
  sales: {
    id: 'sales',
    name: 'Sales CRM',
    description: 'Sales pipeline and lead management.',
    columns: CRM_COLUMNS,
    systemPrompt: buildSystemPrompt('You are an expert Sales Manager.', 'sales CRM, lead qualification, deals, and retention', CRM_COLUMNS),
  }
};
