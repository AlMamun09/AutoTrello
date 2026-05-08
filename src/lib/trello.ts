import { getSettings } from './settings';
import type { Project, Task } from './db';

export async function pushToTrello(project: Project, tasks: Task[], onProgress: (msg: string) => void) {
  const settings = getSettings();
  const { trelloApiKey, trelloToken } = settings;
  const key = trelloApiKey.trim();
  const token = trelloToken.trim();
  
  if (!key || !token) {
    throw new Error('Trello API Key or Token is missing.');
  }

  const baseUrl = 'https://api.trello.com/1';
  const auth = `key=${key}&token=${token}`;

  onProgress('Creating Trello board...');
  const boardRes = await fetch(`${baseUrl}/boards/?name=${encodeURIComponent(project.name)}&${auth}`, { method: 'POST' });
  if (!boardRes.ok) throw new Error('Failed to create Trello board');
  const board = await boardRes.json();
  
  // 1. Close default lists
  const listsRes = await fetch(`${baseUrl}/boards/${board.id}/lists?${auth}`);
  const existingLists = await listsRes.json();
  for (const list of existingLists) {
    await fetch(`${baseUrl}/lists/${list.id}/closed?value=true&${auth}`, { method: 'PUT' });
  }

  // 2. Create Lists in Order (based on tasks or template)
  onProgress('Setting up columns...');
  const uniqueColumns = Array.from(new Set(tasks.map(t => t.column)));
  const listIds: Record<string, string> = {};
  
  // Create lists one by one to preserve order
  for (const col of uniqueColumns) {
    const listRes = await fetch(`${baseUrl}/lists?name=${encodeURIComponent(col)}&idBoard=${board.id}&${auth}`, { method: 'POST' });
    const listData = await listRes.json();
    listIds[col] = listData.id;
  }

  // 3. Create Labels (Priority + Task Labels)
  onProgress('Creating labels...');
  const labelIds: Record<string, string> = {};
  
  // Priority Mapping
  const priorityColors: Record<string, string> = {
    'Critical': 'red',
    'High': 'orange',
    'Medium': 'yellow',
    'Low': 'green'
  };

  const allPriorities = Array.from(new Set(tasks.map(t => t.priority)));
  const allLabels = Array.from(new Set(tasks.flatMap(t => t.labels || [])));

  for (const prio of allPriorities) {
    const res = await fetch(`${baseUrl}/boards/${board.id}/labels?name=${encodeURIComponent(prio)}&color=${priorityColors[prio] || 'blue'}&${auth}`, { method: 'POST' });
    const data = await res.json();
    labelIds[`prio:${prio}`] = data.id;
  }

  for (const lbl of allLabels) {
    const res = await fetch(`${baseUrl}/boards/${board.id}/labels?name=${encodeURIComponent(lbl)}&color=sky&${auth}`, { method: 'POST' });
    const data = await res.json();
    labelIds[`lbl:${lbl}`] = data.id;
  }

  // 4. Push Tasks
  onProgress('Pushing tasks...');
  let count = 0;
  for (const task of tasks) {
    count++;
    onProgress(`Syncing card ${count}/${tasks.length}: ${task.title}`);
    
    const listId = listIds[task.column];
    if (!listId) continue;

    const taskLabelIds = [
      labelIds[`prio:${task.priority}`],
      ...(task.labels || []).map(l => labelIds[`lbl:${l}`])
    ].filter(Boolean);

    const cardRes = await fetch(`${baseUrl}/cards?idList=${listId}&name=${encodeURIComponent(task.title)}&desc=${encodeURIComponent(task.description || '')}&idLabels=${taskLabelIds.join(',')}&${auth}`, { method: 'POST' });
    const card = await cardRes.json();

    // 5. Add Checklists for Subtasks
    if (task.subtasks && task.subtasks.length > 0) {
      const ckRes = await fetch(`${baseUrl}/checklists?idCard=${card.id}&name=Subtasks&${auth}`, { method: 'POST' });
      const checklist = await ckRes.json();
      
      for (const item of task.subtasks) {
        await fetch(`${baseUrl}/checklists/${checklist.id}/checkItems?name=${encodeURIComponent(item)}&${auth}`, { method: 'POST' });
      }
    }

    // Small delay to prevent rate limiting if board is huge
    if (tasks.length > 30) await new Promise(r => setTimeout(r, 100));
  }

  onProgress('Sync completed successfully!');
  return board.url;
}

export async function testTrelloConnection(): Promise<string> {
  const settings = getSettings();
  if (!settings.trelloApiKey || !settings.trelloToken) {
    throw new Error('Trello API Key or Token is missing.');
  }

  const { trelloApiKey, trelloToken } = settings;
  const key = trelloApiKey.trim();
  const token = trelloToken.trim();
  
  if (!key || !token) {
    throw new Error('Trello API Key or Token is empty after trimming.');
  }

  const baseUrl = 'https://api.trello.com/1';

  const res = await fetch(`${baseUrl}/members/me?key=${key}&token=${token}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Trello connection failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return `Connected as ${data.fullName} (${data.username})`;
}
