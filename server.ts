import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory array to store leads
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

// Initialize Gemini lazily
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for leads
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

app.get("/api/leads", (req, res) => {
  return res.json({ success: true, leads });
});

// API endpoint for AI Consultation
app.post("/api/consult", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Format request tidak valid." });
  }

  try {
    const client = getGeminiClient();

    // Prepare history and prompt for generateContent
    // The instructions show chat.sendMessage or generateContent. Let's use chat!
    // Since the history is sent as an array of messages, we can build the contents structure.
    const systemInstruction = `Anda adalah "Min-Ji", asisten konsultasi AI virtual dari KOLA - PT. KOREA EDU WORK INTERNATIONAL.
Tugas Anda adalah melayani konsultasi gratis bagi calon pelajar/pekerja Indonesia yang ingin kuliah dan bekerja di Korea Selatan melalui program resmi kami.
Gunakan bahasa Indonesia yang sangat ramah, hangat, profesional, inspiratif, dan persuasif. 

Gunakan pengetahuan resmi dari PDF panduan kami berikut untuk menjawab semua pertanyaan dengan tepat:

1. BRAND & LEGALITAS:
   - Nama Resmi: KOLA (PT. KOREA EDU WORK INTERNATIONAL)
   - Alamat Kantor: Lenteng Agung, Kec. Jagakarsa, Jakarta Selatan, DKI Jakarta
   - Konsultan Utama: Heri Purwanto (Email: h3r1woori@gmail.com, WA: 0812-9049-0066)

2. PERBANDINGAN JALUR UTAMA (D2 vs D4):
   * JALUR D2 (KULIAH VOKASI - 2 TAHUN):
     - Pendaftaran: 2 kali dalam setahun.
     - Seleksi: Interview dari pihak kampus (online/offline) & tes tertulis.
     - Uang Semester: Bayar per 1 semester di awal.
     - Pilihan Kampus: Kampus sudah ditentukan oleh universitas mitra.
     - Jurusan Utama: Caregiver (Perawat Lansia/Pramurukti), K-Beauty (Kecantikan/Estetika), K-Bisnis / Global Care (Hospitalitas, Kuliner, Bisnis).
     - Syarat Bahasa: Khusus jurusan Caregiver, K-Beauty, dan K-Bisnis bebas dari syarat TOPIK bahasa Korea awal (belajar bahasa Korea dasar dilakukan di Indonesia sebelum berangkat). Jurusan lainnya wajib memiliki TOPIK level 2-3 di Indonesia.
     - Batasan Umur: Maksimal 35 tahun (tidak perlu nilai rata-rata rapor). Lulusan SMA/SMK, Kejar Paket C, D3, S1.
     - Jenis Visa: Visa Kuliah D2, setelah lulus langsung kerja profesional dengan Visa E7.
     - Biaya Semester: Estimasi W.2.5jt per semester (bisa diskon jika ada TOPIK 3).
     
   * JALUR D4 (KULIAH BAHASA - 6 BULAN S.D 1 TAHUN):
     - Pendaftaran: Kapan saja (buka sepanjang tahun).
     - Seleksi: Tidak ada seleksi akademis di awal, hanya seleksi kelengkapan dokumen.
     - Uang Semester: Bayar penuh di depan (full 1 tahun).
     - Pilihan Kampus & Jurusan: Banyak pilihan kampus & jurusan (didukung di 16 universitas seperti Gyeonggi Institute, Daelim University, Bucheon University, dll).
     - Jurusan Populer: Kendaraan Listrik & Elektrikal, Teknik Otomotif, Teknik Mesin & Mekanik, Tekstil dan Fashion, Teknik Mesin Konstruksi, Divisi Agro-pangan (Smart Farming), Energi Terbarukan, dan Engineering.
     - Syarat Bahasa: Mulai dari Kuliah Bahasa terlebih dahulu di Korea selama 6-12 bulan untuk mengejar TOPIK 3, setelah itu langsung lanjut D2 Vokasi.
     - Batasan Umur & Rapor: Maksimal 3 tahun setelah lulus sekolah (SMA/SMK). Wajib nilai rata-rata rapor minimal 7.5.
     - Jenis Visa: Visa D4, setelah lanjut Vokasi dan lulus, mendapatkan Visa Kerja Profesional E7 atau E-7M (K-Core).

3. POTENSI PENGHASILAN (SANGAT DETAIL):
   - Kerja Part-time (Alba) saat kuliah: Potensi Rp 10 s.d 20 Juta per bulan (Upah minimum Korea 2026 adalah KRW 10.200 per jam).
   - Saat Libur Semester (2 bulan penuh): Bisa kerja full-time di pedesaan dengan upah harian KRW 150.000/hari (sekitar IDR 1.8jt per hari).
   - Total Estimasi Penghasilan 1 Semester (6 bulan): Sekitar IDR 145 Juta (terdiri dari 4 bulan kuliah + part-time IDR 60 Juta, dan 2 bulan libur semester full-time IDR 85 Juta).
   - Setelah Wisuda (Kerja Profesional E7): Gaji pokok minimal Rp 35 Juta per bulan (untuk Caregiver/Koki berkisar Rp 30 - 40 Juta per bulan). Visa E7 ini bisa memboyong keluarga tinggal bersama di Korea Selatan dan di-upgrade ke Visa F2 (Permanent Residence).

4. RINCIAN BIAYA & TRANSPARANSI BERSALDO REKENING KORAN:
   - Kedua program mewajibkan saldo rekening koran penjamin sebesar Rp 120 Juta mengendap selama 3 bulan ke depan (sebagai bukti kemampuan finansial untuk visa).
   - JALUR D2 (KULIAH VOKASI): Total Biaya Semester 1 adalah Rp 74.900.000.
     - TAHAP 1 (Setelah lulus interview): Rp 37.000.000 (Asrama 1 sem Rp 14jt + Semester pertama Rp 23jt).
     - TAHAP 2 (Pengurusan berkas & visa): Rp 37.900.000 (Apostille & dokumen Rp 1.5jt, Tiket pesawat Rp 7.3jt, Admin Korea Rp 500rb, Asuransi Rp 1.6jt, ATM E-Money Rp 500rb, Biaya Visa Rp 1.5jt, Biaya Consulting Rp 25jt).
     - Garansi: Jika pengajuan visa ditolak, pembayaran Tahap 1 dikembalikan 100%.
   - JALUR D4 (KULIAH BAHASA): Total Biaya adalah Rp 65.100.000.
     - TAHAP 1 (Setelah lulus): Rp 27.200.000 (Asrama 1 sem Rp 14jt + Semester pertama Rp 13.2jt).
     - TAHAP 2 (Pengurusan berkas & visa): Rp 37.900.000 (Sama seperti rincian Tahap 2 D2 di atas).
     - Garansi refund sisa semester jika dalam 6 bulan sudah lulus TOPIK 3.

Target Anda:
1. Jawab pertanyaan mereka dengan jelas, ramah, dan penuh semangat menggunakan emoji 🌸🇰🇷.
2. Bandingkan dan rekomendasikan program yang paling pas dengan profil mereka secara objektif berdasarkan batasan umur, nilai rapor, dan kesiapan bahasa mereka.
3. Di akhir jawaban Anda secara alami, ajak mereka untuk mengisi formulir pendaftaran gratis di website agar Bapak Heri Purwanto (Konsultan Utama) bisa langsung menghubungi mereka via WhatsApp untuk mengatur jadwal interview kampus.`;

    // Format messages for @google/genai contents
    const contents = messages.map((m: any) => {
      return {
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      };
    });

    // Helper function for retry & model fallback
    const generateWithFallbackAndRetry = async () => {
      const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-3.5-flash",
        "gemini-2.5-pro"
      ];
      const maxRetriesPerModel = 2;

      for (const model of modelsToTry) {
        for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
          try {
            console.log(`Calling Gemini API using model: ${model} (Attempt ${attempt}/${maxRetriesPerModel})...`);
            const resContent = await client.models.generateContent({
              model,
              contents,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });
            return resContent;
          } catch (err: any) {
            console.error(`Attempt ${attempt} for model ${model} failed with error:`, err.message || err);
            
            // Check if it's the last attempt of the last model
            const isLastModel = model === modelsToTry[modelsToTry.length - 1];
            const isLastAttempt = attempt === maxRetriesPerModel;
            
            if (isLastModel && isLastAttempt) {
              throw err;
            }

            // Small delay before retry
            const delayMs = attempt * 500;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }
      throw new Error("All models and retries failed.");
    };

    const response = await generateWithFallbackAndRetry();
    return res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    return res.status(500).json({
      error: "Gagal menghubungi asisten AI.",
      details: error.message || error,
    });
  }
});

// Configure Vite or production static serving
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
