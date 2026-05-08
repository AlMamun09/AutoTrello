import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface Project {
  id: string;
  name: string;
  template: string;
  created_at: string;
  updated_at: string;
  source_document_name?: string;
  custom_columns?: string[];
}

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  priority: Priority;
  column: string;
  subtasks: string[];
  labels: string[];
  assignee?: string;
  due_date?: string;
  start_date?: string;
  estimate?: string;
  cover_color?: string;
  attachments?: string[];
  comments?: string[];
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

interface AutoTrelloDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
  };
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-project': string };
  };
}

let dbPromise: Promise<IDBPDatabase<AutoTrelloDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<AutoTrelloDB>('autotrello-db', 1, {
      upgrade(db) {
        db.createObjectStore('projects', { keyPath: 'id' });
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-project', 'project_id');
      },
    });
  }
  return dbPromise;
}

export async function getProjects() {
  const db = await initDB();
  return db.getAll('projects');
}

export async function getProject(id: string) {
  const db = await initDB();
  return db.get('projects', id);
}

export async function saveProject(project: Project) {
  const db = await initDB();
  await db.put('projects', project);
}

export async function deleteProject(id: string) {
  const db = await initDB();
  const tx = db.transaction(['projects', 'tasks'], 'readwrite');
  await tx.objectStore('projects').delete(id);
  
  // Also delete associated tasks
  const taskStore = tx.objectStore('tasks');
  const index = taskStore.index('by-project');
  let cursor = await index.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function getTasks(projectId: string) {
  const db = await initDB();
  return db.getAllFromIndex('tasks', 'by-project', projectId);
}

export async function saveTask(task: Task) {
  const db = await initDB();
  await db.put('tasks', task);
}

export async function deleteTask(id: string) {
  const db = await initDB();
  await db.delete('tasks', id);
}
