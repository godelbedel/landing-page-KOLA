import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Redis } from "@upstash/redis";

const app = express();
const PORT = 3000;
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

app.use(express.json());

interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  education: string;
  programOfInterest: string;
  message?: string;
  createdAt: string;
}

app.post("/api/leads", async (req, res) => {
  const { name, whatsapp, email, education, programOfInterest, message } = req.body;

  if (!name || !whatsapp) {
    return res.status(400).json({ error: "Nama dan Nomor WhatsApp wajib diisi." });
  }

  const userData: Lead = {
    id: Math.random().toString(36).substring(2, 9),
    name,
    whatsapp,
    email: email || "-",
    education: education || "SMA/SMK",
    programOfInterest: programOfInterest || "Belum Tahu",
    message: message || "",
    createdAt: new Date().toISOString(),
  };

  try {
    await redis.lpush("registrations", JSON.stringify(userData));
    return res.status(201).json({ success: true, lead: userData });
  } catch (error) {
    console.error("Failed to save registration to Redis:", error);
    return res.status(500).json({ error: "Gagal menyimpan data pendaftaran." });
  }
});

app.get("/api/leads", async (_req, res) => {
  try {
    const registrations = await redis.lrange<string>("registrations", 0, -1);
    const leads = registrations.map((registration) => JSON.parse(registration) as Lead);
    return res.json({ success: true, leads });
  } catch (error) {
    console.error("Failed to retrieve registrations from Redis:", error);
    return res.status(500).json({ error: "Gagal mengambil data pendaftaran." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
