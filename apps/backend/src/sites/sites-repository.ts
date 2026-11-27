import { randomUUID } from "node:crypto";
import { database } from "../config/database";
import type {
  Site,
  SiteInput,
  SiteStats,
  SiteStatus,
  VerificationStatus
} from "./site-types";

export interface SiteFilters {
  search?: string;
  status?: SiteStatus;
}

export function listSites(filters: SiteFilters = {}): Site[] {
  const conditions: string[] = [];
  const parameters: Record<string, string> = {};

  if (filters.search) {
    conditions.push("(name LIKE @search OR domain LIKE @search)");
    parameters.search = `%${filters.search}%`;
  }

  if (filters.status) {
    conditions.push("status = @status");
    parameters.status = filters.status;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return database
    .prepare(
      `SELECT * FROM sites ${whereClause} ORDER BY created_at DESC, name COLLATE NOCASE`
    )
    .all(parameters) as Site[];
}

export function getSiteById(id: string): Site | undefined {
  return database.prepare("SELECT * FROM sites WHERE id = ?").get(id) as
    | Site
    | undefined;
}

export function createSite(input: SiteInput): Site {
  const id = randomUUID();
  const now = new Date().toISOString();

  database
    .prepare(
      `INSERT INTO sites (
        id, name, url, domain, environment, description, status,
        verification_status, created_at, updated_at, last_scan_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending_verification', 'pending', ?, ?, NULL)`
    )
    .run(
      id,
      input.name,
      input.url,
      input.domain,
      input.environment,
      input.description,
      now,
      now
    );

  return getSiteById(id)!;
}

export function updateSite(id: string, input: SiteInput): Site | undefined {
  const now = new Date().toISOString();

  const result = database
    .prepare(
      `UPDATE sites
       SET name = ?, url = ?, domain = ?, environment = ?, description = ?, updated_at = ?
       WHERE id = ?`
    )
    .run(
      input.name,
      input.url,
      input.domain,
      input.environment,
      input.description,
      now,
      id
    );

  return result.changes > 0 ? getSiteById(id) : undefined;
}

export function updateSiteStatus(
  id: string,
  status: SiteStatus,
  verificationStatus?: VerificationStatus
): Site | undefined {
  const now = new Date().toISOString();
  const result =
    verificationStatus === undefined
      ? database
          .prepare("UPDATE sites SET status = ?, updated_at = ? WHERE id = ?")
          .run(status, now, id)
      : database
          .prepare(
            "UPDATE sites SET status = ?, verification_status = ?, updated_at = ? WHERE id = ?"
          )
          .run(status, verificationStatus, now, id);

  return result.changes > 0 ? getSiteById(id) : undefined;
}

export function deleteSite(id: string): boolean {
  return database.prepare("DELETE FROM sites WHERE id = ?").run(id).changes > 0;
}

export function getSiteStats(): SiteStats {
  const row = database
    .prepare(
      `SELECT
        COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) AS active,
        COALESCE(SUM(CASE WHEN status = 'pending_verification' THEN 1 ELSE 0 END), 0) AS pendingVerification
       FROM sites`
    )
    .get() as SiteStats;

  return {
    total: row.total,
    active: row.active,
    pendingVerification: row.pendingVerification
  };
}
