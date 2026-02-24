# Data Assistant (智能数据分析系统)

A natural-language data analysis system: ask questions in plain text to query the database, generate SQL, and view charts and tables. Supports multiple sessions, streaming answers, and multiple chart types.

![Data Assistant](https://img.shields.io/badge/Data_Assistant-NL2SQL-blue)  
FastAPI · React · LangChain · Qwen · ECharts

---

## Features

- **Natural language queries**: Converts questions to SQL, runs queries, and returns results
- **Multi-session**: Session list with create, delete, and rename; first question auto-generates session title
- **Streaming**: SSE streaming for SQL, data, charts, and text answers
- **Visualization**: Bar, line, pie, scatter, radar charts; toggle chart/table; click history to view past charts
- **Consistent styling**: All charts use centered titles and uniform font sizes

---

## Tech Stack

| Layer   | Stack |
|--------|--------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, Axios, ECharts |
| Backend  | FastAPI, LangChain, Alibaba Cloud Qwen3 (DashScope) |
| Storage  | SQLite3 (aiosqlite) |

---

## Quick Start

### 1. Clone

This project lives in the [VibeCoding](https://github.com/amydevya/VibeCoding) repo. Clone and enter the folder:

```bash
git clone https://github.com/amydevya/VibeCoding.git
cd VibeCoding/Data_Assistant
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Edit .env and set DASHSCOPE_API_KEY
python -m uvicorn app.main:app --reload
```

- API docs: <http://localhost:8000/docs>

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: <http://localhost:5173>

### 4. Environment

- **Backend** `backend/.env`: `DASHSCOPE_API_KEY` (required; get from Alibaba Cloud DashScope)
- **Frontend** (optional): `VITE_API_URL=http://localhost:8000` (default)

---

## Project Structure

```
Data_Assistant/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py          # App entry, CORS
│   │   ├── api/             # Session, chat API
│   │   ├── core/            # LLM, Agent
│   │   ├── db/               # SQLite session & message store
│   │   └── ...
│   ├── requirements.txt
│   └── .env.example
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/      # Layout, Sidebar, Chat, Result, Chart
│   │   ├── hooks/           # useSession, useChat, useChart
│   │   ├── stores/          # Zustand
│   │   ├── services/        # API, chart style
│   │   └── utils/
│   └── package.json
├── docs/                     # Docs and verification
├── .gitignore
├── README.md                 # 中文说明
└── README_EN.md              # This file (English)
```

---

## Usage

1. **New session**: Click "新建会话" in the sidebar.
2. **Ask**: Type a question (e.g. "各品类销售总额从高到低") and send.
3. **Results**: View SQL, chart, and table on the right; switch chart type or chart/data tab.
4. **History**: Click an assistant message to load its SQL, chart, and data.
5. **Rename session**: Hover a session and click the pencil icon, or right-click and choose "重命名".

See [docs/e2e-verification.md](docs/e2e-verification.md) for more steps and troubleshooting.

---

## Scripts

**Backend**

- Dev: `python -m uvicorn app.main:app --reload`
- Tests: `pytest` (from `backend`); set `DASHSCOPE_API_KEY` for API tests

**Frontend**

- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Lint: `npm run lint`

---

## License

MIT
