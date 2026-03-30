from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from passlib.context import CryptContext

from backend.config import settings
from backend.models import User, UserRole


# Use a passlib-managed PBKDF2 context for stable cross-platform behavior in local
# development while still keeping password hashing server-side and out of the client.
password_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

ROLE_PERMISSIONS: dict[UserRole, set[str]] = {
    UserRole.ADMIN: {
        "users:invite",
        "users:deactivate",
        "users:assign-role",
        "org:write",
        "settings:write",
        "reports:view",
        "processing:run",
        "review:update",
    },
    UserRole.REVIEWER: {"processing:run", "review:update", "reports:view"},
    UserRole.ANALYST: {"processing:run", "reports:view"},
    UserRole.HOSPITAL_STAFF: {"processing:run"},
}


class PasswordPolicyError(ValueError):
    pass


def validate_password_policy(password: str) -> None:
    if len(password) < 12:
        raise PasswordPolicyError("Password must be at least 12 characters long.")
    if not any(character.isupper() for character in password):
        raise PasswordPolicyError("Password must include an uppercase letter.")
    if not any(character.islower() for character in password):
        raise PasswordPolicyError("Password must include a lowercase letter.")
    if not any(character.isdigit() for character in password):
        raise PasswordPolicyError("Password must include a number.")
    if not any(not character.isalnum() for character in password):
        raise PasswordPolicyError("Password must include a special character.")


def hash_password(password: str) -> str:
    validate_password_policy(password)
    return password_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return password_context.verify(password, password_hash)


def create_signed_token(
    *,
    user: User,
    token_type: str,
    expires_delta: timedelta,
    additional_claims: dict[str, Any] | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": user.id,
        "org": user.organization_id,
        "role": user.role.value,
        "type": token_type,
        "sv": user.session_version,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
    }
    if additional_claims:
        payload.update(additional_claims)
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_signed_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def create_access_token(user: User) -> str:
    return create_signed_token(
        user=user,
        token_type="access",
        expires_delta=timedelta(minutes=settings.access_token_minutes),
    )


def create_refresh_token(user: User) -> str:
    return create_signed_token(
        user=user,
        token_type="refresh",
        expires_delta=timedelta(minutes=settings.refresh_token_minutes),
    )


def token_fingerprint(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_one_time_token() -> tuple[str, str]:
    raw = secrets.token_urlsafe(32)
    return raw, token_fingerprint(raw)


def has_permission(role: UserRole, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, set())
