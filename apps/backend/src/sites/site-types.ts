export const siteEnvironments = ["production", "testing", "development"] as const;
export type SiteEnvironment = (typeof siteEnvironments)[number];

export const siteStatuses = [
  "pending_verification",
  "active",
  "paused",
  "configuration_error"
] as const;
export type SiteStatus = (typeof siteStatuses)[number];

export type VerificationStatus = "pending" | "verified" | "error";

export interface Site {
  id: string;
  name: string;
  url: string;
  domain: string;
  environment: SiteEnvironment;
  description: string | null;
  status: SiteStatus;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
  last_scan_at: string | null;
}

export interface SiteInput {
  name: string;
  url: string;
  domain: string;
  environment: SiteEnvironment;
  description: string | null;
}

export interface SiteStats {
  total: number;
  active: number;
  pendingVerification: number;
}
