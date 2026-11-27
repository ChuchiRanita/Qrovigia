export type SiteEnvironment = "production" | "testing" | "development";
export type SiteStatus =
  | "pending_verification"
  | "active"
  | "paused"
  | "configuration_error";

export interface Site {
  id: string;
  name: string;
  url: string;
  domain: string;
  environment: SiteEnvironment;
  description: string | null;
  status: SiteStatus;
  verification_status: "pending" | "verified" | "error";
  created_at: string;
  updated_at: string;
  last_scan_at: string | null;
}

export interface SiteInput {
  name: string;
  url: string;
  environment: SiteEnvironment;
  description: string;
}

export interface SiteStats {
  total: number;
  active: number;
  pendingVerification: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/sites${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers
    }
  });

  if (!response.ok) {
    let message = `Error del API (HTTP ${response.status}).`;
    try {
      const body: unknown = await response.json();
      if (
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "string"
      ) {
        message = body.error;
      }
    } catch {
      // The response may not contain JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function fetchSites(search: string, status: SiteStatus | "all") {
  const query = new URLSearchParams();
  if (search.trim()) query.set("search", search.trim());
  if (status !== "all") query.set("status", status);
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return request<Site[]>(suffix);
}

export function fetchSiteStats() {
  return request<SiteStats>("/stats");
}

export function createSite(input: SiteInput) {
  return request<Site>("", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateSite(id: string, input: SiteInput) {
  return request<Site>(`/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export function changeSiteStatus(id: string, status: "paused" | "active") {
  return request<Site>(`/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function deleteSite(id: string) {
  return request<void>(`/${encodeURIComponent(id)}`, { method: "DELETE" });
}
