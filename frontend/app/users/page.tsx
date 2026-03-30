"use client";

import { FormEvent, useEffect, useState } from "react";

import { ProtectedPage } from "@/components/app/protected-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import type { Role, TeamMember } from "@/lib/types";

const roles: Role[] = ["Admin", "Reviewer", "Analyst", "HospitalStaff"];

export default function UsersPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [inviteToken, setInviteToken] = useState("");
  const [error, setError] = useState("");
  const [inviteForm, setInviteForm] = useState({ email: "", role: "Reviewer" as Role });

  async function loadTeam() {
    setTeam(await api.getTeam());
  }

  useEffect(() => {
    loadTeam().catch(() => undefined);
  }, []);

  async function inviteUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await api.inviteUser(inviteForm);
      setInviteToken(response.invite_token);
      await loadTeam();
    } catch (inviteError) {
      setInviteToken("");
      setError(inviteError instanceof Error ? inviteError.message : "Unable to generate invite.");
    }
  }

  return (
    <ProtectedPage roles={["Admin"]}>
      <div className="space-y-6">
        <PageHeader title="User management" subtitle="Invite users, assign roles, and control account access without exposing claim-level data." />
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card title="Invite user" description="Generate a tokenized invite for a new organization user.">
            <form className="space-y-4" onSubmit={inviteUser}>
              <input placeholder="user@hospital.org" value={inviteForm.email} onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))} />
              <select value={inviteForm.role} onChange={(event) => setInviteForm((current) => ({ ...current, role: event.target.value as Role }))}>
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
              <Button className="w-full">Generate invite</Button>
            </form>
            {inviteToken ? (
              <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
                Invite token: <span className="font-mono">{inviteToken}</span>
              </p>
            ) : null}
            {error ? <p className="mt-4 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
          </Card>
          <Card title="Organization users" description="Admins can adjust roles, deactivate access, and direct users to the reset-password flow.">
            <div className="space-y-4">
              {team.map((member) => (
                <div key={member.id} className="rounded-[1.5rem] border border-ink-200/70 p-4 dark:border-white/10">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-ink-950 dark:text-white">{member.full_name}</p>
                      <p className="text-sm text-ink-500 dark:text-ink-300">{member.email}</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[12rem_10rem_auto]">
                      <select defaultValue={member.role} onChange={async (event) => {
                        await api.updateUserRole(member.id, event.target.value);
                        await loadTeam();
                      }}>
                        {roles.map((role) => (
                          <option key={role}>{role}</option>
                        ))}
                      </select>
                      <Button variant={member.is_active ? "secondary" : "primary"} onClick={async () => {
                        await api.updateUserStatus(member.id, !member.is_active);
                        await loadTeam();
                      }}>
                        {member.is_active ? "Deactivate" : "Reactivate"}
                      </Button>
                      <a className="inline-flex items-center rounded-2xl px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10" href="/forgot-password">
                        Reset password
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedPage>
  );
}
