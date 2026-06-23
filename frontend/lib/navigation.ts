import type { Role } from "@/lib/types";

export const navItems: Array<{
  href: string;
  label: string;
  roles: Role[];
  description: string;
}> = [
  { href: "/dashboard", label: "Dashboard", roles: ["Admin", "Reviewer", "Analyst", "HospitalStaff"], description: "Aggregate overview" },
  { href: "/run-review", label: "Run Review", roles: ["Admin", "Reviewer", "Analyst", "HospitalStaff"], description: "Temporary processing session" },
  { href: "/review-session", label: "Claim Flags", roles: ["Admin", "Reviewer"], description: "Active review queue" },
  { href: "/analytics", label: "Analytics", roles: ["Admin", "Analyst"], description: "Deeper aggregate metrics" },
  { href: "/users", label: "Manage Users", roles: ["Admin"], description: "Invite and manage access" },
  { href: "/settings", label: "Settings", roles: ["Admin"], description: "Organization preferences" },
  { href: "/compliance", label: "Compliance", roles: ["Admin", "Analyst"], description: "Policies and acknowledgements" },
];
