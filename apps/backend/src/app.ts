import express from "express";
import { errorHandler } from "./middleware/error-handler";
import { healthRouter } from "./routes/health";
import { sitesRouter } from "./routes/sites";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use("/api/health", healthRouter);
app.use("/api/sites", sitesRouter);
app.use((_request, response) => {
  response.status(404).json({ error: "Ruta no encontrada." });
});
app.use(errorHandler);
