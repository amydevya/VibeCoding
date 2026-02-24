# 智能数据分析系统 - 前端

基于 React + Vite + Tailwind CSS 构建的智能数据分析系统前端。

## 技术栈

- **框架**: React 18
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **图表库**: ECharts

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问应用

打开浏览器访问: http://localhost:5173

## 项目结构

```
frontend/
├── src/
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   ├── components/
│   │   ├── Layout/          # 布局组件
│   │   ├── Sidebar/         # 左侧边栏组件
│   │   ├── Chat/            # 聊天区域组件
│   │   ├── Chart/           # 图表展示组件
│   │   └── common/          # 公共组件
│   ├── hooks/               # 自定义 Hooks
│   ├── services/            # API 服务
│   ├── stores/              # Zustand 状态管理
│   ├── types/               # TypeScript 类型定义
│   └── styles/              # 样式文件
├── public/                  # 静态资源
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 可用脚本

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产版本 |
| `npm run lint` | 运行 ESLint |
