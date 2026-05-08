# AutoTrello

AutoTrello is a local-first React application that turns project documents into structured Kanban backlogs and can sync those tasks into Trello. Upload an SRS, business brief, course plan, or similar document, choose a workflow template, generate tasks with an AI provider, then manage the result in a Trello-style board.

## Features

- Generate a project backlog from PDF, DOCX, TXT, Markdown, or CSV files.
- Manage tasks in a drag-and-drop Kanban board.
- Use built-in workflow templates for SDLC, HR, CRM, marketing, operations, design, small business, and education projects.
- Edit task title, description, priority, status column, labels, and subtasks.
- Export and import AutoTrello projects as JSON.
- Chat with an AI board assistant about the current project.
- Sync generated cards, checklists, and labels to Trello.
- Store settings and project data locally in the browser using IndexedDB/localStorage.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- dnd-kit
- IndexedDB via `idb`
- PDF parsing via `pdfjs-dist`
- DOCX parsing via `mammoth`
- OpenAI-compatible chat-completions API providers

## Requirements

- Node.js 20 or newer
- npm
- An AI provider API key for backlog generation
- Optional Trello API key and token for board sync

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

On Windows PowerShell, if `npm` is blocked by execution policy, use `npm.cmd` instead:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

## Configuration

Open the app settings panel and configure the AI provider:

- Base URL: OpenAI-compatible API endpoint, such as `https://api.openai.com/v1`, OpenRouter, Groq, or a local LM Studio endpoint.
- API Key: provider key used by the browser client.
- Model Name: the model used for backlog generation and chat.

For Trello sync, add:

- Trello API Key from `https://trello.com/app-key`
- Trello Token from the same Trello developer page

Because this is a browser-only app, API keys are stored in local browser storage. Use keys with appropriate limits and avoid sharing browser profiles that contain credentials.

## Project Workflow

1. Open the app and create a new project.
2. Upload a document such as an SRS, business spec, notes file, PDF, or DOCX.
3. Select a project template.
4. Generate the backlog with your configured AI provider.
5. Review, edit, and move tasks on the Kanban board.
6. Export the project as JSON or sync it to Trello.

## Repository Structure

```text
src/
  components/
    board/       Kanban board, task modal, AI chat panel
    projects/    project list and new project flow
    settings/    AI and Trello settings UI
    ui/          reusable UI primitives
  lib/
    ai.ts        AI provider requests
    db.ts        IndexedDB project/task persistence
    export.ts    JSON import/export helpers
    parser.ts    document parsing
    templates.ts workflow templates
    trello.ts    Trello sync integration
public/          static assets
```

## Data and Privacy

AutoTrello does not ship with a backend. Project data is stored in the user's browser, and uploaded documents are parsed client-side. Generated prompts and parsed document content are sent to the AI provider configured in settings. Trello sync sends project/task data to Trello only when explicitly triggered.

## Git Hygiene

The repository intentionally excludes:

- `node_modules/`
- production build output in `dist/`
- local environment files
- generated board export JSON files
- local mockup/prototype artifacts
- logs, coverage, cache files, and editor-specific files

## License

No license has been selected yet. Add a license before distributing or accepting external contributions.
