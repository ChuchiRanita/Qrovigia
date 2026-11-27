import { app } from "./app";
import { database } from "./config/database";

const port = Number(process.env.PORT ?? 3001);

const server = app.listen(port, () => {
  console.log(`QRO Sentinel API escuchando en http://localhost:${port}`);
});

function shutdown(): void {
  server.close((error) => {
    if (error) {
      console.error("Error al cerrar el servidor HTTP:", error);
      process.exitCode = 1;
    }

    database.close();
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
