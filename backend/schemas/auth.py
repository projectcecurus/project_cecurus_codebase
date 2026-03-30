from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from backend.models import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenRefreshResponse(BaseModel):
    message: str
    expires_in_minutes: int


class MessageResponse(BaseModel):
    message: str


class UserSummary(BaseModel):
    id: str
    organization_id: str
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    is_email_verified: bool
    must_change_password: bool
    last_login_at: datetime | None = None


class InviteUserRequest(BaseModel):
    email: EmailStr
    role: UserRole
    expires_in_hours: int = Field(default=72, ge=1, le=168)


class InviteAcceptRequest(BaseModel):
    token: str
    full_name: str = Field(min_length=2, max_length=255)
    password: str


class InviteResponse(BaseModel):
    invite_id: str
    email: EmailStr
    role: UserRole
    expires_at: datetime
    invite_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    token: str
    new_password: str


class PasswordResetTokenResponse(BaseModel):
    message: str
    reset_token: str


class UserRoleUpdateRequest(BaseModel):
    role: UserRole


class UserStatusUpdateRequest(BaseModel):
    is_active: bool
