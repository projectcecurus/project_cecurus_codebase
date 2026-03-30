from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy import select

from backend.config import settings
from backend.dependencies import DatabaseSession, get_current_user, require_permission
from backend.models import InviteStatus, PasswordResetToken, User, UserInvite
from backend.schemas.auth import (
    InviteAcceptRequest,
    InviteResponse,
    InviteUserRequest,
    LoginRequest,
    MessageResponse,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    PasswordResetTokenResponse,
    TokenRefreshResponse,
    UserRoleUpdateRequest,
    UserStatusUpdateRequest,
    UserSummary,
)
from backend.security import (
    PasswordPolicyError,
    create_access_token,
    create_refresh_token,
    decode_signed_token,
    generate_one_time_token,
    hash_password,
    token_fingerprint,
    verify_password,
)
from backend.services.audit_service import AuditService


router = APIRouter(prefix="/api")
audit_service = AuditService()


def _serialize_user(user: User) -> UserSummary:
    return UserSummary.model_validate(
        {
            "id": user.id,
            "organization_id": user.organization_id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "is_email_verified": user.is_email_verified,
            "must_change_password": user.must_change_password,
            "last_login_at": user.last_login_at,
        }
    )


def _set_auth_cookies(response: Response, user: User) -> None:
    response.set_cookie(
        key=settings.access_cookie_name,
        value=create_access_token(user),
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        max_age=settings.access_token_minutes * 60,
    )
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=create_refresh_token(user),
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        max_age=settings.refresh_token_minutes * 60,
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(settings.access_cookie_name)
    response.delete_cookie(settings.refresh_cookie_name)


@router.post("/auth/login", response_model=UserSummary)
def login(payload: LoginRequest, response: Response, db: DatabaseSession) -> UserSummary:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    user.last_login_at = datetime.now(timezone.utc)
    db.add(user)
    db.commit()
    db.refresh(user)
    _set_auth_cookies(response, user)
    audit_service.log(db, action_type="auth.login", user=user, safe_metadata={"role": user.role.value})
    return _serialize_user(user)


@router.post("/auth/logout", response_model=MessageResponse)
def logout(response: Response, current_user: Annotated[User, Depends(get_current_user)], db: DatabaseSession) -> MessageResponse:
    current_user.session_version += 1
    db.add(current_user)
    db.commit()
    _clear_auth_cookies(response)
    audit_service.log(db, action_type="auth.logout", user=current_user)
    return MessageResponse(message="Logged out.")


@router.post("/auth/refresh", response_model=TokenRefreshResponse)
def refresh_session(
    response: Response,
    db: DatabaseSession,
    refresh_token: Annotated[str | None, Cookie(alias=settings.refresh_cookie_name)] = None,
) -> TokenRefreshResponse:
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing.")
    try:
        payload = decode_signed_token(refresh_token)
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.") from exc
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token.")
    user = db.scalar(select(User).where(User.id == payload.get("sub")))
    if user is None or not user.is_active or user.session_version != payload.get("sv"):
        raise HTTPException(status_code=401, detail="Refresh token is no longer valid.")
    _set_auth_cookies(response, user)
    audit_service.log(db, action_type="auth.refresh", user=user)
    return TokenRefreshResponse(message="Session refreshed.", expires_in_minutes=settings.access_token_minutes)


@router.get("/auth/me", response_model=UserSummary)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> UserSummary:
    return _serialize_user(current_user)


@router.post("/users/invite", response_model=InviteResponse, status_code=status.HTTP_201_CREATED)
def invite_user(
    payload: InviteUserRequest,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_permission("users:invite"))],
) -> InviteResponse:
    raw_token, hashed_token = generate_one_time_token()
    invite = UserInvite(
        organization_id=current_user.organization_id,
        invited_by_user_id=current_user.id,
        email=payload.email.lower(),
        role=payload.role,
        token_hash=hashed_token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=payload.expires_in_hours),
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    audit_service.log(db, action_type="user.invited", user=current_user, safe_metadata={"role": payload.role.value})
    return InviteResponse(
        invite_id=invite.id,
        email=invite.email,
        role=invite.role,
        expires_at=invite.expires_at,
        invite_token=raw_token,
    )


@router.post("/users/invite/accept", response_model=UserSummary)
def accept_invite(payload: InviteAcceptRequest, db: DatabaseSession) -> UserSummary:
    invite = db.scalar(
        select(UserInvite).where(UserInvite.token_hash == token_fingerprint(payload.token), UserInvite.status == InviteStatus.PENDING)
    )
    if invite is None or invite.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invite is invalid or expired.")
    if db.scalar(select(User).where(User.email == invite.email)):
        raise HTTPException(status_code=409, detail="A user with this email already exists.")
    try:
        password_hash = hash_password(payload.password)
    except PasswordPolicyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    user = User(
        organization_id=invite.organization_id,
        full_name=payload.full_name.strip(),
        email=invite.email,
        password_hash=password_hash,
        role=invite.role,
        is_active=True,
        is_email_verified=True,
    )
    invite.status = InviteStatus.ACCEPTED
    invite.accepted_at = datetime.now(timezone.utc)
    db.add(user)
    db.add(invite)
    db.commit()
    db.refresh(user)
    audit_service.log(db, action_type="user.invite.accepted", user=user, safe_metadata={"role": user.role.value})
    return _serialize_user(user)


@router.post("/auth/password-reset/request", response_model=PasswordResetTokenResponse)
def request_password_reset(payload: PasswordResetRequest, db: DatabaseSession) -> PasswordResetTokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None:
        return PasswordResetTokenResponse(message="If the account exists, a reset token has been generated.", reset_token="")
    raw_token, hashed_token = generate_one_time_token()
    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=hashed_token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db.add(reset_token)
    db.commit()
    audit_service.log(db, action_type="auth.password_reset.requested", user=user)
    return PasswordResetTokenResponse(message="Reset token generated for secure delivery.", reset_token=raw_token)


@router.post("/auth/password-reset/confirm", response_model=MessageResponse)
def confirm_password_reset(payload: PasswordResetConfirmRequest, db: DatabaseSession) -> MessageResponse:
    reset_token = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_fingerprint(payload.token),
            PasswordResetToken.used_at.is_(None),
        )
    )
    if reset_token is None or reset_token.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token is invalid or expired.")
    user = db.get(User, reset_token.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    try:
        user.password_hash = hash_password(payload.new_password)
    except PasswordPolicyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    user.session_version += 1
    reset_token.used_at = datetime.now(timezone.utc)
    db.add(user)
    db.add(reset_token)
    db.commit()
    audit_service.log(db, action_type="auth.password_reset.completed", user=user)
    return MessageResponse(message="Password reset completed.")


@router.patch("/users/{user_id}/role", response_model=UserSummary)
def update_user_role(
    user_id: str,
    payload: UserRoleUpdateRequest,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_permission("users:assign-role"))],
) -> UserSummary:
    user = db.scalar(select(User).where(User.id == user_id, User.organization_id == current_user.organization_id))
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    user.role = payload.role
    db.add(user)
    db.commit()
    db.refresh(user)
    audit_service.log(db, action_type="user.role.updated", user=current_user, safe_metadata={"assigned_role": payload.role.value})
    return _serialize_user(user)


@router.patch("/users/{user_id}/status", response_model=UserSummary)
def update_user_status(
    user_id: str,
    payload: UserStatusUpdateRequest,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_permission("users:deactivate"))],
) -> UserSummary:
    user = db.scalar(select(User).where(User.id == user_id, User.organization_id == current_user.organization_id))
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_active = payload.is_active
    user.session_version += 1
    db.add(user)
    db.commit()
    db.refresh(user)
    audit_service.log(db, action_type="user.status.updated", user=current_user, safe_metadata={"active": payload.is_active})
    return _serialize_user(user)
