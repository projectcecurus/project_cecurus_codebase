from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from backend.schemas.detection import DetectionFlag, FlagStatus


DEFAULT_DATABASE_PATH = Path(__file__).resolve().parents[1] / "cecurus_mvp.db"


class FlagRepository:
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
                CREATE TABLE IF NOT EXISTS detection_flags (
                    flag_id TEXT PRIMARY KEY,
                    rule_type TEXT NOT NULL,
                    claim_ids TEXT NOT NULL,
                    billing_provider TEXT NOT NULL,
                    rendering_provider TEXT NOT NULL,
                    matched_identifiers TEXT NOT NULL DEFAULT '[]',
                    explanation TEXT NOT NULL,
                    status TEXT NOT NULL
                )
                """
            )
            columns = {
                row["name"]
                for row in connection.execute("PRAGMA table_info(detection_flags)").fetchall()
            }
            if "matched_identifiers" not in columns:
                connection.execute(
                    "ALTER TABLE detection_flags ADD COLUMN matched_identifiers TEXT NOT NULL DEFAULT '[]'"
                )

    def replace_flags(self, flags: list[DetectionFlag]) -> None:
        with self._connect() as connection:
            connection.execute("DELETE FROM detection_flags")
            connection.executemany(
                """
                INSERT INTO detection_flags (
                    flag_id, rule_type, claim_ids, billing_provider, rendering_provider, matched_identifiers, explanation, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        flag.flag_id,
                        flag.rule_type.value,
                        json.dumps(flag.claim_ids),
                        flag.billing_provider,
                        flag.rendering_provider,
                        json.dumps(flag.matched_identifiers),
                        flag.explanation,
                        flag.status.value,
                    )
                    for flag in flags
                ],
            )

    def list_flags(self) -> list[DetectionFlag]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT flag_id, rule_type, claim_ids, billing_provider, rendering_provider, matched_identifiers, explanation, status
                FROM detection_flags
                ORDER BY flag_id
                """
            ).fetchall()
        return [self._deserialize_flag(row) for row in rows]

    def get_flag(self, flag_id: str) -> DetectionFlag | None:
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT flag_id, rule_type, claim_ids, billing_provider, rendering_provider, matched_identifiers, explanation, status
                FROM detection_flags
                WHERE flag_id = ?
                """,
                (flag_id,),
            ).fetchone()
        return self._deserialize_flag(row) if row else None

    def update_status(self, flag_id: str, status: FlagStatus) -> DetectionFlag | None:
        with self._connect() as connection:
            cursor = connection.execute(
                "UPDATE detection_flags SET status = ? WHERE flag_id = ?",
                (status.value, flag_id),
            )
            if cursor.rowcount == 0:
                return None
        return self.get_flag(flag_id)

    def _deserialize_flag(self, row: sqlite3.Row) -> DetectionFlag:
        return DetectionFlag(
            flag_id=row["flag_id"],
            rule_type=row["rule_type"],
            claim_ids=json.loads(row["claim_ids"]),
            billing_provider=row["billing_provider"],
            rendering_provider=row["rendering_provider"],
            matched_identifiers=json.loads(row["matched_identifiers"]),
            explanation=row["explanation"],
            status=row["status"],
        )
