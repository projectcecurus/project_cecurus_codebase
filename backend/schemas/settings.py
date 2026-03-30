from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from backend.models import UserRole


class OrganizationSettingsResponse(BaseModel):
    duplicate_threshold: int
    auto_expire_review_sessions_minutes: int
    require_mfa_for_admins: bool
    session_timeout_minutes: int
    default_review_role: UserRole
    terms_acknowledged_at: datetime | None
    privacy_policy_acknowledged_at: datetime | None
    hipaa_acknowledged_at: datetime | None
    compliance_contact_email: EmailStr | None


class OrganizationSettingsUpdateRequest(BaseModel):
    duplicate_threshold: int | None = Field(default=None, ge=1, le=100)
    auto_expire_review_sessions_minutes: int | None = Field(default=None, ge=5, le=120)
    require_mfa_for_admins: bool | None = None
    session_timeout_minutes: int | None = Field(default=None, ge=5, le=240)
    default_review_role: UserRole | None = None
    compliance_contact_email: EmailStr | None = None


class WorkflowPreferencesResponse(BaseModel):
    duplicate_threshold: int
    default_review_role: UserRole
    auto_expire_review_sessions_minutes: int


class SecuritySettingsResponse(BaseModel):
    session_timeout_minutes: int
    require_mfa_for_admins: bool


class ComplianceAcknowledgementRequest(BaseModel):
    acknowledge_terms: bool = False
    acknowledge_privacy: bool = False
    acknowledge_hipaa: bool = False
