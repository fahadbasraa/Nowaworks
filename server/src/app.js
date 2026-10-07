import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { AppError } from "./utils/AppError.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import teamRoutes from "./routes/team.routes.js";
import transcriptRoutes from "./routes/transcript.routes.js";
import demoRoutes from "./routes/demo.routes.js";

export const app = express();

if (env.NODE_ENV === "production") {
  // Render (and most PaaS) sit behind a reverse proxy; without this, req.ip always
  // resolves to the proxy's address and every user shares one rate-limit bucket.
  app.set("trust proxy", 1);
}

app.use(helmet());
if (env.NODE_ENV !== "production") {
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
}
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/transcript", transcriptRoutes);
app.use("/api/demo", demoRoutes);

app.use("/api", (req, res, next) => {
  next(new AppError(404, "NOT_FOUND", "Not found"));
});

if (env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.join(__dirname, "../../client/dist");

  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(errorHandler);
