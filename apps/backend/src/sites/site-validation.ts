import { isIP } from "node:net";
import { ApiError } from "../errors/api-error";
import { siteEnvironments, type SiteEnvironment, type SiteInput } from "./site-types";

const maximumNameLength = 150;
const maximumUrlLength = 2048;
const maximumDescriptionLength = 2000;

function isLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "::1" ||
    (isIP(host) === 4 && host.startsWith("127."))
  );
}

function readEnvironment(value: unknown): SiteEnvironment {
  if (
    typeof value !== "string" ||
    !siteEnvironments.includes(value as SiteEnvironment)
  ) {
    throw new ApiError(
      400,
      "El entorno debe ser Producción, Pruebas o Desarrollo."
    );
  }

  return value as SiteEnvironment;
}

export function validateSiteInput(input: unknown): SiteInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ApiError(400, "El cuerpo de la solicitud no es válido.");
  }

  const body = input as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (name.length === 0 || name.length > maximumNameLength) {
    throw new ApiError(
      400,
      `El nombre es obligatorio y no debe superar ${maximumNameLength} caracteres.`
    );
  }

  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  if (rawUrl.length === 0 || rawUrl.length > maximumUrlLength) {
    throw new ApiError(
      400,
      `La URL es obligatoria y no debe superar ${maximumUrlLength} caracteres.`
    );
  }

  const environment = readEnvironment(body.environment);
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new ApiError(400, "Ingresa una URL completa y válida.");
  }

  if (!parsedUrl.hostname || parsedUrl.username || parsedUrl.password) {
    throw new ApiError(
      400,
      "La URL debe tener un dominio válido y no puede incluir credenciales."
    );
  }

  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    throw new ApiError(400, "La URL debe utilizar HTTPS.");
  }

  if (
    parsedUrl.protocol === "http:" &&
    (environment !== "development" || !isLocalHost(parsedUrl.hostname))
  ) {
    throw new ApiError(
      400,
      "HTTP solo se permite para destinos locales en el entorno de Desarrollo."
    );
  }

  const domain = parsedUrl.hostname.toLowerCase().replace(/\.$/, "");
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (description.length > maximumDescriptionLength) {
    throw new ApiError(
      400,
      `La descripción no debe superar ${maximumDescriptionLength} caracteres.`
    );
  }

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    throw new ApiError(400, "La descripción debe ser texto.");
  }

  return {
    name,
    url: parsedUrl.toString(),
    domain,
    environment,
    description: description || null
  };
}
