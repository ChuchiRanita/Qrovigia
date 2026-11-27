export interface HealthStatus {
  status: "ok";
  database: "connected";
}

export async function fetchHealthStatus(): Promise<HealthStatus> {
  const response = await fetch("/api/health");

  if (!response.ok) {
    throw new Error(`El API respondió con HTTP ${response.status}.`);
  }

  const result: unknown = await response.json();

  if (
    typeof result !== "object" ||
    result === null ||
    !("status" in result) ||
    result.status !== "ok" ||
    !("database" in result) ||
    result.database !== "connected"
  ) {
    throw new Error("El API devolvió una respuesta de estado no válida.");
  }

  return result as HealthStatus;
}
