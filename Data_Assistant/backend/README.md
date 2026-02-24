# 智能数据分析系统 - 后端

基于 FastAPI + LangChain 构建的智能数据分析系统后端服务。

## 技术栈

- **框架**: FastAPI
- **LLM**: 阿里云百炼 Qwen3 (通过 DashScope API)
- **Agent**: LangChain
- **数据库**: SQLite3 (aiosqlite)

## 快速开始

### 1. 安装依赖

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 DashScope API Key
```

### 3. 启动服务

```bash
# 开发模式
python -m uvicorn app.main:app --reload

# 或直接运行
python -m app.main
```

### 4. 访问 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py            # 配置管理
│   ├── api/                 # API 路由
│   ├── core/                # 核心模块 (LLM, Agent)
│   ├── db/                  # 数据库模块
│   ├── memory/              # 会话记忆模块
│   ├── models/              # 数据模型
│   └── utils/               # 工具函数
├── data/                    # 数据存储目录
├── requirements.txt
├── .env.example
└── README.md
```

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api/sessions` | GET/POST | 会话管理 |
| `/api/chat/query` | POST | 聊天查询 (SSE) |
