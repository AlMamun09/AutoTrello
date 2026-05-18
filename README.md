# AutoTrello

> Turn messy specs into polished Kanban boards — entirely in your browser.

AutoTrello is a **local-first, privacy-focused** project management tool that transforms documents (SRS, business briefs, course plans, meeting notes) into structured Kanban backlogs using AI. All data stays in your browser. No accounts, no servers, no tracking.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Local First](https://img.shields.io/badge/Data-Local--First-green)]()
[![AI Powered](https://img.shields.io/badge/AI-Backlog--Gen-orange)]()
[![React 19](https://img.shields.io/badge/React-19-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)]()

## ✨ Features

- **AI Backlog Generation** — Upload PDF, DOCX, TXT, or Markdown files (or paste text) and get a complete Kanban backlog with tasks, priorities, labels, and subtasks in seconds.
- **100% Local-First** — All project data lives in your browser's IndexedDB. No cloud database, no authentication, no telemetry.
- **Interactive Kanban Board** — Drag-and-drop cards between columns with real-time persistence.
- **Workflow Templates** — Pre-built boards for Software Development, HR, CRM, Marketing, Operations, Design, Small Business, and Education.
- **AI Board Assistant** — Chat with your board to spot gaps, suggest tasks, or reorganize priorities.
- **Trello Sync** — Push your entire backlog to a real Trello board with lists, cards, checklists, and colored labels — one click.
- **Import / Export** — Back up or share projects as JSON files.
- **Bring Your Own Key** — Connect to any OpenAI-compatible API (OpenAI, OpenRouter, Groq, LM Studio, vLLM, HuggingFace).

## 📸 Screenshots

> *Add screenshots here once available.*

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| State & Storage | IndexedDB (`idb`) + Zustand |
| Drag & Drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| AI Integration | OpenAI-compatible API (BYOK) |
| Document Parsing | `pdfjs-dist` + `mammoth` |
| Routing | React Router v7 |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm (or pnpm/yarn)
- An API key from an OpenAI-compatible provider (OpenAI, OpenRouter, Groq, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/AlMamun09/AutoTrello.git
cd AutoTrello

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open at `http://localhost:5173`.

### Configuration

1. Click **Settings** in the sidebar.
2. Enter your **AI Provider** details:
   - **Base URL** — e.g., `https://api.openai.com/v1`
   - **API Key** — your provider's API key
   - **Model** — e.g., `gpt-4o`, `llama-3-70b`
3. *(Optional)* Add **Trello API Key** and **Token** for board sync.

That's it. No sign-up, no server setup.

## 📁 Project Structure

```
src/
├── components/
│   ├── board/          # Kanban board, task cards, AI chat
│   ├── projects/       # Project list, new project form, generation modal
│   ├── settings/       # Settings panel (AI + Trello config)
│   └── ui/             # Reusable UI components (buttons, selects, toasts)
├── lib/
│   ├── ai.ts           # AI API calls, backlog generation, board assistant
│   ├── db.ts           # IndexedDB schema and CRUD operations
│   ├── templates.ts    # Workflow template definitions and prompts
│   ├── trello.ts       # Trello API integration
│   ├── parser.ts       # Document parsing (PDF, DOCX, TXT, MD)
│   └── export.ts       # JSON import/export utilities
└── App.tsx             # Router and layout
```

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/AutoTrello.git
cd AutoTrello

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes, then commit
git commit -m "feat: add your feature description"

# Push and open a Pull Request
git push origin feature/your-feature-name
```

### Good First Contributions

- **UI/UX** — Refine dark mode, add animations, improve mobile responsiveness
- **Templates** — Add new industry-specific workflows in `src/lib/templates.ts`
- **Integrations** — Add support for GitHub Issues, Jira, Notion, or Linear
- **AI Prompts** — Improve backlog generation quality or agent capabilities
- **Accessibility** — Add keyboard navigation, screen reader support, focus management
- **Documentation** — Improve README, add screenshots, write guides

### Development Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔮 Roadmap

- [ ] Multi-board dashboards and cross-project views
- [ ] P2P board sharing via WebRTC (no server required)
- [ ] Bi-directional sync with GitHub Issues, GitLab, Jira
- [ ] AI-powered sprint planning and effort estimation
- [ ] PWA support for offline mobile use
- [ ] Custom column creation and board customization
- [ ] Activity log and undo/redo for board changes

## 📜 License

This project is open source under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Trello](https://trello.com) for inspiring the Kanban experience
- [OpenAI](https://openai.com) and community for accessible AI APIs
- [dnd-kit](https://dndkit.com) for excellent drag-and-drop primitives
- All contributors who help make this project better

---

*Built with ❤️ for privacy-conscious teams and developers.*
