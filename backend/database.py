from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from backend.config import settings


class Base(DeclarativeBase):
    pass


engine_kwargs: dict[str, object] = {}
if settings.database_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.database_url, future=True, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False, class_=Session)


def ensure_sqlite_dev_schema() -> None:
    if not settings.database_url.startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "organizations" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("organizations")}
    statements: list[str] = []
    if "facility_address" not in existing_columns:
        statements.append("ALTER TABLE organizations ADD COLUMN facility_address VARCHAR(255)")
    if "city" not in existing_columns:
        statements.append("ALTER TABLE organizations ADD COLUMN city VARCHAR(100)")
    if "state" not in existing_columns:
        statements.append("ALTER TABLE organizations ADD COLUMN state VARCHAR(100)")
    if "zipcode" not in existing_columns:
        statements.append("ALTER TABLE organizations ADD COLUMN zipcode VARCHAR(20)")

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def get_db_session() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
