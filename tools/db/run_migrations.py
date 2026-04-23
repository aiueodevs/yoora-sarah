from __future__ import annotations

import argparse
import hashlib
import os
import sys
from dataclasses import dataclass
from pathlib import Path

import psycopg
from psycopg.rows import dict_row

ROOT = Path(__file__).resolve().parents[2]
MIGRATIONS_DIR = ROOT / "db" / "migrations"
SEEDS_DIR = ROOT / "db" / "seeds"
DOTENV_PATH = ROOT / ".env"


@dataclass(frozen=True)
class SqlFile:
    path: Path
    checksum: str


def load_dotenv() -> None:
    if not DOTENV_PATH.exists():
        return

    for line in DOTENV_PATH.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def get_database_url() -> str:
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise SystemExit("DATABASE_URL is required. Copy .env.example to .env and set the value.")
    return database_url


def collect_sql_files(directory: Path) -> list[SqlFile]:
    files: list[SqlFile] = []
    for path in sorted(directory.glob("*.sql")):
        checksum = hashlib.sha256(path.read_bytes()).hexdigest()
        files.append(SqlFile(path=path, checksum=checksum))
    return files


def ensure_tracking_tables(connection: psycopg.Connection) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS platform_migrations (
              migration_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
              filename TEXT NOT NULL UNIQUE,
              checksum TEXT NOT NULL,
              applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS platform_seed_runs (
              seed_run_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
              filename TEXT NOT NULL UNIQUE,
              checksum TEXT NOT NULL,
              applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
            """
        )


def fetch_applied(connection: psycopg.Connection, table_name: str) -> dict[str, str]:
    with connection.cursor(row_factory=dict_row) as cursor:
        cursor.execute(f"SELECT filename, checksum FROM {table_name} ORDER BY filename;")
        rows = cursor.fetchall()
    return {row["filename"]: row["checksum"] for row in rows}


def apply_files(connection: psycopg.Connection, files: list[SqlFile], table_name: str) -> None:
    applied = fetch_applied(connection, table_name)

    for sql_file in files:
        existing_checksum = applied.get(sql_file.path.name)
        if existing_checksum:
            if existing_checksum != sql_file.checksum:
                raise SystemExit(
                    f"Checksum mismatch for {sql_file.path.name}. "
                    "Do not mutate an already-applied SQL file; create a new one instead."
                )
            print(f"SKIP  {sql_file.path.name}")
            continue

        sql = sql_file.path.read_text(encoding="utf-8")
        with connection.cursor() as cursor:
            cursor.execute(sql)
            cursor.execute(
                f"INSERT INTO {table_name} (filename, checksum) VALUES (%s, %s);",
                (sql_file.path.name, sql_file.checksum),
            )
        connection.commit()
        print(f"APPLY {sql_file.path.name}")


def print_status(connection: psycopg.Connection) -> None:
    migration_rows = fetch_applied(connection, "platform_migrations")
    seed_rows = fetch_applied(connection, "platform_seed_runs")

    print("MIGRATIONS")
    for sql_file in collect_sql_files(MIGRATIONS_DIR):
        state = "applied" if sql_file.path.name in migration_rows else "pending"
        print(f"  - {sql_file.path.name}: {state}")

    print("SEEDS")
    for sql_file in collect_sql_files(SEEDS_DIR):
        state = "applied" if sql_file.path.name in seed_rows else "pending"
        print(f"  - {sql_file.path.name}: {state}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Yoora Sarah migration and seed runner")
    parser.add_argument("command", choices=["status", "migrate", "seed"])
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    database_url = get_database_url()

    with psycopg.connect(database_url) as connection:
        ensure_tracking_tables(connection)
        connection.commit()

        if args.command == "status":
            print_status(connection)
            return 0

        if args.command == "migrate":
            apply_files(connection, collect_sql_files(MIGRATIONS_DIR), "platform_migrations")
            return 0

        if args.command == "seed":
            apply_files(connection, collect_sql_files(SEEDS_DIR), "platform_seed_runs")
            return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
