import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";

// Express Instance
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Basic Home Route
app.get("/", (req, res) => res.send("Server is Live! ✅"));

app.use(requireAuth());
app.use("/api/ai", aiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on the port ${3000} ✅`));
