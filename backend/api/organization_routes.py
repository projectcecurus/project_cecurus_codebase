from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from backend.config import settings
from backend.dependencies import DatabaseSession, get_current_user, require_permission
from backend.models import FacilityIdentifier, Organization, OrganizationContact, OrganizationSettings, User, UserRole
from backend.schemas.organization import (
    FacilityIdentifierCreate,
    FacilityIdentifierResponse,
    OrganizationContactCreate,
    OrganizationContactResponse,
    OrganizationOnboardingRequest,
    OrganizationResponse,
    OrganizationUpdateRequest,
    TeamMemberResponse,
)
from backend.schemas.settings import (
    ComplianceAcknowledgementRequest,
    OrganizationSettingsResponse,
    OrganizationSettingsUpdateRequest,
    SecuritySettingsResponse,
    WorkflowPreferencesResponse,
)
from backend.security import PasswordPolicyError, create_access_token, create_refresh_token, hash_password
from backend.services.audit_service import AuditService


router = APIRouter(prefix="/api")
audit_service = AuditService()


def _set_auth_cookies(response: Response, user: User) -> None:
    response.set_cookie(settings.access_cookie_name, create_access_token(user), httponly=True, secure=settings.secure_cookies, samesite="lax", max_age=settings.access_token_minutes * 60)
    response.set_cookie(settings.refresh_cookie_name, create_refresh_token(user), httponly=True, secure=settings.secure_cookies, samesite="lax", max_age=settings.refresh_token_minutes * 60)


def _get_org_with_relations(db, organization_id: str) -> Organization | None:
    return db.scalar(
        select(Organization)
        .where(Organization.id == organization_id)
        .options(joinedload(Organization.facilities), joinedload(Organization.contacts), joinedload(Organization.settings))
    )


def _serialize_org(org: Organization) -> OrganizationResponse:
    return OrganizationResponse.model_validate(
        {
            "id": org.id,
            "name": org.name,
            "legal_name": org.legal_name,
            "facility_type": org.facility_type,
            "facility_address": org.facility_address,
            "city": org.city,
            "state": org.state,
            "zipcode": org.zipcode,
            "primary_email": org.primary_email,
            "primary_phone": org.primary_phone,
            "timezone": org.timezone,
            "is_active": org.is_active,
            "created_at": org.created_at,
            "facilities": [
                {
                    "id": item.id,
                    "identifier_type": item.identifier_type,
                    "identifier_value": item.identifier_value,
                    "description": item.description,
                    "created_at": item.created_at,
                }
                for item in org.facilities
            ],
            "contacts": [
                {
                    "id": item.id,
                    "full_name": item.full_name,
                    "title": item.title,
                    "email": item.email,
                    "phone": item.phone,
                    "is_primary": item.is_primary,
                    "created_at": item.created_at,
                }
                for item in org.contacts
            ],
        }
    )


def _settings_for_org(db, organization_id: str) -> OrganizationSettings:
    current = db.get(OrganizationSettings, organization_id)
    if current is None:
        current = OrganizationSettings(organization_id=organization_id)
        db.add(current)
        db.commit()
        db.refresh(current)
    return current


@router.post("/onboarding/register", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def register_organization(payload: OrganizationOnboardingRequest, response: Response, db: DatabaseSession) -> OrganizationResponse:
    if db.scalar(select(Organization).where(Organization.name == payload.organization_name.strip())):
        raise HTTPException(status_code=409, detail="Organization already exists.")
    if db.scalar(select(User).where(User.email == payload.primary_email.lower())):
        raise HTTPException(status_code=409, detail="A user with that email already exists.")
    try:
        admin_password_hash = hash_password(payload.admin_password)
    except PasswordPolicyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    org = Organization(
        name=payload.organization_name.strip(),
        legal_name=(payload.legal_name or payload.organization_name).strip(),
        facility_type=payload.facility_type.strip(),
        facility_address=payload.facility_address.strip(),
        city=payload.city.strip(),
        state=payload.state.strip(),
        zipcode=payload.zipcode.strip(),
        primary_email=payload.primary_email.lower(),
        primary_phone=payload.primary_phone,
        timezone=payload.timezone,
    )
    db.add(org)
    db.flush()
    for facility in payload.facility_identifiers:
        db.add(FacilityIdentifier(organization_id=org.id, identifier_type=facility.identifier_type, identifier_value=facility.identifier_value, description=facility.description))
    for contact in payload.contacts:
        db.add(OrganizationContact(organization_id=org.id, full_name=contact.full_name, title=contact.title, email=contact.email.lower(), phone=contact.phone, is_primary=contact.is_primary))
    db.add(OrganizationSettings(organization_id=org.id, compliance_contact_email=payload.primary_email.lower(), session_timeout_minutes=settings.session_idle_minutes))
    admin = User(
        organization_id=org.id,
        full_name=payload.admin_full_name.strip(),
        email=payload.primary_email.lower(),
        password_hash=admin_password_hash,
        role=UserRole.ADMIN,
        is_active=True,
        is_email_verified=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    _set_auth_cookies(response, admin)
    audit_service.log(db, action_type="organization.registered", user=admin, safe_metadata={"facility_type": org.facility_type})
    hydrated = _get_org_with_relations(db, org.id)
    assert hydrated is not None
    return _serialize_org(hydrated)


@router.get("/organizations/me", response_model=OrganizationResponse)
def get_my_organization(db: DatabaseSession, current_user: Annotated[User, Depends(get_current_user)]) -> OrganizationResponse:
    org = _get_org_with_relations(db, current_user.organization_id)
    if org is None:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return _serialize_org(org)


@router.patch("/organizations/me", response_model=OrganizationResponse)
def update_my_organization(
    payload: OrganizationUpdateRequest,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_permission("org:write"))],
) -> OrganizationResponse:
    org = db.get(Organization, current_user.organization_id)
    if org is None:
        raise HTTPException(status_code=404, detail="Organization not found.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(org, field, value.lower() if field == "primary_email" else value)
    db.add(org)
    db.commit()
    audit_service.log(db, action_type="organization.updated", user=current_user)
    refreshed = _get_org_with_relations(db, org.id)
    assert refreshed is not None
    return _serialize_org(refreshed)


@router.post("/organizations/me/facilities", response_model=FacilityIdentifierResponse, status_code=status.HTTP_201_CREATED)
def add_facility(
    payload: FacilityIdentifierCreate,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_permission("org:write"))],
) -> FacilityIdentifierResponse:
    facility = FacilityIdentifier(
        organization_id=current_user.organization_id,
        identifier_type=payload.identifier_type,
        identifier_value=payload.identifier_value,
        description=payload.description,
    )
    db.add(facility)
    db.commit()
    db.refresh(facility)
    audit_service.log(db, action_type="organization.facility_identifier.added", user=current_user, safe_metadata={"identifier_type": facility.identifier_type})
    return FacilityIdentifierResponse.model_validate(facility, from_attributes=True)


@router.post("/organizations/me/contacts", response_model=OrganizationContactResponse, status_code=status.HTTP_201_CREATED)
def add_contact(
    payload: OrganizationContactCreate,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_permission("org:write"))],
) -> OrganizationContactResponse:
    contact = OrganizationContact(
        organization_id=current_user.organization_id,
        full_name=payload.full_name,
        title=payload.title,
        email=payload.email.lower(),
        phone=payload.phone,
        is_primary=payload.is_primary,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    audit_service.log(db, action_type="organization.contact.added", user=current_user)
    return OrganizationContactResponse.model_validate(contact, from_attributes=True)


@router.get("/organizations/me/team", response_model=list[TeamMemberResponse])
def list_team_members(db: DatabaseSession, current_user: Annotated[User, Depends(get_current_user)]) -> list[TeamMemberResponse]:
    users = db.scalars(select(User).where(User.organization_id == current_user.organization_id).order_by(User.created_at.desc())).all()
    return [TeamMemberResponse.model_validate(user, from_attributes=True) for user in users]


@router.get("/settings/organization", response_model=OrganizationSettingsResponse)
def get_organization_settings(db: DatabaseSession, current_user: Annotated[User, Depends(get_current_user)]) -> OrganizationSettingsResponse:
    return OrganizationSettingsResponse.model_validate(_settings_for_org(db, current_user.organization_id), from_attributes=True)


@router.patch("/settings/organization", response_model=OrganizationSettingsResponse)
def update_organization_settings(
    payload: OrganizationSettingsUpdateRequest,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_permission("settings:write"))],
) -> OrganizationSettingsResponse:
    current = _settings_for_org(db, current_user.organization_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(current, field, value)
    db.add(current)
    db.commit()
    db.refresh(current)
    audit_service.log(db, action_type="settings.organization.updated", user=current_user)
    return OrganizationSettingsResponse.model_validate(current, from_attributes=True)


@router.get("/settings/security", response_model=SecuritySettingsResponse)
def get_security_settings(db: DatabaseSession, current_user: Annotated[User, Depends(get_current_user)]) -> SecuritySettingsResponse:
    current = _settings_for_org(db, current_user.organization_id)
    return SecuritySettingsResponse(session_timeout_minutes=current.session_timeout_minutes, require_mfa_for_admins=current.require_mfa_for_admins)


@router.get("/settings/workflow", response_model=WorkflowPreferencesResponse)
def get_workflow_settings(db: DatabaseSession, current_user: Annotated[User, Depends(get_current_user)]) -> WorkflowPreferencesResponse:
    current = _settings_for_org(db, current_user.organization_id)
    return WorkflowPreferencesResponse(
        duplicate_threshold=current.duplicate_threshold,
        default_review_role=current.default_review_role,
        auto_expire_review_sessions_minutes=current.auto_expire_review_sessions_minutes,
    )


@router.post("/settings/compliance/acknowledge", response_model=OrganizationSettingsResponse)
def acknowledge_compliance(
    payload: ComplianceAcknowledgementRequest,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_permission("settings:write"))],
) -> OrganizationSettingsResponse:
    current = _settings_for_org(db, current_user.organization_id)
    now = datetime.now(timezone.utc)
    if payload.acknowledge_terms:
        current.terms_acknowledged_at = now
    if payload.acknowledge_privacy:
        current.privacy_policy_acknowledged_at = now
    if payload.acknowledge_hipaa:
        current.hipaa_acknowledged_at = now
    db.add(current)
    db.commit()
    db.refresh(current)
    audit_service.log(
        db,
        action_type="settings.compliance.acknowledged",
        user=current_user,
        safe_metadata={"terms": payload.acknowledge_terms, "privacy": payload.acknowledge_privacy, "hipaa": payload.acknowledge_hipaa},
    )
    return OrganizationSettingsResponse.model_validate(current, from_attributes=True)
