# 智能数据分析系统 (Data Assistant)

基于自然语言的智能数据分析系统：用文字提问即可查询数据库、生成 SQL、展示图表与数据表格。支持多会话管理、流式回答与多种图表类型切换。

**English**: [README_EN.md](README_EN.md)

![智能数据分析](https://img.shields.io/badge/智能数据分析-NL2SQL-blue)  
FastAPI · React · LangChain · Qwen · ECharts

---

## 功能概览

- **自然语言查数**：输入问题自动生成 SQL、执行查询并返回结果
- **多会话管理**：左侧会话列表，支持新建、删除、重命名；首条问题自动生成会话标题
- **流式回答**：SSE 流式输出 SQL、数据、图表与文字回答
- **数据可视化**：柱状图、折线图、饼图、散点图、雷达图；图表/数据表格切换；点击历史消息可回看对应图表
- **统一样式**：所有图表标题居中、字号一致，切换类型时样式统一

---

## 技术栈

| 层级     | 技术 |
|----------|------|
| 前端     | React 18, TypeScript, Vite, Tailwind CSS, Zustand, Axios, ECharts |
| 后端     | FastAPI, LangChain, 阿里云百炼 Qwen3 (DashScope) |
| 数据存储 | SQLite3 (aiosqlite) |

---

## 快速开始

### 1. 克隆项目

本项目位于 [VibeCoding](https://github.com/amydevya/VibeCoding) 仓库内，克隆后进入子目录即可：

```bash
git clone https://github.com/amydevya/VibeCoding.git
cd VibeCoding/Data_Assistant
```

### 2. 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # 编辑 .env，填入 DASHSCOPE_API_KEY
python -m uvicorn app.main:app --reload
```

- API 文档：<http://localhost:8000/docs>

### 3. 前端

```bash
cd frontend
npm install
npm run dev
```

- 应用地址：<http://localhost:5173>

### 4. 环境变量

- **后端** `backend/.env`：`DASHSCOPE_API_KEY`（必填，阿里云百炼 API Key）
- **前端** 可选：`VITE_API_URL=http://localhost:8000`（默认即为此值）

---

## 项目结构

```
Data_Assistant/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── main.py          # 应用入口、CORS
│   │   ├── api/             # 会话、聊天 API
│   │   ├── core/            # LLM、Agent
│   │   ├── db/              # SQLite 会话与消息存储
│   │   └── ...
│   ├── requirements.txt
│   └── .env.example
├── frontend/                # React 前端
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/      # Layout, Sidebar, Chat, Result, Chart
│   │   ├── hooks/           # useSession, useChat, useChart
│   │   ├── stores/          # Zustand
│   │   ├── services/        # API、图表样式
│   │   └── utils/
│   └── package.json
├── docs/                    # 文档与验证清单
├── .gitignore
├── README.md                # 中文说明
└── README_EN.md             # English
```

---

## 使用说明

1. **新建会话**：左侧点击「新建会话」。
2. **提问**：在输入框输入自然语言问题（如「各品类销售总额从高到低」），发送。
3. **查看结果**：右侧可查看 SQL、图表与数据表格；可切换图表类型或切换「图表 / 数据」。
4. **历史回看**：点击中间某条助手消息，右侧会展示该条对应的 SQL、图表与数据。
5. **重命名会话**：鼠标悬停会话项，点击铅笔图标，或右键选择「重命名」。

更多步骤与异常处理见 [docs/e2e-verification.md](docs/e2e-verification.md)。

---

## 开发与脚本

**后端**

- 开发：`python -m uvicorn app.main:app --reload`
- 测试：`pytest`（在 `backend` 目录下）

**前端**

- 开发：`npm run dev`
- 构建：`npm run build`
- 预览构建：`npm run preview`
- 代码检查：`npm run lint`

---

## 许可证

MIT
