"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/types";

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
        organization_name: form.organization_name.trim(),
        facility_type: form.facility_type,
        facility_address: form.facility_address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipcode: form.zipcode.trim(),
        primary_email: form.primary_email.trim(),
        primary_phone: form.primary_phone.trim(),
        admin_full_name: form.admin_full_name.trim(),
        admin_password: form.admin_password,
        contacts: [{ full_name: form.admin_full_name.trim(), title: form.contact_title.trim(), email: form.primary_email.trim(), phone: form.primary_phone.trim(), is_primary: true }],
      });
      router.push("/dashboard");
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 409) {
        setError(`${submitError.message} Sign in instead, or reset the existing account password.`);
      } else {
        setError(submitError instanceof Error ? submitError.message : "Unable to register organization.");
      }
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
            {error ? (
              <div className="md:col-span-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">
                <p>{error}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link href="/login" className="font-semibold underline underline-offset-4">
                    Go to sign in
                  </Link>
                  <Link href="/forgot-password" className="font-semibold underline underline-offset-4">
                    Reset password
                  </Link>
                </div>
              </div>
            ) : null}
            <div className="md:col-span-2 flex justify-end">
              <Button disabled={loading}>{loading ? "Creating organization..." : "Create organization"}</Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
