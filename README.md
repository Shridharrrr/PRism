# PRism

PRism is an automated code review platform that analyzes GitHub pull requests using specialized AI agents. It flags security vulnerabilities, detects quality regressions, and participates directly in pull request conversations to help teams ship safer code faster.

---

## Overview

PRism integrates into your existing development workflow through GitHub webhooks. When a pull request opens or receives new commits, PRism pulls the diff, routes it through dedicated analysis agents, and publishes a structured review directly to GitHub. Developers can also reply to PRism's comments to ask follow-up questions, and the AI will respond in-thread with contextual answers and code suggestions.

### Core Capabilities

- Security Auditing: Catches SQL injection risks, cross-site scripting vulnerabilities, leaked credentials, and authorization gaps.
- Quality Inspection: Identifies code smells, anti-patterns, redundant operations, and missing error handlers.
- Unified PR Reviews: Posts GitHub reviews with appropriate statuses (Approve, Request Changes, or Comment).
- Interactive Threads: Engages directly when developers reply to review comments, clarifying rationale and proposing concrete fixes.
- Flexible Configuration: Adjust review strictness, comment tone, and ignore lists using a repository-level `.prism.yaml` file.
- Automated Approvals: Safely approves pull requests when no critical or high-severity issues are detected.

---

## Architecture & Tech Stack

- Frontend: Next.js (App Router), React, Tailwind CSS, Radix UI
- Backend: FastAPI, LangGraph, Google Gemini
- Task Queue: Celery, Redis
- Database & Auth: Supabase (PostgreSQL, GitHub OAuth)

```
PRism Architecture
------------------
GitHub Webhook -> FastAPI API -> Celery Task Queue (Redis)
                                      |
                                      v
                               LangGraph Workflow
                               (Gemini AI Agents)
                                      |
                                      +--> Post Review / Comment on GitHub
                                      +--> Persist Data in Supabase
                                      +--> Stream Updates to Next.js UI
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Docker (for local Redis)
- Supabase account and project
- Google AI (Gemini) API key
- GitHub App credentials

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/PRism.git
cd PRism
```

### Step 2: Start Redis

Start Redis in the background using Docker Compose:

```bash
docker compose up -d
```

Verify Redis is running on port 6379:

```bash
docker ps
```

### Step 3: Configure and Start the Backend

1. Navigate to the backend directory and set up a Python virtual environment:

```bash
cd backend
python -m venv venv
```

2. Activate the virtual environment:

- Windows (PowerShell):
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- Windows (CMD):
  ```cmd
  .\venv\Scripts\activate.bat
  ```
- macOS / Linux:
  ```bash
  source venv/bin/activate
  ```

3. Install the dependencies:

```bash
pip install -r requirements.txt
```

4. Create your `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Ensure the following variables are configured:

```ini
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_API_KEY=your_gemini_api_key
GITHUB_APP_ID=your_github_app_id
GITHUB_APP_PRIVATE_KEY_PATH=github_app.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret
REDIS_URL=redis://localhost:6379
PRISM_BOT_NAME=prismreview[bot]
```

5. Run the FastAPI development server:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### Step 4: Start the Celery Worker

In a separate terminal, activate the backend virtual environment and start the worker:

- Windows:
  ```powershell
  cd backend
  .\celery.bat
  ```
  *(Or manually: `celery -A celery_app worker --pool=solo --loglevel=info`)*

- macOS / Linux:
  ```bash
  cd backend
  source venv/bin/activate
  celery -A celery_app worker --loglevel=info
  ```

> Note for Windows users: Celery requires `--pool=solo` on Windows because standard process forking is not supported. The included `celery.bat` script handles this automatically.

### Step 5: Configure and Start the Frontend

In another terminal, set up the Next.js frontend:

```bash
cd frontend
npm install
```

Create a `.env` (or `.env.local`) file:

```ini
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

Start the frontend development server:

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Configuration via `.prism.yaml`

You can customize how PRism evaluates pull requests in each repository by creating a `.prism.yaml` file in the repository root.

```yaml
review:
  auto_approve_if_no_critical: true
  comment_on_every_file: false
  critical_threshold: 1
  tone: "professional" # Options: professional, friendly, concise
  include_code_suggestions: true
  include_explanations: true
  enable_interactive_responses: true
  response_wait_time: 2

ignore_patterns:
  - "*.test.js"
  - "*.spec.ts"
  - "**/__tests__/**"
  - "**/node_modules/**"
  - "**/dist/**"

focus_areas:
  - security
  - performance
  - best_practices
```

Refer to `.prism.yaml.example` for the full reference with comments.

---

## GitHub App Setup

To enable automated PR reviews and inline comment threads, configure your GitHub App with:

### Repository Permissions
- Pull requests: Read & Write
- Contents: Read
- Checks: Read & Write
- Issues: Read & Write

### Subscribed Events
- Pull request
- Pull request review
- Pull request review comment
- Issue comment

### Webhook URL
Point your GitHub App webhook to:
`https://your-public-url.com/api/webhooks/github` (or use a tunneling tool such as ngrok or cloudflared during development).

---

## Primary API Endpoints

- `GET /health` - Service health status
- `GET /health/db` - Supabase connectivity check
- `GET /health/redis` - Redis connectivity check
- `POST /api/webhooks/github` - Primary GitHub webhook receiver
- `POST /api/webhooks/github/comments` - Webhook receiver for comment replies
- `GET /api/reviews/{id}` - Fetch review metadata and findings
- `GET /api/reviews/{id}/comments` - Fetch review comment threads
- `GET /api/repos/{id}/config` - Read repository `.prism.yaml` settings

---

## Project Structure

```
PRism/
├── backend/
│   ├── agents/          # LangGraph agents (security, quality, report)
│   ├── routers/         # FastAPI endpoints (reviews, flags, webhooks)
│   ├── tools/           # GitHub tools and config parser
│   ├── celery_app.py    # Celery app initialization
│   ├── tasks.py         # Asynchronous review tasks
│   ├── celery.bat       # Windows worker launch script
│   ├── main.py          # FastAPI application entry point
│   └── requirements.txt # Python package requirements
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js App Router routes & pages
│   │   ├── components/  # React UI and layout components
│   │   └── lib/         # Supabase client and utilities
│   └── package.json     # Node.js dependencies and scripts
├── .prism.yaml.example  # Configuration template for repositories
└── docker-compose.yml   # Redis container definition
```

---

## License

This project is licensed under the MIT License.
