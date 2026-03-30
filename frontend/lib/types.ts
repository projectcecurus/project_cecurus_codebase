export type Role = "Admin" | "Reviewer" | "Analyst" | "HospitalStaff";

export type User = {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  is_email_verified: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
};

export type OrganizationSettings = {
  duplicate_threshold: number;
  auto_expire_review_sessions_minutes: number;
  require_mfa_for_admins: boolean;
  session_timeout_minutes: number;
  default_review_role: Role;
  terms_acknowledged_at: string | null;
  privacy_policy_acknowledged_at: string | null;
  hipaa_acknowledged_at: string | null;
  compliance_contact_email: string | null;
};

export type OrganizationProfile = {
  id: string;
  name: string;
  legal_name: string;
  facility_type: string;
  facility_address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  primary_email: string;
  primary_phone: string | null;
  timezone: string;
  is_active: boolean;
  created_at: string;
  facilities: Array<{
    id: string;
    identifier_type: string;
    identifier_value: string;
    description: string | null;
    created_at: string;
  }>;
  contacts: Array<{
    id: string;
    full_name: string;
    title: string;
    email: string;
    phone: string | null;
    is_primary: boolean;
    created_at: string;
  }>;
};

export type TeamMember = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  is_email_verified: boolean;
  must_change_password: boolean;
};

export type AggregateRun = {
  run_id: string;
  created_at: string;
  aggregates: {
    file_type: string;
    total_claims_processed: number;
    total_duplicate_flags_detected: number;
    severity_counts: Record<string, number>;
    estimated_total_financial_exposure: number;
    rule_frequency_counts: Record<string, number>;
    processing_status: string;
  };
};

export type ReviewFlag = {
  flag_id: string;
  rule_type: string;
  claim_ids: string[];
  billing_provider: string;
  rendering_provider: string;
  matched_identifiers: string[];
  explanation: string;
  status: "New" | "Reviewed" | "Resolved" | "Ignored";
};

export type ClaimRecord = {
  claim_id: string;
  billing_provider: Record<string, string>;
  rendering_provider: Record<string, string>;
  claim_segment: Record<string, string>;
  service_lines: Array<Record<string, string | string[]>>;
};

export type ReviewSession = {
  metadata: {
    session_id: string;
    organization_id: string;
    created_at: string;
    expires_at: string;
    aggregates: AggregateRun["aggregates"];
  };
  flags: ReviewFlag[];
  claims: ClaimRecord[];
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
