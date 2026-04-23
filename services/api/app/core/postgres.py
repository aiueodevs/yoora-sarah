from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Iterator

import psycopg
from psycopg import AsyncConnection
from psycopg.pool import AsyncConnectionPool
from psycopg import Connection

_pool: AsyncConnectionPool | None = None


def get_db_pool() -> AsyncConnectionPool:
    global _pool
    if _pool is None:
        database_url = os.environ.get("DATABASE_URL")
        if not database_url:
            from app.core.config import get_settings

            database_url = get_settings().database_url
        _pool = AsyncConnectionPool(database_url, min_size=1, max_size=10)
    return _pool


def get_db_pool_sync() -> Connection:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        from app.core.config import get_settings

        database_url = get_settings().database_url
    return Connection.connect(database_url)


@contextmanager
def get_db() -> Iterator[Connection]:
    conn = get_db_pool_sync()
    try:
        yield conn
    finally:
        conn.close()
