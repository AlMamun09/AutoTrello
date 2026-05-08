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

type GeneratedTask = Pick<Task, 'title' | 'description' | 'priority' | 'column' | 'subtasks' | 'labels'>;

export async function generateBacklog(
  documentText: string,
  template: ProjectTemplate,
  onProgress?: (msg: string) => void
): Promise<Partial<GeneratedTask>[]> {
  const settings = getSettings();
  if (!settings.aiApiKey) {
    throw new Error('AI API Key is missing. Please configure it in Settings.');
  }

  // Truncate document if too large
  const safeText = documentText.length > 100000 
    ? documentText.substring(0, 100000) + '\n...[TRUNCATED]' 
    : documentText;

  const systemPrompt = `${template.systemPrompt}
  
Return a valid JSON object matching this schema EXACTLY:
{
  "tasks": [
    {
      "title": "String",
      "description": "String",
      "priority": "Critical" | "High" | "Medium" | "Low",
      "column": "Must be exactly one of: [${template.columns.join(', ')}]",
      "subtasks": ["String"],
      "labels": ["String"]
    }
  ]
}
Do not include markdown blocks or any other text. Output raw JSON only.`;

  const payload = {
    model: settings.aiModelName || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Please parse this document and generate the backlog:\n\n${safeText}` }
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  };

  let baseUrl = settings.aiBaseUrl.replace(/\/$/, '');
  
  // Auto-correct legacy saved URLs that didn't include the v1 API path
  if (baseUrl === 'https://api.groq.com') baseUrl = 'https://api.groq.com/openai/v1';
  else if (baseUrl === 'https://api.openai.com') baseUrl = 'https://api.openai.com/v1';
  else if (baseUrl === 'https://openrouter.ai/api') baseUrl = 'https://openrouter.ai/api/v1';
  else if (baseUrl === 'http://localhost:1234') baseUrl = 'http://localhost:1234/v1';

  const url = baseUrl.endsWith('/chat/completions') 
    ? baseUrl 
    : `${baseUrl}/chat/completions`;
  if (onProgress) onProgress('Sending request to AI provider...');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.aiApiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API Error (${response.status}): ${errText}`);
  }

  if (onProgress) onProgress('Parsing AI response...');
  
  const data = (await response.json()) as ChatCompletionResponse;
  let content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('Empty response from AI API');
  }

  try {
    // Strip markdown formatting if AI still outputs it
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(content) as { tasks?: unknown };
    if (!Array.isArray(parsed.tasks)) {
      throw new Error('Response JSON is missing the "tasks" array.');
    }
    return parsed.tasks as Partial<GeneratedTask>[];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse JSON response: ${message}`, { cause: err });
  }
}

export async function testAiConnection(): Promise<string> {
  const settings = getSettings();
  if (!settings.aiApiKey) {
    throw new Error('AI API Key is missing. Please configure it in Settings.');
  }

  let baseUrl = settings.aiBaseUrl.replace(/\/$/, '');
  if (baseUrl === 'https://api.groq.com') baseUrl = 'https://api.groq.com/openai/v1';
  else if (baseUrl === 'https://api.openai.com') baseUrl = 'https://api.openai.com/v1';
  else if (baseUrl === 'https://openrouter.ai/api') baseUrl = 'https://openrouter.ai/api/v1';
  else if (baseUrl === 'http://localhost:1234') baseUrl = 'http://localhost:1234/v1';

  const url = baseUrl.endsWith('/chat/completions') 
    ? baseUrl 
    : `${baseUrl}/chat/completions`;

  const payload = {
    model: settings.aiModelName || 'gpt-4o-mini',
    messages: [
      { role: 'user', content: 'Say "Hello, I am ready!" if you can read this.' }
    ],
    temperature: 0.1,
    max_tokens: 15
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.aiApiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Connection failed (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  return data.choices?.[0]?.message?.content || 'Success, but no message returned.';
}

export async function chatWithBoard(
  history: { role: 'user' | 'assistant', content: string }[],
  project: Project,
  tasks: Task[]
): Promise<string> {
  const settings = getSettings();
  if (!settings.aiApiKey) throw new Error('AI API Key is missing.');

  let baseUrl = settings.aiBaseUrl.replace(/\/$/, '');
  if (baseUrl === 'https://api.groq.com') baseUrl = 'https://api.groq.com/openai/v1';
  else if (baseUrl === 'https://api.openai.com') baseUrl = 'https://api.openai.com/v1';
  else if (baseUrl === 'https://openrouter.ai/api') baseUrl = 'https://openrouter.ai/api/v1';
  else if (baseUrl === 'http://localhost:1234') baseUrl = 'http://localhost:1234/v1';

  const url = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;

  // Provide the current state of the board
  const systemPrompt = `You are an AI Agile Assistant in AutoTrello. 
You are chatting with the user about the project "${project.name}".
Current Tasks Summary:
${tasks.map(t => `- [${t.column}] (${t.priority}) ${t.title}`).join('\n')}

The user might ask you questions about the project state or how to improve things. Keep your answers concise, helpful, and formatted nicely in plain text or markdown.
`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history
  ];

  const payload = {
    model: settings.aiModelName || 'gpt-4o-mini',
    messages,
    temperature: 0.7,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.aiApiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`AI Error (${response.status})`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  return data.choices?.[0]?.message?.content || '';
}
