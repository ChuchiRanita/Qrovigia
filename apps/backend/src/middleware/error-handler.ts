import type { ErrorRequestHandler } from "express";
import { ApiError } from "../errors/api-error";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
      ? error.status
      : 500;

  if (statusCode < 500) {
    response.status(statusCode).json({ error: "La solicitud no es válida." });
    return;
  }

  console.error("Error al procesar la solicitud:", error);
  response.status(500).json({ error: "Error interno del servidor." });
};
