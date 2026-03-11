from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from schemas.claims import ClaimRecord


class ClaimRepository:
    def __init__(self, database_path: str = "cecurus_mvp.db") -> None:
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

    def get_claims_by_claim_id(self, claim_id: str) -> list[ClaimRecord]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT payload FROM claims WHERE claim_id = ? ORDER BY id",
                (claim_id,),
            ).fetchall()
        return [ClaimRecord.model_validate(json.loads(row["payload"])) for row in rows]

    def list_claims(self) -> list[ClaimRecord]:
        with self._connect() as connection:
            rows = connection.execute("SELECT payload FROM claims ORDER BY id").fetchall()
        return [ClaimRecord.model_validate(json.loads(row["payload"])) for row in rows]
