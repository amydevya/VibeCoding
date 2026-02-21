from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    default_model: str = "deepseek-chat"
    database_url: str = "sqlite+aiosqlite:///./data/chat.db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
