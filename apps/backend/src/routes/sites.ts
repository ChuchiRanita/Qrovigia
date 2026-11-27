import { Router } from "express";
import { ApiError } from "../errors/api-error";
import { siteStatuses, type SiteStatus } from "../sites/site-types";
import {
  changeSiteStatus,
  editSite,
  getSite,
  getSites,
  getSiteStatsSummary,
  registerSite,
  unregisterSite
} from "../sites/sites-service";

export const sitesRouter = Router();

sitesRouter.get("/stats", (_request, response) => {
  response.json(getSiteStatsSummary());
});

sitesRouter.get("/", (request, response) => {
  const search =
    typeof request.query.search === "string"
      ? request.query.search.trim()
      : undefined;
  const requestedStatus = request.query.status;

  if (
    requestedStatus !== undefined &&
    (typeof requestedStatus !== "string" ||
      !siteStatuses.includes(requestedStatus as SiteStatus))
  ) {
    throw new ApiError(400, "El filtro de estado no es válido.");
  }

  response.json(
    getSites(search, requestedStatus as SiteStatus | undefined)
  );
});

sitesRouter.get("/:id", (request, response) => {
  response.json(getSite(request.params.id));
});

sitesRouter.post("/", (request, response) => {
  response.status(201).json(registerSite(request.body));
});

sitesRouter.put("/:id", (request, response) => {
  response.json(editSite(request.params.id, request.body));
});

sitesRouter.patch("/:id/status", (request, response) => {
  const body: unknown = request.body;
  if (typeof body !== "object" || body === null || !("status" in body)) {
    throw new ApiError(400, "Indica el estado solicitado.");
  }

  response.json(changeSiteStatus(request.params.id, body.status));
});

sitesRouter.delete("/:id", (request, response) => {
  unregisterSite(request.params.id);
  response.status(204).end();
});
