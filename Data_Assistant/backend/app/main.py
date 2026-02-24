from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.api import session, chat
from app.db.sqlite_manager import db
from app.db.session_store import session_store

# 允许的前端来源（与 CORS 一致）
ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
}


class AddCORSHeadersMiddleware(BaseHTTPMiddleware):
    """为所有响应强制添加 CORS 头，确保 500 等错误响应也不会被浏览器 CORS 阻断"""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        origin = request.headers.get("origin")
        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
        else:
            response.headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGINS[0]
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response


# 创建 FastAPI 应用
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="基于 LangChain + FastAPI + React 的智能数据分析系统",
)

# 最先添加的中间件最后包裹，响应时最先执行 → 所有响应都会经过这里并加上 CORS
app.add_middleware(AddCORSHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理：返回 500 时也带 CORS 头"""
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__},
        headers=dict(CORS_HEADERS),
    )

# 注册路由
app.include_router(session.router)
app.include_router(chat.router)


@app.on_event("startup")
async def startup_event():
    """应用启动时初始化"""
    # 先初始化会话表（chat 依赖），再初始化示例数据
    await session_store.initialize()
    await db.initialize_sample_data()


@app.get("/health", tags=["Health"])
async def health_check():
    """健康检查接口"""
    return {
        "status": "ok",
        "version": settings.app_version,
        "name": settings.app_name,
    }


@app.get("/", tags=["Root"])
async def root():
    """根路径"""
    return {
        "message": f"欢迎使用 {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
