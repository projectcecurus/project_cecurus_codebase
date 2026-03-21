import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import App from "./App";


const HEALTH_RESPONSE = { status: "ok" };
const DASHBOARD_RESPONSE = {
  metrics: {
    total_claims_processed: 2,
    total_flags_created: 1,
    flags_by_rule_type: {
      SameClaimContentDifferentIds: 1,
    },
    flags_by_workflow_status: {
      New: 1,
    },
  },
  flags: [
    {
      flag_id: "CONTENT-1",
      rule_type: "SameClaimContentDifferentIds",
      claim_ids: ["ABC123", "XYZ789"],
      billing_provider: "BILLING|GROUP|XX|123",
      rendering_provider: "DOE|JANE|XX|456",
      matched_identifiers: ["CLM", "NM1*85", "NM1*82", "SV1"],
      explanation: "Claims have matching provider identities and service line content but different claim_id values.",
      status: "New",
    },
  ],
};
const FLAG_DETAILS_RESPONSE = {
  flag: DASHBOARD_RESPONSE.flags[0],
  claims: [
    {
      claim_id: "ABC123",
      billing_provider: {
        last_name_or_organization: "Billing Group",
      },
      rendering_provider: {
        last_name_or_organization: "Doe",
      },
      claim_segment: {
        claim_amount: "150",
      },
      service_lines: [
        {
          raw: "SV1*HC:99213:25*100",
          line_type: "SV1",
          service_code: "99213",
          modifiers: ["25"],
          claim_amount: "100",
        },
      ],
    },
  ],
};

beforeEach(() => {
  window.localStorage.clear();
  window.history.pushState({}, "", "/");

  global.fetch = vi.fn((input, options = {}) => {
    const url = typeof input === "string" ? input : input.toString();
    const method = options.method ?? "GET";

    if (url.endsWith("/health")) {
      return Promise.resolve(new Response(JSON.stringify(HEALTH_RESPONSE), { status: 200 }));
    }

    if (url.includes("/api/files/review/dashboard")) {
      const reviewedDashboard = {
        ...DASHBOARD_RESPONSE,
        flags: [{ ...DASHBOARD_RESPONSE.flags[0], status: "Reviewed" }],
        metrics: {
          ...DASHBOARD_RESPONSE.metrics,
          flags_by_workflow_status: { Reviewed: 1 },
        },
      };
      return Promise.resolve(
        new Response(JSON.stringify(url.includes("status=Reviewed") ? reviewedDashboard : DASHBOARD_RESPONSE), {
          status: 200,
        }),
      );
    }

    if (url.endsWith("/api/files/upload") && method === "POST") {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            filename: "claims.837",
            content_type: "text/plain",
            size_bytes: 123,
          }),
          { status: 200 },
        ),
      );
    }

    if (url.endsWith("/api/files/parse") && method === "POST") {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            filename: "claims.837",
            claim_count: 2,
            claims: FLAG_DETAILS_RESPONSE.claims,
          }),
          { status: 200 },
        ),
      );
    }

    if (url.endsWith("/api/files/detect-duplicates") && method === "POST") {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            filename: "claims.837",
            claim_count: 2,
            flag_count: 1,
            flags: DASHBOARD_RESPONSE.flags,
          }),
          { status: 200 },
        ),
      );
    }

    if (url.endsWith("/api/files/review/flags/CONTENT-1")) {
      return Promise.resolve(new Response(JSON.stringify(FLAG_DETAILS_RESPONSE), { status: 200 }));
    }

    if (url.endsWith("/api/files/flags/CONTENT-1") && method === "PATCH") {
      return Promise.resolve(
        new Response(JSON.stringify({ ...DASHBOARD_RESPONSE.flags[0], status: "Reviewed" }), { status: 200 }),
      );
    }

    return Promise.reject(new Error(`Unhandled request: ${method} ${url}`));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});


test("renders the landing page by default", async () => {
  render(<App />);

  expect(screen.getByText("Privacy-First Claims Integrity for Hospitals")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Get Started" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
});


test("navigates to sign up and then into the protected dashboard", async () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Get Started" }));

  expect(screen.getByText("Create your account")).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText("Full Name"), {
    target: { value: "Kelvin Tester" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "kelvin@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "secure123" },
  });
  fireEvent.change(screen.getByLabelText("Confirm Password"), {
    target: { value: "secure123" },
  });

  fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

  await waitFor(() => {
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Backend: ok")).toBeInTheDocument();
  });
});


test("redirects unauthenticated users away from the dashboard route", async () => {
  window.history.pushState({}, "", "/dashboard");
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
  });
});


test("signs in, loads details, and signs out", async () => {
  window.localStorage.setItem(
    "cecurus_mvp_accounts",
    JSON.stringify([
      {
        id: "user-1",
        name: "Kelvin Tester",
        email: "kelvin@example.com",
        password: "secure123",
      },
    ]),
  );

  render(<App />);
  fireEvent.click(screen.getAllByRole("button", { name: "Sign In" })[0]);

  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "kelvin@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "secure123" },
  });

  fireEvent.click(screen.getAllByRole("button", { name: "Sign In" })[1]);

  await waitFor(() => {
    expect(screen.getByText("CONTENT-1")).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText("CONTENT-1"));

  await waitFor(() => {
    expect(screen.getByText("Claim Amount: 150")).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));

  await waitFor(() => {
    expect(screen.getByText("Privacy-First Claims Integrity for Hospitals")).toBeInTheDocument();
  });
});
