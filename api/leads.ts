import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

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

function parseRegistration(registration: unknown): Lead {
  if (typeof registration === "string") {
    return JSON.parse(registration) as Lead;
  }
  return registration as Lead;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
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
  }

  if (req.method === "GET") {
    try {
      const registrations = await redis.lrange("registrations", 0, -1);
      const leads = (registrations ?? []).map(parseRegistration);
      return res.status(200).json({ success: true, leads });
    } catch (error) {
      console.error("Failed to retrieve registrations from Redis:", error);
      return res.status(500).json({ error: "Gagal mengambil data pendaftaran." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed." });
}
