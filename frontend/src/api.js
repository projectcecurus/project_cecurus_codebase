const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function buildUrl(path, query = {}) {
  const base = API_BASE_URL || window.location.origin;
  const url = new URL(path, base);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      url.searchParams.set(key, value);
    }
  });
  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`;
}

async function parseJsonResponse(response) {
  if (response.ok) {
    return response.status === 204 ? null : response.json();
  }

  let message = `Request failed with status ${response.status}`;
  try {
    const payload = await response.json();
    if (Array.isArray(payload.detail)) {
      message = payload.detail.join(" ");
    } else if (typeof payload.detail === "string") {
      message = payload.detail;
    }
  } catch {
    // Keep the default message when the response is not JSON.
  }

  throw new Error(message);
}

async function postFile(path, file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(buildUrl(path), {
    method: "POST",
    body: formData,
  });
  return parseJsonResponse(response);
}

async function request(path, options = {}) {
  const headers = { ...(options.headers ?? {}) };
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return parseJsonResponse(response);
}

export const api = {
  getHealth() {
    return request("/health");
  },
  uploadFile(file) {
    return postFile("/api/files/upload", file);
  },
  parseFile(file) {
    return postFile("/api/files/parse", file);
  },
  detectDuplicates(file) {
    return postFile("/api/files/detect-duplicates", file);
  },
  getDashboard({ ruleType, status }) {
    return request("/api/files/review/dashboard", {
      query: {
        rule_type: ruleType,
        status,
      },
    });
  },
  getFlagDetails(flagId) {
    return request(`/api/files/review/flags/${flagId}`);
  },
  updateFlagStatus(flagId, status) {
    return request(`/api/files/flags/${flagId}`, {
      method: "PATCH",
      body: { status },
    });
  },
};

export function createEmptyDashboard() {
  return {
    metrics: {
      total_claims_processed: 0,
      total_flags_created: 0,
      flags_by_rule_type: {},
      flags_by_workflow_status: {},
    },
    flags: [],
  };
}

export function createEmptyFlagDetails() {
  return { flag: null, claims: [] };
}
