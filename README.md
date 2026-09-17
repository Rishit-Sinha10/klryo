
# klyro

> AI-powered code editor in your browser. Write, run, debug, and ship code across 80+ languages with AI assistance.
> ![License](https://img.shields.io/badge/license-MIT-blue)
> ![Status](https://img.shields.io/badge/status-v0.1-orange)

---
## Overview

klyro is a full-stack web-based code editor that combines a VS Code-like editing experience with AI-driven code generation, real-time code execution, and persistent chat history.

- **AI Code Generation** -- Generate, autocomplete, and debug code via Groq AI
- **Code Execution** -- Run code in 80+ languages instantly via Judge0
- **Monaco Editor** -- The same editor that powers VS Code
- **Project Management** -- Multi-file projects with persistent storage
- **Chat History** -- Full conversation history with context preservation
- **Authentication** -- OAuth, email, and MFA via Clerk

---

## Tech Stack

### Frontend

| Technology           | Purpose                   |
| -------------------- | ------------------------- |
| React 19.2           | UI framework              |
| Vite 7.3             | Build tool and dev server |
| Tailwind CSS 4.2     | Utility-first styling     |
| Monaco Editor 4.7    | Code editor               |
| React Router 7.13    | Client-side routing       |
| Clerk 5.61           | Authentication            |
| Framer Motion 12.42  | Animations                |
| Lucide React 0.577   | Icons                     |
| Axios 1.13           | HTTP client               |
| Vercel Analytics 2.0 | Page analytics            |
| Sentry 10.74         | Error tracking            |

### Backend

| Technology             | Purpose          |
| ---------------------- | ---------------- |
| Node.js 18+            | Runtime          |
| Express 4.18           | Web framework    |
| MongoDB + Mongoose 9.3 | Database         |
| Clerk Express 2.0      | Auth middleware  |
| Groq SDK 1.1           | AI code analysis |
| Prettier 3.9           | Code formatting  |

### External APIs

- **Judge0** -- Code execution and compilation
- **Groq AI** -- LLM for code analysis and generation
- **Clerk** -- Authentication and user management

---
## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)
- Accounts for Clerk, Groq, and Judge0

### 1. Clone

```bash
git clone https://github.com/Rishit-Sinha10/klyro.git
cd klyro
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env` with your keys:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/klyro
CLERK_API_KEY=your_clerk_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
JUDGE0_URL=http://localhost:2358
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Fill in `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_CODE_EXECUTION=true
```

```bash
npm run dev
```

### 4. Open

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

---

## Project Structure

```
klyro/
├── architecture-sketch.png
├── backend/
│   ├── controller/
│   │   ├── ai.controller.js           # AI code analysis/generation
│   │   ├── chat.controller.js          # Chat CRUD and messages
│   │   ├── code.controller.js          # Code execution
│   │   ├── codeHistory.controller.js   # Execution history
│   │   ├── debug.controller.js         # AI debugging
│   │   ├── edit.controller.js          # Code editing
│   │   ├── format.controller.js        # Prettier formatting
│   │   ├── gemini.controller.js        # AI analysis (Groq)
│   │   ├── languages.controller.js     # Supported languages
│   │   ├── project.controller.js       # Project CRUD
│   │   └── upload.controller.js        # File upload
│   ├── middleware/
│   │   └── auth.middleware.js          # Clerk auth verification
│   ├── model/
│   │   ├── chat.model.js              # Chat schema
│   │   ├── code.model.js              # Code/execution schema
│   │   └── project.model.js           # Project schema
│   ├── route/
│   │   ├── ai.route.js
│   │   ├── chat.route.js
│   │   ├── code.route.js
│   │   ├── codeHistory.route.js
│   │   ├── debug.route.js
│   │   ├── edit.route.js
│   │   ├── format.route.js
│   │   ├── project.route.js
│   │   └── upload.route.js
│   ├── app.js
│   ├── index.js
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/                     # AI chat interface
│   │   │   ├── chat/                   # Chat windows and messages
│   │   │   ├── common/                 # Shared UI (navbar, sidebar, cards)
│   │   │   ├── dashboard/              # Dashboard layout and stats
│   │   │   ├── editor/                 # Monaco editor, file explorer, terminal
│   │   │   ├── layout/                 # Layout components
│   │   │   ├── pages/                  # Page components
│   │   │   │   ├── us.jsx              # Landing page
│   │   │   │   ├── Documentation.jsx   # /docs
│   │   │   │   ├── Security.jsx        # /security
│   │   │   │   ├── Changelog.jsx       # /changelog
│   │   │   │   ├── PrivacyPolicy.jsx   # /privacy
│   │   │   │   ├── TermsOfService.jsx  # /terms
│   │   │   │   ├── Settings.jsx
│   │   │   │   ├── Templates.jsx
│   │   │   │   └── project.jsx
│   │   │   ├── profile/
│   │   │   └── ui/                     # Reusable UI primitives
│   │   ├── context/                    # React context (auth, theme, toast)
│   │   ├── hooks/                      # Custom hooks
│   │   ├── pages/                      # Route-level page components
│   │   ├── services/                   # API client modules
│   │   ├── lib/                        # Utilities
│   │   ├── App.jsx                     # Route definitions
│   │   └── main.jsx                    # App entry point
│   ├── public/                         # Static assets
│   ├── vercel.json                     # SPA rewrite rules
│   └── .env.example
│
└── README.md
```

---

## Routes

### Public

| Path              | Page                 |
| ----------------- | -------------------- |
| `/`               | Landing page         |
| `/login`          | Clerk authentication |
| `/docs`           | Documentation        |
| `/security`       | Security policy      |
| `/changelog`      | Release changelog    |
| `/privacy`        | Privacy policy       |
| `/terms`          | Terms of service     |
| `/share/:shareId` | Shared project view  |

### Protected (require auth)

| Path          | Page              |
| ------------- | ----------------- |
| `/dashboard`  | Dashboard         |
| `/projects`   | Project list      |
| `/editor/:id` | Code editor       |
| `/settings`   | User settings     |
| `/chat`       | AI chat           |
| `/chat/:id`   | Chat conversation |
| `/history`    | Chat history      |
| `/runs`       | Execution history |
| `/templates`  | Code templates    |

---

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy
   The `vercel.json` handles SPA rewrites automatically.

### Backend

Deploy to any Node.js host (Render, Railway, Fly.io, etc.):

```bash
npm install
npm start
```

Set all environment variables in your hosting dashboard and update `FRONTEND_URL` to your deployed frontend domain.

### MongoDB Atlas

1. Create a cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user
3. Whitelist your server IP (or `0.0.0.0/0` for dev)
4. Copy the connection string to `MONGODB_URI`

---

## Contributing

1. Check [Issues](https://github.com/Rishit-Sinha10/klyro/issues) for open tasks
2. Fork the repo and create a branch: `git checkout -b feature/your-feature`
3. Install deps in both `frontend/` and `backend/`
4. Make your changes
5. Lint: `npm run lint` (frontend)
6. Commit with a clear message: `feat: add AI chat feature`
7. Open a PR with a description and link to related issues

---

## Author

- **Rishit Sinha** -- [GitHub](https://github.com/Rishit-Sinha10)

---

## License

ISC
