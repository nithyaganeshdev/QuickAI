import express from "express";
import { generateArticle } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/generate-article", generateArticle);

export default aiRouter;
