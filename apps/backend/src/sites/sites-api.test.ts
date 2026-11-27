import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import type { Site, SiteStats } from "./site-types";

let server: Server;
let baseUrl: string;
let closeDatabase: () => void;

before(async () => {
  process.env.SQLITE_DATABASE_PATH = ":memory:";
  const [{ app }, { database }] = await Promise.all([
    import("../app"),
    import("../config/database")
  ]);
  closeDatabase = () => database.close();
  server = app.listen(0);
  await once(server, "listening");

  const address = server.address();
  assert(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  closeDatabase();
});

async function postSite(input: Record<string, unknown>): Promise<Response> {
  return fetch(`${baseUrl}/api/sites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
}

test("CRUD de sitios, búsqueda, estados y resumen", async () => {
  const createdResponse = await postSite({
    name: "Portal Institucional",
    url: "https://WWW.Example.gob.mx",
    environment: "production",
    description: "Sitio principal"
  });
  assert.equal(createdResponse.status, 201);

  const created = (await createdResponse.json()) as Site;
  assert.equal(created.domain, "www.example.gob.mx");
  assert.equal(created.url, "https://www.example.gob.mx/");
  assert.equal(created.status, "pending_verification");
  assert.equal(created.verification_status, "pending");
  assert.equal(created.last_scan_at, null);

  const duplicateResponse = await postSite({
    name: "Duplicado",
    url: "https://www.example.gob.mx/",
    environment: "production"
  });
  assert.equal(duplicateResponse.status, 409);

  const readResponse = await fetch(`${baseUrl}/api/sites/${created.id}`);
  assert.equal(readResponse.status, 200);
  assert.equal(((await readResponse.json()) as Site).name, "Portal Institucional");

  const searchResponse = await fetch(`${baseUrl}/api/sites?search=example&status=pending_verification`);
  assert.equal(((await searchResponse.json()) as Site[]).length, 1);
  const statsResponse = await fetch(`${baseUrl}/api/sites/stats`);
  assert.deepEqual((await statsResponse.json()) as SiteStats, {
    total: 1,
    active: 0,
    pendingVerification: 1
  });

  const updateResponse = await fetch(`${baseUrl}/api/sites/${created.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Portal Actualizado",
      url: "https://portal.example.gob.mx",
      environment: "testing",
      description: "Entorno de pruebas"
    })
  });
  assert.equal(updateResponse.status, 200);
  const updated = (await updateResponse.json()) as Site;
  assert.equal(updated.name, "Portal Actualizado");
  assert.equal(updated.domain, "portal.example.gob.mx");
  assert.equal(updated.environment, "testing");
  assert.equal(updated.description, "Entorno de pruebas");

  const pauseResponse = await fetch(`${baseUrl}/api/sites/${created.id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "paused" })
  });
  assert.equal(((await pauseResponse.json()) as Site).status, "paused");

  const resumeResponse = await fetch(`${baseUrl}/api/sites/${created.id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "active" })
  });
  assert.equal(
    ((await resumeResponse.json()) as Site).status,
    "pending_verification"
  );

  const deleteResponse = await fetch(`${baseUrl}/api/sites/${created.id}`, {
    method: "DELETE"
  });
  assert.equal(deleteResponse.status, 204);
  assert.equal(
    (await fetch(`${baseUrl}/api/sites/${created.id}`)).status,
    404
  );
  assert.deepEqual((await (await fetch(`${baseUrl}/api/sites/stats`)).json()) as SiteStats, {
    total: 0,
    active: 0,
    pendingVerification: 0
  });
});

test("valida HTTPS, HTTP local, credenciales y entorno", async () => {
  const externalHttpResponse = await postSite({
    name: "Sitio HTTP externo",
    url: "http://example.org",
    environment: "development"
  });
  assert.equal(externalHttpResponse.status, 400);

  const credentialsResponse = await postSite({
    name: "URL con credenciales",
    url: "https://usuario:secreto@example.org",
    environment: "production"
  });
  assert.equal(credentialsResponse.status, 400);

  const invalidEnvironmentResponse = await postSite({
    name: "Entorno inválido",
    url: "https://example.org",
    environment: "staging"
  });
  assert.equal(invalidEnvironmentResponse.status, 400);

  const localResponse = await postSite({
    name: "Aplicación local",
    url: "http://127.0.0.1:4173",
    environment: "development"
  });
  assert.equal(localResponse.status, 201);
  const localSite = (await localResponse.json()) as Site;
  assert.equal(localSite.domain, "127.0.0.1");

  const deleteResponse = await fetch(`${baseUrl}/api/sites/${localSite.id}`, {
    method: "DELETE"
  });
  assert.equal(deleteResponse.status, 204);
});
