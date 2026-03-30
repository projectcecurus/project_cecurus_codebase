"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    organization_name: "",
    facility_type: "Hospital",
    facility_address: "",
    city: "",
    state: "",
    zipcode: "",
    primary_email: "",
    primary_phone: "",
    admin_full_name: "",
    admin_password: "",
    confirm_admin_password: "",
    contact_title: "Compliance Lead",
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.admin_password !== form.confirm_admin_password) {
      setError("Admin password and confirmation must match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.registerOrganization({
        organization_name: form.organization_name,
        facility_type: form.facility_type,
        facility_address: form.facility_address,
        city: form.city,
        state: form.state,
        zipcode: form.zipcode,
        primary_email: form.primary_email,
        primary_phone: form.primary_phone,
        admin_full_name: form.admin_full_name,
        admin_password: form.admin_password,
        contacts: [{ full_name: form.admin_full_name, title: form.contact_title, email: form.primary_email, phone: form.primary_phone, is_primary: true }],
      });
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to register organization.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink-100 px-4 py-10 dark:bg-ink-950 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Card title="Organization onboarding" description="Register your hospital organization using non-PHI information only.">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            {Object.entries({
              organization_name: "Organization name",
              facility_address: "Facility address",
              city: "City",
              state: "State",
              zipcode: "ZIP code",
              primary_email: "Primary email",
              primary_phone: "Primary phone",
              admin_full_name: "Admin full name",
              admin_password: "Admin password",
              confirm_admin_password: "Confirm admin password",
            }).map(([key, label]) => (
              <label key={key} className="block space-y-2">
                <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{label}</span>
                <input
                  type={key.includes("password") ? "password" : key.includes("email") ? "email" : "text"}
                  value={form[key as keyof typeof form]}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  required
                />
              </label>
            ))}
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Facility type</span>
              <select value={form.facility_type} onChange={(event) => setForm((current) => ({ ...current, facility_type: event.target.value }))}>
                <option>Hospital</option>
                <option>Health System</option>
                <option>Specialty Facility</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Primary contact title</span>
              <input value={form.contact_title} onChange={(event) => setForm((current) => ({ ...current, contact_title: event.target.value }))} />
            </label>
            {error ? <p className="md:col-span-2 text-sm text-red-500">{error}</p> : null}
            <div className="md:col-span-2 flex justify-end">
              <Button disabled={loading}>{loading ? "Creating organization..." : "Create organization"}</Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
