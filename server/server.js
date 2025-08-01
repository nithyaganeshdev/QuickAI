import express from "express";
import cors from "cors";
import "dotenv/config";

// Express Instance
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Basic Home Route
app.get("/", (req, res) => res.send("Server is Live! ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on the port ${3000} ✅`));
