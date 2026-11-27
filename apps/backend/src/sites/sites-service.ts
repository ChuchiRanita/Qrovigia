import { ApiError } from "../errors/api-error";
import type { Site, SiteInput, SiteStatus } from "./site-types";
import {
  createSite as insertSite,
  deleteSite as removeSite,
  getSiteById,
  getSiteStats,
  listSites,
  updateSite as saveSite,
  updateSiteStatus
} from "./sites-repository";
import { validateSiteInput } from "./site-validation";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

function withDuplicateHandling<T>(operation: () => T): T {
  try {
    return operation();
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ApiError(409, "Ya existe un sitio registrado para este dominio o URL.");
    }

    throw error;
  }
}

export function getSites(search?: string, status?: SiteStatus): Site[] {
  return listSites({ search, status });
}

export function getSiteStatsSummary() {
  return getSiteStats();
}

export function getSite(id: string): Site {
  const site = getSiteById(id);
  if (!site) throw new ApiError(404, "No se encontró el sitio solicitado.");
  return site;
}

export function registerSite(input: unknown): Site {
  return withDuplicateHandling(() => insertSite(validateSiteInput(input)));
}

export function editSite(id: string, input: unknown): Site {
  const validatedInput = validateSiteInput(input);
  const site = withDuplicateHandling(() => saveSite(id, validatedInput));

  if (!site) throw new ApiError(404, "No se encontró el sitio solicitado.");
  return site;
}

export function changeSiteStatus(id: string, requestedStatus: unknown): Site {
  const currentSite = getSite(id);

  if (requestedStatus === "paused") {
    if (currentSite.status === "paused") {
      throw new ApiError(409, "El sitio ya está pausado.");
    }

    return updateSiteStatus(id, "paused")!;
  }

  if (requestedStatus === "active") {
    if (currentSite.status !== "paused") {
      throw new ApiError(409, "Solo se puede reactivar un sitio pausado.");
    }

    const restoredStatus: SiteStatus =
      currentSite.verification_status === "verified"
        ? "active"
        : currentSite.verification_status === "error"
          ? "configuration_error"
          : "pending_verification";

    return updateSiteStatus(id, restoredStatus)!;
  }

  throw new ApiError(400, "El estado solicitado no es válido.");
}

export function unregisterSite(id: string): void {
  if (!removeSite(id)) {
    throw new ApiError(404, "No se encontró el sitio solicitado.");
  }
}
