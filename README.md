# AutoTrello 🚀

AutoTrello is a local-first, privacy-focused React application that transforms project documents (SRS, business briefs, course plans) into structured Kanban backlogs. Using advanced AI, it drafts your board in seconds and provides seamless synchronization with Trello for production-ready project management.

![Premium UI](https://img.shields.io/badge/UI-Premium-blueviolet)
![Local First](https://img.shields.io/badge/Data-Local--First-green)
![AI Powered](https://img.shields.io/badge/AI-Backlog--Gen-orange)

## ✨ Features

- **AI Backlog Generation**: Upload PDF, DOCX, TXT, Markdown, or CSV files and watch the AI generate a complete set of tasks, epics, and subtasks.
- **Local-First Storage**: All your project data and API keys stay strictly in your browser (IndexedDB), ensuring maximum privacy.
- **Interactive Kanban Board**: Fully functional drag-and-drop interface with column-specific colors and "Quick Add" capabilities.
- **Premium Task Management**:
  - **Promote to Task**: Easily convert subtasks/checklist items into full-fledged tasks.
  - **Custom UI**: Beautiful Glassmorphism dropdowns for status and priority.
  - **Rich Metadata**: Track assignees, estimates, due dates, and attachments.
- **Workflow Templates**: Built-in specialized boards for SDLC, HR, CRM, Marketing, Operations, Design, Small Business, and Education.
- **AI Board Assistant**: Chat with your board to refine tasks, brainstorm subtasks, or reorganize your project.
- **Trello Synchronization**: Create Trello boards, lists, and cards (including checklists and labels) with one click.
- **Export/Import**: Save your work as JSON for backups or sharing.

## 🛠 Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (Modern CSS-first approach)
- **State & DB**: IndexedDB (via `idb`) + Zustand
- **Interactions**: `@dnd-kit` for robust drag-and-drop
- **AI**: OpenAI-compatible API integration (BYOK - Bring Your Own Key)
- **Parsing**: `pdfjs-dist` & `mammoth` for client-side document processing

## 🚀 Getting Started

1. **Clone and Install**:
   ```bash
   git clone https://github.com/AlMamun09/AutoTrello.git
   cd AutoTrello
   npm install
   ```
2. **Run Locally**:
   ```bash
   npm run dev
   ```
3. **Configure Settings**:
   - Open the sidebar and click the **Settings** gear.
   - Enter your **AI Provider** details (Base URL, API Key, Model).
   - (Optional) Enter your **Trello API Key and Token** for sync features.

## 🤝 Contributing

We welcome contributions from the community! Whether you are fixing a bug, adding a feature, or improving documentation, your help is appreciated.

1. **Fork the repository**.
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`).
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`).
4. **Push to the branch** (`git push origin feature/AmazingFeature`).
5. **Open a Pull Request**.

### Areas for Contribution:
- **UI/UX**: New themes, dark mode refinements, or micro-animations.
- **Templates**: New industry-specific workflow templates in `src/lib/templates.ts`.
- **Integrations**: Support for GitHub Issues, Jira, or Notion.
- **AI Capabilities**: Improving agent tools and backlog generation prompts.

## 🔮 Future Scope

- [ ] **Multi-Board Views**: Support for project-wide dashboards and cross-project task tracking.
- [ ] **P2P Collaboration**: Real-time board sharing using WebRTC/CRDTs without a central server.
- [ ] **Extended Integrations**: Bi-directional sync with GitHub, GitLab, and Jira.
- [ ] **AI-Powered Sprints**: Automated task estimation and sprint planning suggestions.
- [ ] **Chrome Extension**: Quick-capture tasks from any website directly into your AutoTrello backlog.
- [ ] **Mobile Support**: PWA optimization and native mobile wrappers for on-the-go management.

## 📜 License

This project is currently unlicensed. We are in the process of selecting an open-source license.

---
*Built with ❤️ for privacy-conscious project managers and developers.*
