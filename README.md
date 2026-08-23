# PRism - AI-Powered Code Review

PRism analyzes your GitHub pull requests with specialized AI agents, catching security vulnerabilities and code quality issues before they ship.

## Features

- 🛡️ **Security Auditor** - Detects SQL injection, XSS, hardcoded secrets, auth bypasses
- 👁️ **Quality Inspector** - Identifies code smells, anti-patterns, missing error handling
- ⚡ **Instant Analysis** - Get detailed AI review results in seconds
- 🔔 **Auto-Trigger** - Automatically analyze every new PR via webhooks

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, shadcn/ui
- **Backend**: FastAPI, LangGraph, Google Gemini AI
- **Database**: Supabase (PostgreSQL)
- **Task Queue**: Celery + Redis
- **Authentication**: Supabase Auth (GitHub OAuth)

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Docker and Docker Compose (for Redis)
- Supabase account
- Google AI API key
- GitHub App credentials

## Quick Start

### 1. Clone the repository

\`\`\`bash
git clone <your-repo-url>
cd PRism
\`\`\`

### 2. Start Redis with Docker

\`\`\`bash
docker-compose up -d
\`\`\`

This will start Redis on `localhost:6379`. Verify it's running:

\`\`\`bash
docker ps
\`\`\`

### 3. Setup Backend

\`\`\`bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/Scripts/activate  # On Windows Git Bash
# or: .\venv\Scripts\Activate.ps1  # On Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your credentials
\`\`\`

### 4. Setup Frontend

\`\`\`bash
cd frontend
npm install

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
\`\`\`

### 5. Run the Application

You'll need **three terminals**:

**Terminal 1 - Start Celery Worker:**

**On Windows (use solo pool):**
\`\`\`bash
cd backend
source venv/Scripts/activate
celery -A celery_app worker --pool=solo --loglevel=info
\`\`\`

**On Linux/Mac:**
\`\`\`bash
cd backend
source venv/bin/activate
celery -A celery_app worker --loglevel=info
\`\`\`

**Or use the helper scripts:**
- Windows Git Bash: `./start-celery-windows.sh`
- Windows CMD/PowerShell: `start-celery-windows.bat`

**Terminal 2 - Start FastAPI Backend:**
\`\`\`bash
cd backend
source venv/Scripts/activate
uvicorn main:app --reload --port 8000
\`\`\`

**Terminal 3 - Start Next.js Frontend:**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Docker Commands

### Start Redis
\`\`\`bash
docker-compose up -d
\`\`\`

### Stop Redis
\`\`\`bash
docker-compose down
\`\`\`

### View Redis logs
\`\`\`bash
docker-compose logs -f redis
\`\`\`

### Reset Redis data
\`\`\`bash
docker-compose down -v
docker-compose up -d
\`\`\`

## Environment Variables

### Backend (.env)

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GOOGLE_API_KEY` - Google AI API key for Gemini
- `LANGCHAIN_API_KEY` - LangSmith API key (optional, for tracing)
- `GITHUB_APP_ID` - Your GitHub App ID
- `GITHUB_APP_PRIVATE_KEY_PATH` - Path to GitHub App private key
- `GITHUB_WEBHOOK_SECRET` - Webhook secret for GitHub
- `REDIS_URL` - Redis connection URL (default: redis://localhost:6379)

### Frontend (.env.local)

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key

## Development

### Backend Structure

\`\`\`
backend/
├── agents/          # LangGraph AI agents
├── routers/         # FastAPI route handlers
├── tools/           # LangChain tools
├── main.py          # FastAPI app entry point
├── celery_app.py    # Celery configuration
└── tasks.py         # Celery background tasks
\`\`\`

### Frontend Structure

\`\`\`
frontend/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   └── lib/          # Utility functions
\`\`\`

## Troubleshooting

### Celery on Windows: PermissionError or Process Errors

**Problem**: Celery worker crashes with `PermissionError: [WinError 5] Access is denied` or process spawn errors.

**Solution**: Use the `gevent` pool instead of the default `prefork` pool:

```bash
celery -A celery_app worker --pool=solo --loglevel=info
```

Or use the helper scripts:
- `./start-celery-windows.sh` (Git Bash)
- `start-celery-windows.bat` (CMD/PowerShell)

**Why**: Windows doesn't support process forking like Unix systems, so Celery's default `prefork` pool fails. The `solo` pool circumvents this by running in a single thread, which works perfectly on Windows for local development.

### Redis connection issues

If Celery can't connect to Redis:

1. Check if Redis is running: `docker ps`
2. Verify Redis URL in `.env`: `REDIS_URL=redis://localhost:6379`
3. Test Redis connection: `docker exec -it prism-redis redis-cli ping` (should return PONG)

### Frontend can't reach backend

- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Verify frontend is making requests to `http://localhost:8000`

### Celery worker not processing tasks

1. Check Celery logs for errors
2. Verify Redis is running and accessible
3. Ensure `.env` file has correct `REDIS_URL`
4. On Windows, make sure you're using `--pool=solo`

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
