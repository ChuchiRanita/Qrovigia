import { Router } from "express";
import { database } from "../config/database";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  database.prepare("SELECT 1").get();

  response.json({
    status: "ok",
    database: "connected"
  });
});
