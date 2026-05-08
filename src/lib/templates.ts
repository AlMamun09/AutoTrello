export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  columns: string[];
  systemPrompt: string;
}

export const TEMPLATES: Record<string, ProjectTemplate> = {
  sdlc: {
    id: 'sdlc',
    name: 'Software Development (SDLC)',
    description: 'Standard Agile software development lifecycle.',
    columns: ['Backlog', 'To Do', 'In Progress', 'In Review', 'Testing', 'Done'],
    systemPrompt: `You are an expert Agile Project Manager and Technical Lead.
Your goal is to parse the provided Software Requirements Specification (SRS) or business document and extract a structured product backlog.
Group the tasks logically. For each task, provide a clear title, description, priority (Critical, High, Medium, Low), the most appropriate workflow stage/column from this exact list: [Backlog, To Do, In Progress, In Review, Testing, Done], a list of subtasks (if applicable), and labels.`,
  },
  hr: {
    id: 'hr',
    name: 'Human Resources (HR)',
    description: 'Recruitment and employee onboarding pipeline.',
    columns: ['Sourcing', 'Screening', 'Interviewing', 'Offer', 'Onboarding', 'Completed'],
    systemPrompt: `You are an expert HR Manager.
Your goal is to parse the provided document and extract a structured HR process backlog.
For each item, provide a clear title, description, priority (Critical, High, Medium, Low), the most appropriate workflow stage/column from this exact list: [Sourcing, Screening, Interviewing, Offer, Onboarding, Completed], subtasks, and labels.`,
  },
  crm: {
    id: 'crm',
    name: 'Sales CRM',
    description: 'Sales pipeline and lead management.',
    columns: ['Leads', 'Contacted', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'],
    systemPrompt: `You are an expert Sales Manager.
Your goal is to parse the provided document and extract a structured CRM and sales pipeline backlog.
For each item, provide a clear title, description, priority (Critical, High, Medium, Low), the most appropriate workflow stage/column from this exact list: [Leads, Contacted, Proposal Sent, Negotiation, Closed Won, Closed Lost], subtasks, and labels.`,
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Campaigns',
    description: 'Marketing content and campaign planning.',
    columns: ['Ideas', 'Planned', 'In Progress', 'Review', 'Published'],
    systemPrompt: `You are an expert Marketing Director.
Your goal is to parse the provided document and extract a structured marketing campaign backlog.
For each item, provide a clear title, description, priority (Critical, High, Medium, Low), the most appropriate workflow stage/column from this exact list: [Ideas, Planned, In Progress, Review, Published], subtasks, and labels.`,
  },
  operations: {
    id: 'operations',
    name: 'Operations',
    description: 'General business operations and logistics.',
    columns: ['To Do', 'In Progress', 'Blocked', 'Review', 'Done'],
    systemPrompt: `You are an expert Operations Manager.
Your goal is to parse the provided document and extract a structured operations task backlog.
For each item, provide a clear title, description, priority (Critical, High, Medium, Low), the most appropriate workflow stage/column from this exact list: [To Do, In Progress, Blocked, Review, Done], subtasks, and labels.`,
  },
  design: {
    id: 'design',
    name: 'Design',
    description: 'Creative design and asset production.',
    columns: ['Backlog', 'Wireframing', 'Prototyping', 'Design Review', 'Handoff'],
    systemPrompt: `You are an expert Design Lead.
Your goal is to parse the provided document and extract a structured design task backlog.
For each item, provide a clear title, description, priority (Critical, High, Medium, Low), the most appropriate workflow stage/column from this exact list: [Backlog, Wireframing, Prototyping, Design Review, Handoff], subtasks, and labels.`,
  },
  smallbiz: {
    id: 'smallbiz',
    name: 'Small Business Management',
    description: 'Manage tasks for running a small business.',
    columns: ['Ideas', 'To Do', 'In Progress', 'Completed'],
    systemPrompt: `You are an expert Business Consultant.
Your goal is to parse the provided document and extract a structured business management backlog.
For each item, provide a clear title, description, priority (Critical, High, Medium, Low), the most appropriate workflow stage/column from this exact list: [Ideas, To Do, In Progress, Completed], subtasks, and labels.`,
  },
  education: {
    id: 'education',
    name: 'Education / Course Planning',
    description: 'Curriculum and course material planning.',
    columns: ['Research', 'Drafting', 'Review', 'Published'],
    systemPrompt: `You are an expert Educator and Curriculum Designer.
Your goal is to parse the provided document and extract a structured educational content backlog.
For each item, provide a clear title, description, priority (Critical, High, Medium, Low), the most appropriate workflow stage/column from this exact list: [Research, Drafting, Review, Published], subtasks, and labels.`,
  }
};
