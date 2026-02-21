# DeepSeek Chat

A ChatGPT-like Q&A web app powered by [DeepSeek](https://www.deepseek.com/) API, with streaming responses, thinking-mode (reasoning) display, and multi-session chat.

## Features

- **Streaming chat** – Real-time AI replies with typing effect
- **Thinking mode** – Optional display of model reasoning (DeepSeek-V3.2)
- **Multi-session** – Create, switch, and delete conversations
- **Markdown & code** – Rendered answers with syntax highlighting and copy button
- **Responsive UI** – Sidebar collapse, mobile-friendly layout
- **Toast notifications** – Clear error and success feedback

## Tech Stack

| Layer   | Stack |
|--------|--------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, Zustand |
| Backend  | Python 3.9+, FastAPI, SQLAlchemy (async), SQLite |
| LLM      | DeepSeek API (`deepseek-chat`, OpenAI-compatible SDK) |

## Project Structure

```
chatgpt-clone/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/
│   │   ├── store/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── backend/           # FastAPI app
│   ├── app/
│   │   ├── routers/   # conversations, chat (SSE)
│   │   ├── services/  # DeepSeek streaming
│   │   ├── models.py
│   │   ├── database.py
│   │   └── config.py
│   ├── main.py
│   └── requirements.txt
└── README.md
```

## Quick Start

### 1. Backend

```bash
cd backend

# Create venv and install deps
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure env (copy example and set your API key)
cp .env.example .env
# Edit .env: set DEEPSEEK_API_KEY

# Run
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend: http://localhost:8000  
API docs: http://localhost:8000/docs  

### 2. Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend: http://localhost:5173  

The frontend proxies `/api` to the backend (see `vite.config.ts`).

### 3. Get DeepSeek API Key

1. Go to [DeepSeek Platform](https://platform.deepseek.com/).
2. Sign up / log in and create an API key.
3. Put it in `backend/.env` as `DEEPSEEK_API_KEY`.

## Environment (Backend)

| Variable           | Description                    | Default |
|--------------------|--------------------------------|--------|
| `DEEPSEEK_API_KEY` | Your DeepSeek API key          | (required) |
| `DEEPSEEK_BASE_URL`| DeepSeek API base URL          | `https://api.deepseek.com` |
| `DEFAULT_MODEL`    | Model name                     | `deepseek-chat` |
| `DATABASE_URL`     | SQLite DB path                 | `sqlite+aiosqlite:///./data/chat.db` |

Copy `backend/.env.example` to `backend/.env` and fill in your key.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/health` | Health check |
| GET    | `/api/conversations` | List conversations |
| POST   | `/api/conversations` | Create conversation |
| GET    | `/api/conversations/{id}` | Get conversation + messages |
| DELETE | `/api/conversations/{id}` | Delete conversation |
| PATCH  | `/api/conversations/{id}/title` | Update title |
| POST   | `/api/chat` | Send message (SSE stream) |

Chat request body: `{ "conversation_id": "...", "message": "...", "thinking_enabled": false }`.

## License

MIT.
