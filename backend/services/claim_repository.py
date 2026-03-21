from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from backend.schemas.claims import ClaimRecord


DEFAULT_DATABASE_PATH = Path(__file__).resolve().parents[1] / "cecurus_mvp.db"


class ClaimRepository:
    def __init__(self, database_path: str | Path = DEFAULT_DATABASE_PATH) -> None:
        self.database_path = Path(database_path)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS claims (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    claim_id TEXT NOT NULL,
                    payload TEXT NOT NULL
                )
                """
            )

    def save_claims(self, claims: list[ClaimRecord]) -> None:
        with self._connect() as connection:
            connection.executemany(
                """
                INSERT INTO claims (claim_id, payload)
                VALUES (?, ?)
                """,
                [(claim.claim_id, claim.model_dump_json()) for claim in claims],
            )

    def replace_claims(self, claims: list[ClaimRecord]) -> None:
        with self._connect() as connection:
            connection.execute("DELETE FROM claims")
            connection.executemany(
                """
                INSERT INTO claims (claim_id, payload)
                VALUES (?, ?)
                """,
                [(claim.claim_id, claim.model_dump_json()) for claim in claims],
            )

    def get_claims_by_claim_id(self, claim_id: str) -> list[ClaimRecord]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT payload FROM claims WHERE claim_id = ? ORDER BY id",
                (claim_id,),
            ).fetchall()
        return [self._deserialize_claim(row["payload"]) for row in rows]

    def list_claims(self) -> list[ClaimRecord]:
        with self._connect() as connection:
            rows = connection.execute("SELECT payload FROM claims ORDER BY id").fetchall()
        return [self._deserialize_claim(row["payload"]) for row in rows]

    def _deserialize_claim(self, payload: str) -> ClaimRecord:
        return ClaimRecord.model_validate(json.loads(payload))
