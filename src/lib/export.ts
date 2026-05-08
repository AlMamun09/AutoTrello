import { getProject, getTasks, saveProject, saveTask, type Project, type Task } from './db';

type ProjectExport = {
  version: 1;
  project: Project;
  tasks: Task[];
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

function isProjectExport(data: unknown): data is ProjectExport {
  if (!data || typeof data !== 'object') return false;

  const candidate = data as { version?: unknown; project?: unknown; tasks?: unknown };
  return candidate.version === 1 && !!candidate.project && Array.isArray(candidate.tasks);
}

export async function exportProject(projectId: string) {
  try {
    const project = await getProject(projectId);
    const tasks = await getTasks(projectId);
    if (!project) throw new Error("Project not found");

    const data = {
      version: 1,
      project,
      tasks
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autotrello_${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err: unknown) {
    console.error(err);
    alert(`Export failed: ${getErrorMessage(err)}`);
  }
}

export async function importProject(file: File) {
  const text = await file.text();
  const data: unknown = JSON.parse(text);

  if (!isProjectExport(data)) {
    throw new Error("Invalid AutoTrello export file format");
  }

  await saveProject(data.project);
  for (const t of data.tasks) {
    await saveTask(t);
  }
}
