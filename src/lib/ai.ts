import { getSettings } from './settings';
import type { ProjectTemplate } from './templates';
import type { Project, Task } from './db';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type GeneratedTask = Pick<Task, 'title' | 'description' | 'priority' | 'column' | 'subtasks' | 'labels' | 'assignee' | 'due_date' | 'start_date' | 'estimate'>;
type JsonObject = Record<string, unknown>;

export type GeneratedBacklog = {
  columns: string[];
  tasks: Partial<GeneratedTask>[];
};

export type BoardAgentAction =
  | {
      type: 'create_task';
      task: Partial<GeneratedTask> & Pick<Task, 'title'> & Partial<Pick<Task, 'assignee' | 'due_date' | 'start_date' | 'estimate' | 'cover_color' | 'attachments' | 'comments'>>;
    }
  | {
      type: 'update_task';
      task_id: string;
      patch: Partial<Omit<Task, 'id' | 'project_id' | 'created_at'>>;
    }
  | {
      type: 'delete_task';
      task_id: string;
    };

export type BoardAgentResult = {
  reply: string;
  actions: BoardAgentAction[];
};

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
const FULL_DOCUMENT_LIMIT = 70000;
const RETRY_DOCUMENT_LIMIT = 28000;
const ROUTER_DOCUMENT_LIMIT = 16000;
const AI_REQUEST_TIMEOUT_MS = 180000;
type BacklogPayloadMode = 'full' | 'compact' | 'router';

function normalizePriority(value: unknown): Task['priority'] {
  return typeof value === 'string' && PRIORITIES.includes(value as Task['priority'])
    ? value as Task['priority']
    : 'Medium';
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeColumns(value: unknown, fallback: string[]) {
  const columns = normalizeStringArray(value)
    .map(column => column.replace(/\s+/g, ' ').trim())
    .filter((column, index, list) => list.indexOf(column) === index)
    .slice(0, 12);

  return columns.length >= 2 ? columns : fallback;
}

function normalizeGeneratedTask(task: Partial<GeneratedTask>, columns: string[]): Partial<GeneratedTask> {
  const column = typeof task.column === 'string' && columns.includes(task.column)
    ? task.column
    : columns[1] ?? columns[0];

  return {
    title: typeof task.title === 'string' && task.title.trim() ? task.title.trim() : 'Untitled',
    description: typeof task.description === 'string' ? task.description.trim() : '',
    priority: normalizePriority(task.priority),
    column,
    subtasks: normalizeStringArray(task.subtasks),
    labels: normalizeStringArray(task.labels).slice(0, 5),
    assignee: typeof task.assignee === 'string' ? task.assignee.trim() : '',
    due_date: typeof task.due_date === 'string' ? task.due_date.trim() : '',
    start_date: typeof task.start_date === 'string' ? task.start_date.trim() : '',
    estimate: typeof task.estimate === 'string' ? task.estimate.trim() : '',
  };
}

function getAiUrl(baseUrl: string) {
  let normalized = baseUrl.trim().replace(/\/$/, '');

  if (!normalized) normalized = 'https://api.openai.com/v1';
  if (normalized === 'https://api.groq.com') normalized = 'https://api.groq.com/openai/v1';
  else if (normalized === 'https://api.openai.com') normalized = 'https://api.openai.com/v1';
  else if (normalized === 'https://openrouter.ai/api') normalized = 'https://openrouter.ai/api/v1';
  else if (normalized === 'http://localhost:1234') normalized = 'http://localhost:1234/v1';
  else if (normalized === 'https://opencode.ai') normalized = 'https://opencode.ai/zen/v1';
  else if (normalized === 'https://opencode.ai/zen') normalized = 'https://opencode.ai/zen/v1';

  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost' &&
    normalized.startsWith('https://router.huggingface.co')
  ) {
    const routerPath = normalized.replace('https://router.huggingface.co', '');
    return `/api/huggingface${routerPath.endsWith('/chat/completions') ? routerPath : `${routerPath}/chat/completions`}`;
  }

  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost' &&
    normalized.startsWith('https://opencode.ai')
  ) {
    const openCodePath = normalized.replace('https://opencode.ai', '');
    return `/api/opencode${openCodePath}`;
  }

  return normalized.endsWith('/chat/completions')
    ? normalized
    : `${normalized}/chat/completions`;
}

function validateBaseUrl(baseUrl: string): string | null {
  const trimmed = baseUrl.trim();
  if (!trimmed) return null;
  
  const lower = trimmed.toLowerCase();
  
  // Allow opencode.ai as a valid AI provider
  const allowedDomains = [
    'opencode.ai',
    'api.openai.com',
    'api.groq.com',
    'openrouter.ai',
    'router.huggingface.co',
    'huggingface.co',
    'api.anthropic.com',
    'api.cohere.ai',
    'localhost',
    '127.0.0.1',
  ];
  
  const isAllowed = allowedDomains.some(domain => lower.includes(domain));
  
  if (!isAllowed) {
    return `Base URL "${trimmed}" does not match a known AI provider. Verify the URL is correct, or use one of:
- https://api.openai.com/v1 (OpenAI)
- https://api.groq.com/openai/v1 (Groq)
- https://openrouter.ai/api/v1 (OpenRouter)
- https://opencode.ai/zen/v1/chat/completions (OpenCode)
- http://localhost:1234/v1 (LM Studio)`;
  }
  
  try {
    new URL(trimmed);
    return null;
  } catch {
    return `Invalid Base URL format: "${trimmed}". Must be a valid URL like https://api.openai.com/v1`;
  }
}

function parseApiError(raw: string, status: number): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return `AI API Error (${status}): ${raw || 'No response body'}`;
  }

  const obj = parsed as Record<string, unknown>;

  // OpenAI / OpenRouter / Groq style: { error: { message: "..." } }
  const errorObj = obj.error as Record<string, unknown> | undefined;
  if (errorObj && typeof errorObj.message === 'string') {
    return `AI API Error (${status}): ${errorObj.message}`;
  }

  // HuggingFace style: { error: "message" }
  if (typeof obj.error === 'string') {
    return `AI API Error (${status}): ${obj.error}`;
  }

  // Generic: try to find any "message" or "detail" field
  const message = obj.message ?? obj.detail ?? obj.reason;
  if (typeof message === 'string' && message.length > 0) {
    return `AI API Error (${status}): ${message}`;
  }

  // Fallback: show status and a short snippet
  const snippet = raw.length > 200 ? raw.slice(0, 200) + '…' : raw;
  return `AI API Error (${status}): ${snippet || 'No response body'}`;
}

function getNetworkErrorMessage(err: unknown, url: string) {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return `AI request timed out after ${Math.round(AI_REQUEST_TIMEOUT_MS / 1000)} seconds. Try a faster model or a shorter document.`;
  }

  if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
    let hostname = '';
    try {
      hostname = new URL(url).hostname;
    } catch {
      hostname = url;
    }

    return `Could not reach the AI provider at ${hostname}. This is usually caused by CORS, a blocked network request, an incorrect Base URL, or the provider closing a long-running request. Test the AI connection in Settings, then try a faster model or shorter SRS.`;
  }

  return err instanceof Error ? err.message : String(err);
}

function getAiHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function isHuggingFaceRouter(url: string) {
  return getAiHostname(url) === 'router.huggingface.co';
}

async function postChatCompletion(
  url: string,
  apiKey: string,
  payload: JsonObject,
  timeoutMs = AI_REQUEST_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      const readable = parseApiError(errText, response.status);
      throw new Error(readable);
    }

    return (await response.json()) as ChatCompletionResponse;
  } catch (err: unknown) {
    throw new Error(getNetworkErrorMessage(err, url), { cause: err });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function extractBacklogJson(raw: string, template: ProjectTemplate): { ok: true; value: GeneratedBacklog } | { ok: false; error: string } {
  // Step 1: Strip markdown code fences
  let cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // Step 2: Try to find a JSON object in the text
  // Look for the first '{' and last '}' to extract the JSON block
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return { ok: false, error: 'No JSON object found in the AI response.' };
  }

  const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err: unknown) {
    // If parsing fails, try to fix common JSON issues
    const fixed = tryFixJson(jsonStr);
    if (fixed) {
      try {
        parsed = JSON.parse(fixed);
      } catch {
        // Fall through to error
      }
    }
    if (!parsed || typeof parsed !== 'object') {
      const parseErr = err instanceof Error ? err.message : String(err);
      return { ok: false, error: `Invalid JSON: ${parseErr}. The AI returned malformed data.` };
    }
  }

  const obj = parsed as Record<string, unknown>;

  // Step 3: Validate required fields
  if (!Array.isArray(obj.tasks)) {
    // Check if tasks might be nested under a different key
    const taskKey = Object.keys(obj).find(k =>
      k.toLowerCase().includes('task') && Array.isArray(obj[k])
    );
    if (taskKey) {
      obj.tasks = obj[taskKey];
    } else {
      return { ok: false, error: `Response JSON is missing the "tasks" array. The AI returned: ${Object.keys(obj).join(', ') || '(empty object)'}` };
    }
  }

  // Step 4: Normalize and return
  const columns = normalizeColumns(obj.columns, template.columns);
  const tasks = (obj.tasks as Partial<GeneratedTask>[]).map(task => normalizeGeneratedTask(task, columns));

  return { ok: true, value: { columns, tasks } };
}

function tryFixJson(json: string): string | null {
  // Remove trailing commas before closing braces/brackets
  let fixed = json.replace(/,\s*([}\]])/g, '$1');

  // Escape unescaped newlines in string values
  fixed = fixed.replace(/(?<="[^"]*)\\n(?=[^"]*")/g, '\\\\n');

  // Replace single quotes with double quotes (risky but sometimes needed)
  // Only do this for simple cases to avoid breaking valid JSON
  return fixed;
}

function buildBacklogPayload(
  documentText: string,
  template: ProjectTemplate,
  model: string,
  mode: BacklogPayloadMode = 'full'
) {
  const documentLimit = mode === 'router'
    ? ROUTER_DOCUMENT_LIMIT
    : mode === 'compact'
      ? RETRY_DOCUMENT_LIMIT
      : FULL_DOCUMENT_LIMIT;
  const safeText = documentText.length > documentLimit
    ? documentText.substring(0, documentLimit) + '\n...[TRUNCATED]'
    : documentText;

  const taskRange = mode === 'router' ? '6-12' : mode === 'compact' ? '8-16' : '12-30';
  const subtaskRule = mode === 'router'
    ? 'Subtasks should be concise; use 2-4 checklist steps only when useful.'
    : 'Subtasks should be concrete checklist steps, not duplicates of the title.';

  const isAiGenerated = template.id === 'ai';
  const columnSchema = isAiGenerated
    ? '"column": "Must be exactly one of the generated columns"'
    : `"column": "Must be exactly one of: [${template.columns.join(', ')}]"`;
  const structureInstruction = isAiGenerated
    ? `- First generate "columns": 5-10 ordered Kanban list names that fit this exact document. Do not reuse a generic software workflow unless the document is clearly software work.
- Every task column must exactly match one of your generated columns.`
    : `- Every task column must exactly match one of these columns: [${template.columns.join(', ')}].`;

  const systemPrompt = `${template.systemPrompt}
  
Return a valid JSON object matching this schema EXACTLY:
{
  "columns": ["String"],
  "tasks": [
    {
      "title": "String",
      "description": "String",
      "priority": "Critical" | "High" | "Medium" | "Low",
      ${columnSchema},
      "subtasks": ["String"],
      "labels": ["String"],
      "assignee": "Optional string",
      "due_date": "Optional YYYY-MM-DD",
      "estimate": "Optional string like 2h or 3d"
    }
  ]
}

Quality rules:
${structureInstruction}
- Output tasks in planned start order from first work to last work. For software projects, setup/configuration/infrastructure and analysis work should appear before feature implementation, QA, release, and retrospective work.
- Distribute tasks across the workflow columns when the document has enough scope. Do not place everything into Product Backlog/Backlog unless the document only contains raw ideas with no delivery plan.
- Use at least 4 different columns when generating 10 or more tasks, including planning/backlog, ready/build, review/test, and done/release/improvement stages when those stages exist.
- Within each column, order cards top-to-bottom by when a business analyst, software analyst, or project lead would start them.
- Generate a useful first draft, usually ${taskRange} cards depending on document detail. Do not create vague category cards.
- Prefer one card per deliverable, feature, campaign, lesson, hiring step, sales activity, or operational outcome.
- Titles should start with a verb or clear noun phrase and be understandable on a Kanban card.
- Descriptions should state the expected outcome, key context, and acceptance/completion criteria in 1-3 sentences.
- ${subtaskRule}
- Labels should be short domain tags such as "frontend", "qa", "finance", "content", "hiring", or "urgent".
- Use "Critical" only for blockers, compliance/security risks, launch-critical work, or urgent customer/business impact.
- If a date is not present in the document, leave date fields empty.

Do not include markdown blocks or any other text. Output raw JSON only.`;

  const payload: JsonObject = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Please parse this document and generate the backlog:\n\n${safeText}` }
    ],
    temperature: 0.2,
    max_tokens: mode === 'router' ? 3200 : mode === 'compact' ? 5000 : 8000,
  };

  if (mode !== 'router') {
    payload.response_format = { type: 'json_object' };
  }

  return payload;
}

export async function generateBacklog(
  documentText: string,
  template: ProjectTemplate,
  onProgress?: (msg: string, percent: number) => void
): Promise<GeneratedBacklog> {
  const settings = getSettings();
  if (!settings.aiApiKey) {
    throw new Error('AI API Key is missing. Please configure it in Settings.');
  }

  const urlError = validateBaseUrl(settings.aiBaseUrl);
  if (urlError) throw new Error(urlError);

  const url = getAiUrl(settings.aiBaseUrl);
  const model = settings.aiModelName || 'gpt-4o-mini';
  const routerMode = isHuggingFaceRouter(url);
  const firstMode: BacklogPayloadMode = routerMode ? 'router' : 'full';
  const firstLimit = routerMode ? ROUTER_DOCUMENT_LIMIT : FULL_DOCUMENT_LIMIT;
  if (onProgress) {
    onProgress(`Sending ${Math.min(documentText.length, firstLimit).toLocaleString()} characters to AI provider...`, 10);
  }

  let data: ChatCompletionResponse;
  try {
    data = await postChatCompletion(url, settings.aiApiKey, buildBacklogPayload(documentText, template, model, firstMode));
  } catch (err: unknown) {
    if (routerMode) {
      throw new Error(
        `${err instanceof Error ? err.message : String(err)} Hugging Face Router accepted the short connection test, but closed the larger backlog request. Use a smaller SRS excerpt, switch to OpenRouter/OpenAI/Groq, or use a model/provider with longer request support.`,
        { cause: err }
      );
    }
    if (documentText.length <= RETRY_DOCUMENT_LIMIT) throw err;
    if (onProgress) onProgress('Initial AI request failed. Retrying with a compact SRS excerpt...', 15);
    data = await postChatCompletion(url, settings.aiApiKey, buildBacklogPayload(documentText, template, model, 'compact'));
  }

  if (onProgress) onProgress('Parsing AI response...', 75);
  let content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from AI API');
  }

  const parseResult = extractBacklogJson(content, template);
  if (parseResult.ok) {
    return parseResult.value;
  }

  // Retry with compact mode if full/router mode failed
  if (documentText.length > RETRY_DOCUMENT_LIMIT) {
    if (onProgress) onProgress('Response format error. Retrying with compact prompt...', 65);
    try {
      const retryData = await postChatCompletion(url, settings.aiApiKey, buildBacklogPayload(documentText, template, model, 'compact'));
      const retryContent = retryData.choices?.[0]?.message?.content;
      if (retryContent) {
        const retryResult = extractBacklogJson(retryContent, template);
        if (retryResult.ok) return retryResult.value;
        throw new Error(retryResult.error);
      }
    } catch (retryErr: unknown) {
      if (retryErr instanceof Error && retryErr.message.startsWith('Response format')) throw retryErr;
    }
  }

  throw new Error(`Failed to parse AI response: ${parseResult.error}`);
}

export async function testAiConnection(): Promise<string> {
  const settings = getSettings();
  if (!settings.aiApiKey) {
    throw new Error('AI API Key is missing. Please configure it in Settings.');
  }

  const urlError = validateBaseUrl(settings.aiBaseUrl);
  if (urlError) throw new Error(urlError);

  const payload = {
    model: settings.aiModelName || 'gpt-4o-mini',
    messages: [
      { role: 'user', content: 'Say "Hello, I am ready!" if you can read this.' }
    ],
    temperature: 0.1,
    max_tokens: 15
  };

  const data = await postChatCompletion(getAiUrl(settings.aiBaseUrl), settings.aiApiKey, payload, 30000);
  return data.choices?.[0]?.message?.content || 'Connected. The provider returned an empty test message, but the API endpoint responded.';
}

export async function chatWithBoard(
  history: { role: 'user' | 'assistant', content: string }[],
  project: Project,
  tasks: Task[],
  columns: string[] = []
): Promise<BoardAgentResult> {
  const settings = getSettings();
  if (!settings.aiApiKey) throw new Error('AI API Key is missing.');

  const urlError = validateBaseUrl(settings.aiBaseUrl);
  if (urlError) throw new Error(urlError);

  const safeColumns = columns.length ? columns : Array.from(new Set(tasks.map(t => t.column)));
  const columnCounts = safeColumns
    .map(column => `${column}: ${tasks.filter(task => task.column === column).length}`)
    .join(', ');
  const priorityCounts = PRIORITIES
    .map(priority => `${priority}: ${tasks.filter(task => task.priority === priority).length}`)
    .join(', ');

  const systemPrompt = `You are AutoTrello's AI Board Assistant. You help users improve their Kanban boards through analysis, optimization, and safe CRUD operations.

Project: "${project.name}"
Allowed columns, in workflow order: ${safeColumns.join(' | ')}
Column counts: ${columnCounts || 'none'}
Priority counts: ${priorityCounts || 'none'}

Current tasks:
${tasks.map(t => `- id=${t.id} | column=${t.column} | priority=${t.priority} | title=${t.title} | labels=${(t.labels || []).join(', ')} | subtasks=${(t.subtasks || []).length}`).join('\n')}

Return raw JSON only with this exact shape:
{
  "reply": "Concise human-readable response with grouped recommendations when helpful",
  "actions": [
    { "type": "create_task", "task": { "title": "Task title", "description": "", "priority": "Medium", "column": "${safeColumns[0] || 'Backlog'}", "subtasks": [], "labels": [], "assignee": "", "due_date": "", "estimate": "" } },
    { "type": "update_task", "task_id": "existing id", "patch": { "title": "New title", "column": "${safeColumns[0] || 'Backlog'}", "priority": "High", "subtasks": [], "labels": [] } },
    { "type": "delete_task", "task_id": "existing id" }
  ]
}

BOARD ANALYSIS RULES:
- When asked to analyze, check: column distribution (>40% in one column = bottleneck), priority balance (>30% Critical/High = unrealistic), label coverage, subtask quality
- Flag overloaded columns, empty stages, missing workflow steps, or tasks stuck without progress
- Identify dependencies and suggest execution order

TASK GENERATION RULES:
- Titles: Start with verb or concrete noun phrase, understandable on a Kanban card
- Descriptions: State expected outcome + acceptance criteria in 1-3 sentences
- Columns: Place in correct workflow stage, not just backlog. Setup/infra before features, features before QA, QA before release
- Priority: Use "Critical" only for blockers, compliance risks, or urgent business impact
- Labels: Add 1-3 domain-relevant labels (e.g., "frontend", "qa", "urgent")
- Subtasks: 2-5 concrete checklist steps for complex work, not duplicates of title

QUALITY RULES:
- Only include actions when user explicitly asks to create, update, move, label, prioritize, or delete
- Use existing task IDs only for updates/deletes. Never invent IDs
- Use exactly one of the allowed columns for any column assignment
- Preserve existing data - only patch fields the user asked to change
- Batch related changes together and explain reasoning in reply
- For questions only, return empty actions array
- For "next steps", recommend ordered plan and only create cards if explicitly asked
- Do not update or delete a task unless the target is unambiguous
`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history
  ];

  const payload = {
    model: settings.aiModelName || 'gpt-4o-mini',
    messages,
    temperature: 0.35,
    response_format: { type: 'json_object' },
  };

  const data = await postChatCompletion(getAiUrl(settings.aiBaseUrl), settings.aiApiKey, payload);
  const content = data.choices?.[0]?.message?.content || '';

  try {
    const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim()) as Partial<BoardAgentResult>;
    return {
      reply: parsed.reply || '',
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    };
  } catch {
    return { reply: content, actions: [] };
  }
}
