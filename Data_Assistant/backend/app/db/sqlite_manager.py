"""
SQLite 数据库管理模块
支持连接管理、查询执行、Schema 获取
"""

import sqlite3
import aiosqlite
import json
from typing import List, Dict, Any, Optional
from pathlib import Path
from contextlib import asynccontextmanager

from app.config import settings


class SQLiteManager:
    """SQLite 数据库管理器"""
    
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or settings.database_url.replace("sqlite+aiosqlite:///", "")
        # 确保数据目录存在
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
    
    @asynccontextmanager
    async def get_connection(self):
        """获取数据库连接"""
        conn = await aiosqlite.connect(self.db_path)
        conn.row_factory = aiosqlite.Row
        try:
            yield conn
        finally:
            await conn.close()
    
    async def execute_query(self, sql: str) -> List[Dict[str, Any]]:
        """
        执行 SQL 查询
        
        Args:
            sql: SQL 查询语句
        
        Returns:
            查询结果列表
        """
        async with self.get_connection() as conn:
            cursor = await conn.execute(sql)
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
    
    async def execute_update(self, sql: str, params: tuple = ()) -> int:
        """
        执行更新操作
        
        Args:
            sql: SQL 语句
            params: 参数
        
        Returns:
            影响的行数
        """
        async with self.get_connection() as conn:
            cursor = await conn.execute(sql, params)
            await conn.commit()
            return cursor.rowcount
    
    async def get_schema(self) -> str:
        """
        获取数据库 Schema 信息
        
        Returns:
            Schema 描述字符串
        """
        async with self.get_connection() as conn:
            # 获取所有表
            cursor = await conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            )
            tables = await cursor.fetchall()
            
            schema_parts = []
            
            for (table_name,) in tables:
                # 获取表结构
                cursor = await conn.execute(f"PRAGMA table_info({table_name})")
                columns = await cursor.fetchall()
                
                col_info = []
                for col in columns:
                    col_name = col[1]
                    col_type = col[2]
                    col_info.append(f"  - {col_name} ({col_type})")
                
                table_schema = f"表: {table_name}\n" + "\n".join(col_info)
                
                # 获取示例数据
                try:
                    cursor = await conn.execute(f"SELECT * FROM {table_name} LIMIT 2")
                    rows = await cursor.fetchall()
                    if rows:
                        sample_data = [dict(row) for row in rows]
                        table_schema += f"\n示例数据:\n  {json.dumps(sample_data, ensure_ascii=False)}"
                except:
                    pass
                
                schema_parts.append(table_schema)
            
            return "\n\n".join(schema_parts)
    
    async def get_tables(self) -> List[str]:
        """获取所有表名"""
        async with self.get_connection() as conn:
            cursor = await conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            )
            rows = await cursor.fetchall()
            return [row[0] for row in rows]
    
    async def get_table_schema(self, table_name: str) -> Dict[str, Any]:
        """
        获取指定表的 Schema
        
        Args:
            table_name: 表名
        
        Returns:
            表结构信息
        """
        async with self.get_connection() as conn:
            # 获取列信息
            cursor = await conn.execute(f"PRAGMA table_info({table_name})")
            columns = await cursor.fetchall()
            
            cols = []
            for col in columns:
                cols.append({
                    "name": col[1],
                    "type": col[2],
                    "notnull": bool(col[3]),
                    "default": col[4],
                    "pk": bool(col[5])
                })
            
            # 获取索引信息
            cursor = await conn.execute(f"PRAGMA index_list({table_name})")
            indexes = await cursor.fetchall()
            
            return {
                "table_name": table_name,
                "columns": cols,
                "indexes": [idx[1] for idx in indexes]
            }
    
    async def create_table(self, table_name: str, columns: Dict[str, str]) -> bool:
        """
        创建表
        
        Args:
            table_name: 表名
            columns: 列定义 {列名: 类型}
        
        Returns:
            是否成功
        """
        col_defs = ", ".join([f"{name} {typ}" for name, typ in columns.items()])
        sql = f"CREATE TABLE IF NOT EXISTS {table_name} ({col_defs})"
        
        async with self.get_connection() as conn:
            await conn.execute(sql)
            await conn.commit()
            return True
    
    async def insert_data(self, table_name: str, data: List[Dict[str, Any]]) -> int:
        """
        插入数据
        
        Args:
            table_name: 表名
            data: 数据列表
        
        Returns:
            插入的行数
        """
        if not data:
            return 0
        
        columns = list(data[0].keys())
        placeholders = ", ".join(["?" for _ in columns])
        col_names = ", ".join(columns)
        sql = f"INSERT INTO {table_name} ({col_names}) VALUES ({placeholders})"
        
        async with self.get_connection() as conn:
            for row in data:
                values = tuple(row[col] for col in columns)
                await conn.execute(sql, values)
            await conn.commit()
        
        return len(data)
    
    async def table_exists(self, table_name: str) -> bool:
        """检查表是否存在"""
        async with self.get_connection() as conn:
            cursor = await conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
                (table_name,)
            )
            row = await cursor.fetchone()
            return row is not None
    
    async def initialize_sample_data(self):
        """初始化示例数据"""
        # 创建销售表
        await self.create_table("sales", {
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "product_name": "TEXT NOT NULL",
            "category": "TEXT",
            "amount": "REAL NOT NULL",
            "quantity": "INTEGER NOT NULL",
            "sale_date": "TEXT NOT NULL",
            "region": "TEXT NOT NULL"
        })
        
        # 插入示例数据
        sample_data = [
            {"product_name": "iPhone 15", "category": "手机", "amount": 7999.0, "quantity": 50, "sale_date": "2024-01-15", "region": "华东"},
            {"product_name": "MacBook Pro", "category": "电脑", "amount": 14999.0, "quantity": 20, "sale_date": "2024-01-16", "region": "华北"},
            {"product_name": "iPad Air", "category": "平板", "amount": 4799.0, "quantity": 80, "sale_date": "2024-01-17", "region": "华南"},
            {"product_name": "AirPods Pro", "category": "配件", "amount": 1899.0, "quantity": 150, "sale_date": "2024-01-18", "region": "华东"},
            {"product_name": "Apple Watch", "category": "手表", "amount": 2999.0, "quantity": 60, "sale_date": "2024-01-19", "region": "西南"},
            {"product_name": "iPhone 15", "category": "手机", "amount": 7999.0, "quantity": 45, "sale_date": "2024-02-01", "region": "华北"},
            {"product_name": "MacBook Pro", "category": "电脑", "amount": 14999.0, "quantity": 15, "sale_date": "2024-02-05", "region": "华东"},
            {"product_name": "iPad Air", "category": "平板", "amount": 4799.0, "quantity": 70, "sale_date": "2024-02-10", "region": "华南"},
        ]
        
        if not await self.execute_query("SELECT * FROM sales LIMIT 1"):
            await self.insert_data("sales", sample_data)


# 创建全局实例
db = SQLiteManager()
