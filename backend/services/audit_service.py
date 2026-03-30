from __future__ import annotations

from sqlalchemy.orm import Session

from backend.models import AuditLog, User


class AuditService:
    def log(
        self,
        db: Session,
        *,
        action_type: str,
        user: User | None = None,
        organization_id: str | None = None,
        safe_metadata: dict[str, object] | None = None,
    ) -> AuditLog:
        entry = AuditLog(
            user_id=user.id if user else None,
            organization_id=organization_id or (user.organization_id if user else None),
            action_type=action_type,
            safe_metadata=safe_metadata or {},
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry
