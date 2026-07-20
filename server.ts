import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

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

const leads: Lead[] = [];

app.post("/api/leads", (req, res) => {
  const { name, whatsapp, email, education, programOfInterest, message } = req.body;

  if (!name || !whatsapp) {
    return res.status(400).json({ error: "Nama dan Nomor WhatsApp wajib diisi." });
  }

  const newLead: Lead = {
    id: Math.random().toString(36).substring(2, 9),
    name,
    whatsapp,
    email: email || "-",
    education: education || "SMA/SMK",
    programOfInterest: programOfInterest || "Belum Tahu",
    message: message || "",
    createdAt: new Date().toISOString(),
  };

  leads.push(newLead);
  return res.status(201).json({ success: true, lead: newLead });
});

app.get("/api/leads", (_req, res) => {
  return res.json({ success: true, leads });
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
