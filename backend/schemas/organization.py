from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from backend.models import UserRole


class FacilityIdentifierCreate(BaseModel):
    identifier_type: str = Field(min_length=2, max_length=50)
    identifier_value: str = Field(min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=255)


class OrganizationContactCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    title: str = Field(min_length=2, max_length=255)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    is_primary: bool = False


class OrganizationOnboardingRequest(BaseModel):
    organization_name: str = Field(min_length=2, max_length=255)
    legal_name: str | None = Field(default=None, min_length=2, max_length=255)
    facility_type: str = Field(min_length=2, max_length=100)
    facility_address: str = Field(min_length=5, max_length=255)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    zipcode: str = Field(min_length=3, max_length=20)
    primary_email: EmailStr
    primary_phone: str | None = Field(default=None, max_length=50)
    timezone: str = Field(default="America/New_York", max_length=100)
    admin_full_name: str = Field(min_length=2, max_length=255)
    admin_password: str
    facility_identifiers: list[FacilityIdentifierCreate] = Field(default_factory=list)
    contacts: list[OrganizationContactCreate] = Field(default_factory=list)


class FacilityIdentifierResponse(BaseModel):
    id: str
    identifier_type: str
    identifier_value: str
    description: str | None
    created_at: datetime


class OrganizationContactResponse(BaseModel):
    id: str
    full_name: str
    title: str
    email: EmailStr
    phone: str | None
    is_primary: bool
    created_at: datetime


class OrganizationResponse(BaseModel):
    id: str
    name: str
    legal_name: str
    facility_type: str
    facility_address: str | None
    city: str | None
    state: str | None
    zipcode: str | None
    primary_email: EmailStr
    primary_phone: str | None
    timezone: str
    is_active: bool
    created_at: datetime
    facilities: list[FacilityIdentifierResponse]
    contacts: list[OrganizationContactResponse]


class TeamMemberResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    is_email_verified: bool
    must_change_password: bool


class OrganizationUpdateRequest(BaseModel):
    legal_name: str | None = Field(default=None, min_length=2, max_length=255)
    facility_type: str | None = Field(default=None, min_length=2, max_length=100)
    facility_address: str | None = Field(default=None, min_length=5, max_length=255)
    city: str | None = Field(default=None, min_length=2, max_length=100)
    state: str | None = Field(default=None, min_length=2, max_length=100)
    zipcode: str | None = Field(default=None, min_length=3, max_length=20)
    primary_email: EmailStr | None = None
    primary_phone: str | None = Field(default=None, max_length=50)
    timezone: str | None = Field(default=None, max_length=100)
