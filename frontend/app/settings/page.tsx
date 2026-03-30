"use client";

import { FormEvent, useEffect, useState } from "react";

import { ProtectedPage } from "@/components/app/protected-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import type { OrganizationProfile, OrganizationSettings } from "@/lib/types";

export default function SettingsPage() {
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [contactForm, setContactForm] = useState({ full_name: "", title: "", email: "", phone: "" });
  const [facilityForm, setFacilityForm] = useState({ identifier_type: "NPI", identifier_value: "", description: "" });

  useEffect(() => {
    Promise.all([api.getOrganization(), api.getOrganizationSettings()]).then(([org, orgSettings]) => {
      setOrganization(org);
      setSettings(orgSettings);
    });
  }, []);

  async function saveOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization) {
      return;
    }
    setOrganization(
      await api.updateOrganization({
        facility_type: organization.facility_type,
        facility_address: organization.facility_address,
        city: organization.city,
        state: organization.state,
        zipcode: organization.zipcode,
        primary_email: organization.primary_email,
        primary_phone: organization.primary_phone,
      }),
    );
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) {
      return;
    }
    setSettings(
      await api.updateOrganizationSettings({
        duplicate_threshold: settings.duplicate_threshold,
        auto_expire_review_sessions_minutes: settings.auto_expire_review_sessions_minutes,
        require_mfa_for_admins: settings.require_mfa_for_admins,
        session_timeout_minutes: settings.session_timeout_minutes,
        default_review_role: settings.default_review_role,
        compliance_contact_email: settings.compliance_contact_email,
      }),
    );
  }

  return (
    <ProtectedPage roles={["Admin"]}>
      <div className="space-y-6">
        <PageHeader title="Settings" subtitle="Manage organization-level configuration, workflow preferences, and security controls using non-PHI data only." />
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card title="Organization profile" description="Facility metadata, contact details, and identity fields stored at the organization level.">
            {organization ? (
              <form className="space-y-4" onSubmit={saveOrganization}>
                <input value={organization.name} readOnly />
                <input value={organization.facility_type} onChange={(event) => setOrganization({ ...organization, facility_type: event.target.value })} />
                <input value={organization.facility_address ?? ""} onChange={(event) => setOrganization({ ...organization, facility_address: event.target.value })} />
                <input value={organization.city ?? ""} onChange={(event) => setOrganization({ ...organization, city: event.target.value })} />
                <input value={organization.state ?? ""} onChange={(event) => setOrganization({ ...organization, state: event.target.value })} />
                <input value={organization.zipcode ?? ""} onChange={(event) => setOrganization({ ...organization, zipcode: event.target.value })} />
                <input value={organization.primary_email} onChange={(event) => setOrganization({ ...organization, primary_email: event.target.value })} />
                <input value={organization.primary_phone ?? ""} onChange={(event) => setOrganization({ ...organization, primary_phone: event.target.value })} />
                <Button>Save organization profile</Button>
              </form>
            ) : (
              <p className="text-sm text-ink-500 dark:text-ink-300">Loading organization profile...</p>
            )}
          </Card>
          <Card title="Workflow and security" description="Set duplicate thresholds, review defaults, session timeout behavior, and compliance contact details.">
            {settings ? (
              <form className="space-y-4" onSubmit={saveSettings}>
                <input type="number" value={settings.duplicate_threshold} onChange={(event) => setSettings({ ...settings, duplicate_threshold: Number(event.target.value) })} />
                <input type="number" value={settings.auto_expire_review_sessions_minutes} onChange={(event) => setSettings({ ...settings, auto_expire_review_sessions_minutes: Number(event.target.value) })} />
                <input type="number" value={settings.session_timeout_minutes} onChange={(event) => setSettings({ ...settings, session_timeout_minutes: Number(event.target.value) })} />
                <select value={settings.default_review_role} onChange={(event) => setSettings({ ...settings, default_review_role: event.target.value as OrganizationSettings["default_review_role"] })}>
                  <option>Reviewer</option>
                  <option>Analyst</option>
                  <option>HospitalStaff</option>
                </select>
                <input value={settings.compliance_contact_email ?? ""} onChange={(event) => setSettings({ ...settings, compliance_contact_email: event.target.value })} />
                <label className="flex items-center gap-3 rounded-2xl bg-ink-100/80 px-4 py-3 text-sm text-ink-700 dark:bg-white/5 dark:text-ink-200">
                  <input className="h-4 w-4" type="checkbox" checked={settings.require_mfa_for_admins} onChange={(event) => setSettings({ ...settings, require_mfa_for_admins: event.target.checked })} />
                  Require MFA for admin users
                </label>
                <Button>Save settings</Button>
              </form>
            ) : (
              <p className="text-sm text-ink-500 dark:text-ink-300">Loading settings...</p>
            )}
          </Card>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card title="Facility identifiers" description="Store facility-level identifiers only, never claim-level data.">
            <form className="space-y-4" onSubmit={async (event) => {
              event.preventDefault();
              await api.addFacility(facilityForm);
              setOrganization(await api.getOrganization());
              setFacilityForm({ identifier_type: "NPI", identifier_value: "", description: "" });
            }}>
              <select value={facilityForm.identifier_type} onChange={(event) => setFacilityForm({ ...facilityForm, identifier_type: event.target.value })}>
                <option>NPI</option>
                <option>Tax ID</option>
                <option>Facility Code</option>
              </select>
              <input value={facilityForm.identifier_value} onChange={(event) => setFacilityForm({ ...facilityForm, identifier_value: event.target.value })} placeholder="Identifier value" />
              <input value={facilityForm.description} onChange={(event) => setFacilityForm({ ...facilityForm, description: event.target.value })} placeholder="Description" />
              <Button>Add identifier</Button>
            </form>
            <div className="mt-6 space-y-3">
              {organization?.facilities.map((facility) => (
                <div key={facility.id} className="rounded-[1.25rem] bg-ink-100/80 px-4 py-3 text-sm dark:bg-white/5">
                  <p className="font-semibold text-ink-950 dark:text-white">{facility.identifier_type}</p>
                  <p className="text-ink-500 dark:text-ink-300">{facility.identifier_value}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Organization contacts" description="Operational and compliance contacts for your organization.">
            <form className="space-y-4" onSubmit={async (event) => {
              event.preventDefault();
              await api.addContact({ ...contactForm, is_primary: false });
              setOrganization(await api.getOrganization());
              setContactForm({ full_name: "", title: "", email: "", phone: "" });
            }}>
              <input value={contactForm.full_name} onChange={(event) => setContactForm({ ...contactForm, full_name: event.target.value })} placeholder="Full name" />
              <input value={contactForm.title} onChange={(event) => setContactForm({ ...contactForm, title: event.target.value })} placeholder="Title" />
              <input value={contactForm.email} onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })} placeholder="Email" />
              <input value={contactForm.phone} onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })} placeholder="Phone" />
              <Button>Add contact</Button>
            </form>
            <div className="mt-6 space-y-3">
              {organization?.contacts.map((contact) => (
                <div key={contact.id} className="rounded-[1.25rem] bg-ink-100/80 px-4 py-3 text-sm dark:bg-white/5">
                  <p className="font-semibold text-ink-950 dark:text-white">{contact.full_name}</p>
                  <p className="text-ink-500 dark:text-ink-300">{contact.title}</p>
                  <p className="text-ink-500 dark:text-ink-300">{contact.email}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedPage>
  );
}
