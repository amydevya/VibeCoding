from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用基础配置
    app_name: str = "智能数据分析系统"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # 阿里云百炼 API 配置
    dashscope_api_key: Optional[str] = None
    
    # 数据库配置
    database_url: str = "sqlite+aiosqlite:///./data/app.db"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# 全局配置实例
settings = Settings()
