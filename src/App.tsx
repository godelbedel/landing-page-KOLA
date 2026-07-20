import React, { useState, useEffect, useRef } from "react";
import { 
  GraduationCap, 
  Briefcase, 
  DollarSign, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  MessageSquare, 
  Send, 
  Bot, 
  Sparkles, 
  Plane, 
  CheckCircle, 
  User, 
  Users, 
  BookOpen, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Database,
  Lock,
  X,
  RefreshCw,
  Search,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from 'react-markdown';

// Keep Gemini responses as raw text so react-markdown can parse syntax such
// as **bold**, while explicitly restoring Tailwind's bold weight.
const chatMarkdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-bold">{children}</strong>
  ),
};

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

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

const partnerUniversities = [
  // 1. Caregiver / Beauty / Business (20 campuses)
  { name: "Sahmyook Health University", location: "Seoul", type: "caregiver", programs: ["Caregiver (D2)", "Global Care (D2)"], merit: "Kampus kesehatan ternama di ibukota Seoul dengan koneksi kerja rumah sakit lansia elit." },
  { name: "Suncheon Jeil College", location: "Suncheon", type: "caregiver", programs: ["Caregiver (D2)", "K-Beauty (D2)"], merit: "Biaya hidup terjangkau, asrama modern, dan kemitraan industri luas di wilayah Selatan." },
  { name: "Mokpo Science University", location: "Mokpo", type: "caregiver", programs: ["Caregiver (D2)", "K-Bisnis (D2)"], merit: "Terkenal dengan pengajaran vokasi praktikal dan program penempatan kerja pasca kelulusan terbaik." },
  { name: "Chosun Nursing College", location: "Gwangju", type: "caregiver", programs: ["Caregiver (D2)"], merit: "Sekolah keperawatan legendaris di Korea dengan sertifikasi nasional yang diakui tinggi." },
  { name: "Daegu Health University", location: "Daegu", type: "caregiver", programs: ["Caregiver (D2)", "K-Beauty (D2)"], merit: "Fasilitas simulasi medis terlengkap, lingkungan kota besar metropolitan Daegu." },
  { name: "Gwangju Health University", location: "Gwangju", type: "caregiver", programs: ["Caregiver (D2)"], merit: "Pendidikan klinis komprehensif dengan jaringan magang di lebih dari 40 rumah sakit." },
  { name: "Seojeong College", location: "Yangju", type: "caregiver", programs: ["Caregiver (D2)", "K-Beauty (D2)"], merit: "Berlokasi strategis di dekat wilayah metropolitan Seoul, akomodasi asrama baru." },
  { name: "Kyungbuk College", location: "Yeongju", type: "caregiver", programs: ["Caregiver (D2)", "Global Care (D2)"], merit: "Fokus pada kenyamanan belajar dengan fasilitas asrama berstandar internasional." },
  { name: "Vision University of Jeonju", location: "Jeonju", type: "caregiver", programs: ["Caregiver (D2)", "K-Bisnis (D2)"], merit: "Menyediakan program beasiswa khusus untuk mahasiswa asing berprestasi akademik tinggi." },
  { name: "Cheongju University", location: "Cheongju", type: "caregiver", programs: ["K-Beauty (D2)", "K-Bisnis (D2)"], merit: "Kampus modern dengan kurikulum bisnis internasional dan tren kosmetika K-Beauty terkini." },
  { name: "Baekseok Culture University", location: "Cheonan", type: "caregiver", programs: ["Caregiver (D2)", "K-Beauty (D2)"], merit: "Menawarkan kombinasi pelatihan keahlian praktis dan pendidikan karakter berorientasi global." },
  { name: "Keimyung College University", location: "Daegu", type: "caregiver", programs: ["K-Beauty (D2)", "Global Care (D2)"], merit: "Memiliki pusat kebudayaan internasional dan fasilitas praktek kecantikan tercanggih." },
  { name: "Dong-A University", location: "Busan", type: "caregiver", programs: ["K-Bisnis (D2)", "Caregiver (D2)"], merit: "Kampus elit di Busan dengan program pengembangan karir internasional yang sangat kuat." },
  { name: "Busan Women's College", location: "Busan", type: "caregiver", programs: ["Caregiver (D2)", "K-Beauty (D2)"], merit: "Spesialis dalam mendidik profesional wanita mandiri dengan tingkat penempatan kerja 95%." },
  { name: "Masan University", location: "Changwon", type: "caregiver", programs: ["Caregiver (D2)", "Global Care (D2)"], merit: "Koneksi magang yang erat dengan berbagai yayasan medis terkemuka di wilayah Selatan." },
  { name: "Koje College", location: "Geoje", type: "caregiver", programs: ["Caregiver (D2)", "K-Bisnis (D2)"], merit: "Mendapat pendanaan khusus dari pemerintah Korea untuk program vokasi mahasiswa asing." },
  { name: "Yeungnam University College", location: "Daegu", type: "caregiver", programs: ["Caregiver (D2)", "K-Beauty (D2)"], merit: "Kurikulum terpadu dengan integrasi teknologi modern pada layanan keperawatan lansia." },
  { name: "Hanyang Women's University", location: "Seoul", type: "caregiver", programs: ["K-Beauty (D2)", "K-Bisnis (D2)"], merit: "Lokasi prestisius di Seoul dengan kurikulum desain mode dan kecantikan berstandar dunia." },
  { name: "Kyung-In Women's University", location: "Incheon", type: "caregiver", programs: ["K-Beauty (D2)", "Caregiver (D2)"], merit: "Pusat pelatihan kecantikan dan kesehatan terkemuka di wilayah metropolitan Incheon." },
  { name: "Shingu College", location: "Seongnam", type: "caregiver", programs: ["K-Bisnis (D2)", "Global Care (D2)"], merit: "Kampus hijau yang asri dengan kemitraan bisnis luas di kota teknologi Seongnam." },

  // 2. Engineering / Electrical / Automotive / Future Mobility / Textile / Agriculture (16 campuses)
  { name: "Gyeonggi Institute of Technology", location: "Siheung", type: "technical", programs: ["Teknik Otomotif (D4/D2)", "Elektrikal (D4/D2)"], merit: "Kampus teknik terdepan di kawasan industri terbesar Siheung-Ansan, kerja sama langsung dengan Hyundai." },
  { name: "Daelim University", location: "Anyang", type: "technical", programs: ["Teknik Otomotif (D4)", "Energi Terbarukan (D4)"], merit: "Dekat dengan Seoul, salah satu kampus vokasi teknik dengan reputasi penyerapan lulusan kerja tertinggi." },
  { name: "Inha Technical College", location: "Incheon", type: "technical", programs: ["Teknik Otomotif (D4)", "Mekanik Presisi (D4)"], merit: "Berafiliasi langsung dengan Inha University, kualitas pendidikan teknik papan atas Korea Selatan." },
  { name: "Ajou Motor College", location: "Boryeong", type: "technical", programs: ["Teknik Otomotif (D4)", "Kendaraan Listrik (EV) (D4)"], merit: "Satu-satunya perguruan tinggi khusus otomotif di Korea Selatan, pusat riset kendaraan elektrik masa depan." },
  { name: "Ulsan College", location: "Ulsan", type: "technical", programs: ["Mesin & Konstruksi (D4)", "Smart Farming (D4)"], merit: "Didirikan oleh Hyundai Heavy Industries, terletak di jantung kota industri raksasa Ulsan." },
  { name: "Yeungjin University", location: "Daegu", type: "technical", programs: ["Teknik Otomotif (D4)", "Elektrikal (D4)"], merit: "Pemenang penghargaan nasional untuk tingkat perekrutan kerja mahasiswa asing terbaik." },
  { name: "Gumi University", location: "Gumi", type: "technical", programs: ["Mekanik Presisi (D4)", "Elektrikal (D4)"], merit: "Berada di pusat industri elektronik Gumi, berpartner dengan Samsung dan LG." },
  { name: "Korea University of Technology", location: "Cheonan", type: "technical", programs: ["Teknik Otomotif (D4)", "Textile (D4)"], merit: "Fokus pada riset terapan dan inovasi teknologi industri masa depan dengan fasilitas laboratorium modern." },
  { name: "Dong-Eui Institute of Technology", location: "Busan", type: "technical", programs: ["Teknik Otomotif (D4)", "Elektrikal (D4)"], merit: "Pendidikan teknik berkualitas dengan bimbingan karir komprehensif di kota metropolitan Busan." },
  { name: "Chosun College of Science and Technology", location: "Gwangju", type: "technical", programs: ["Mekanik Presisi (D4)", "Future Mobility (D4)"], merit: "Memiliki pusat simulasi kendaraan masa depan (Autonomous & EV) tercanggih." },
  { name: "Incheon National University", location: "Incheon", type: "technical", programs: ["Future Mobility (D4)", "Textile (D4)"], merit: "Kampus global modern di Songdo Smart City dengan jaringan riset internasional." },
  { name: "Hanbat National University", location: "Daejeon", type: "technical", programs: ["Elektrikal (D4)", "Mekanik Presisi (D4)"], merit: "Kampus nasional prestisius di Daejeon, lembah silikon Korea Selatan." },
  { name: "Kumoh National Institute of Technology", location: "Gumi", type: "technical", programs: ["Mekanik Presisi (D4)", "Future Mobility (D4)"], merit: "Didirikan oleh mantan presiden Korea untuk mencetak insinyur industri terbaik nasional." },
  { name: "Seoul National University of Science", location: "Seoul", type: "technical", programs: ["Elektrikal (D4)", "Textile (D4)"], merit: "Salah satu universitas negeri terbaik di Seoul yang berfokus pada teknologi terapan tingkat lanjut." },
  { name: "Pukyong National University", location: "Busan", type: "technical", programs: ["Agriculture (D4)", "Mekanik Presisi (D4)"], merit: "Memiliki fasilitas riset pertanian laut dan agro-pangan berteknologi tinggi." },
  { name: "Changwon National University", location: "Changwon", type: "technical", programs: ["Teknik Otomotif (D4)", "Future Mobility (D4)"], merit: "Terletak di komplek industri Changwon dengan kemitraan erat bersama ratusan industri manufaktur." },

  // 3. Root Industry (14 campuses)
  { name: "Jeonju Technical College", location: "Jeonju", type: "root", programs: ["Pengelasan (Welding) (D2)", "Casting/Molding (D2)"], merit: "Pusat keunggulan pelatihan industri dasar (Root Industry) dengan jaminan konversi visa E7 tercepat." },
  { name: "Mokpo National Maritime University", location: "Mokpo", type: "root", programs: ["Mesin Kapal (D2)", "Perakitan Logam (D2)"], merit: "Kampus maritim nasional terkemuka dengan akses penempatan kerja di galangan kapal raksasa Korea." },
  { name: "Tongmyong University", location: "Busan", type: "root", programs: ["Molding & Press (D2)", "Pengecoran (D2)"], merit: "Fasilitas simulasi pabrik pintar (Smart Factory) untuk pelatihan Root Industry modern." },
  { name: "Sunchon National University", location: "Suncheon", type: "root", programs: ["Permukaan Logam (Surface Treat) (D2)"], merit: "Didukung penuh oleh Posco Steel untuk penempatan kerja industri pengolahan logam." },
  { name: "Kunsan National University", location: "Gunsan", type: "root", programs: ["Mesin Perkakas (D2)", "Welding (D2)"], merit: "Universitas negeri dengan klaster industri otomotif dan Root Industry yang sangat maju." },
  { name: "Kyonggi University", location: "Suwon", type: "root", programs: ["Molding (D2)", "Casting (D2)"], merit: "Dekat dengan Seoul, menyediakan beasiswa industri khusus untuk pendaftar Root Industry." },
  { name: "Dongguk University", location: "Gyeongju", type: "root", programs: ["Welding (D2)", "Mekanik Dasar (D2)"], merit: "Fasilitas pengajaran berakar kuat pada nilai-nilai tradisi dengan kurikulum industri modern." },
  { name: "Kangwon National University", location: "Samcheok", type: "root", programs: ["Mesin Tambang & Logam (D2)"], merit: "Spesialis dalam pelatihan teknik material dasar dan manufaktur logam berat." },
  { name: "Daegu University", location: "Gyeongsan", type: "root", programs: ["Welding (D2)", "Casting (D2)"], merit: "Kampus inklusif dengan pusat karir yang aktif mendampingi izin kerja legal siswa asing." },
  { name: "Youngsan University", location: "Yangsan", type: "root", programs: ["Welding & Assembly (D2)"], merit: "Lokasi strategis di area industri Busan-Ulsan-Gyeongnam dengan ratusan mitra pabrik." },
  { name: "Catholic University of Pusan", location: "Busan", type: "root", programs: ["Molding & Press (D2)"], merit: "Program pengembangan karakter dan kompetensi industri dasar dengan asrama komprehensif." },
  { name: "Gyeongnam National University", location: "Jinju", type: "root", programs: ["Mesin Kapal (D2)", "Welding (D2)"], merit: "Kampus negeri hasil penggabungan dua universitas ternama dengan fokus industri manufaktur kokoh." },
  { name: "Andong National University", location: "Andong", type: "root", programs: ["Welding (D2)", "Molding (D2)"], merit: "Universitas negeri berbiaya kuliah sangat rendah dengan fasilitas asrama bersubsidi penuh." },
  { name: "Jeju National University", location: "Jeju", type: "root", programs: ["Welding (D2)", "Mesin Dasar (D2)"], merit: "Belajar di pulau wisata dunia Jeju dengan fasilitas laboratorium manufaktur yang sangat lengkap." }
];

const confettiCount = 50;
const confettiColors = ["#003174", "#B81D2D", "#FBBF24", "#34D399", "#60A5FA", "#EC4899"];

const confettiParticles = Array.from({ length: confettiCount }).map((_, i) => {
  const angle = Math.random() * Math.PI * 2;
  const distance = 40 + Math.random() * 150;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance - 10;
  const rotation = Math.random() * 360;
  return {
    id: i,
    x,
    y,
    rotation,
    color: confettiColors[i % confettiColors.length],
    size: 5 + Math.random() * 9,
    delay: Math.random() * 0.15,
  };
});

const tickVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeInOut", delay: 0.3 }
  }
};

const circleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 }
  }
};

const navItems = [
  { id: "keunggulan", label: "Keunggulan" },
  { id: "program", label: "Pilihan Program" },
  { id: "alur", label: "Alur Pendaftaran" },
  { id: "biaya", label: "Transparansi Biaya" },
  { id: "faq", label: "FAQ" }
];

export default function App() {
  // Navigation states
  const [activeTab, setActiveTab] = useState("home");
  
  // Registration Form state
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    education: "SMA/SMK",
    programOfInterest: "Jalur Vokasi (Kuliah & Kerja)",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Counselor Portal state
  const [showCounselorPortal, setShowCounselorPortal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsSearch, setLeadsSearch] = useState("");
  const [portalError, setPortalError] = useState("");

  // AI Chat Consultant states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Halo! Saya Min-Ji, konsultan AI virtual K-BRIDGE EDU INTERNATIONAL. 🌸\n\nAda yang bisa saya bantu terkait program Kuliah Vokasi atau Kuliah Kerja ke Korea Selatan? Silakan tanyakan apa saja seperti biaya, persyaratan, atau pilihan jurusan!"
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // FAQ state
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false
  });

  // Timeline state
  const [selectedTimelineStep, setSelectedTimelineStep] = useState(0);

  // Program selector state (Detailed breakdown toggle)
  const [selectedProgramDetail, setSelectedProgramDetail] = useState<"vokasi" | "root" | null>(null);

  // Partner Universities search & filter states
  const [univSearch, setUnivSearch] = useState("");
  const [univCategory, setUnivCategory] = useState<"all" | "caregiver" | "technical" | "root">("all");
  const [showAllUniversities, setShowAllUniversities] = useState(false);

  // Hero Image Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    "/image/slide2.jpg",
    "/image/slide1.jpg",
    "/image/slide3.jpg",
    "/image/slide4.jpg",
    "/image/slide5.jpg"
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3500);
    return () => clearInterval(slideInterval);
  }, [heroSlides.length]);

  // Scroll to Top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = ["keunggulan", "program", "alur", "biaya", "faq"];
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px", // triggers active state when section takes up the center of the viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, aiTyping]);

  // Handle lead registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setSubmitSuccess(true);
        // Automatically add lead local state if dashboard is open
        setLeads(prev => [data.lead, ...prev]);
        // Reset form except name for personalized chatbot greeting
        setFormData(prev => ({
          ...prev,
          whatsapp: "",
          email: "",
          message: ""
        }));
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch leads for dashboard
  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const response = await fetch("/api/leads");
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLeadsLoading(false);
    }
  };

  // Handle passcode verification for CRM portal
  const handleUnlockPortal = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.toLowerCase() === "korea123") {
      setIsUnlocked(true);
      setPortalError("");
      fetchLeads();
    } else {
      setPortalError("Sandi salah");
    }
  };

  // Chat message send handler
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || userInput;
    if (!textToSend.trim()) return;

    const newMessages = [...chatMessages, { role: "user" as const, text: textToSend }];
    setChatMessages(newMessages);
    if (!customText) setUserInput("");
    setAiTyping(true);

    try {
      const response = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await response.json();
      if (data.text) {
        setChatMessages(prev => [...prev, { role: "model" as const, text: data.text }]);
      } else {
        setChatMessages(prev => [...prev, { 
          role: "model" as const, 
          text: "Maaf, terjadi gangguan koneksi dengan asisten konseling. Silakan coba kirim ulang pesan Anda." 
        }]);
      }
    } catch (error) {
      console.error("AI Consultation error:", error);
      setChatMessages(prev => [...prev, { 
        role: "model" as const, 
        text: "Maaf, sistem asisten konseling sedang sibuk. Silakan ajukan pertanyaan langsung via WhatsApp Kak Heri!" 
      }]);
    } finally {
      setAiTyping(false);
    }
  };

  // Pre-defined quick AI consultation options
  const quickQuestions = [
    "Apa syarat utama Kuliah Vokasi?",
    "Berapa gaji kerja part-time di Korea?",
    "Apakah harus bisa bahasa Korea dulu?",
    "Bagaimana rincian biaya Rp 75 Juta?",
  ];

  const timelineSteps = [
    {
      title: "Sesi Wawancara (Interview)",
      icon: "record_voice_over",
      desc: "Wawancara online atau offline langsung dengan perwakilan resmi dari universitas mitra di Korea Selatan untuk mengukur kesiapan dan motivasi Anda.",
      details: "Sesi ini didampingi sepenuhnya oleh tim KOLA. Anda akan diberikan kisi-kisi eksklusif dan simulasi wawancara untuk menjamin persentase kelulusan maksimal."
    },
    {
      title: "Penerbitan LoA & Pembayaran UKT",
      icon: "contract",
      desc: "Kampus menerbitkan Sertifikat Kelulusan resmi (Letter of Admission - LoA). Siswa melakukan pembayaran UKT langsung ke Virtual Account resmi universitas di Korea Selatan.",
      details: "Pembayaran UKT sangat aman karena ditransfer langsung ke rekening bank resmi kampus Anda tanpa melalui rekening perantara pihak ketiga atau agen."
    },
    {
      title: "Pemberkasan Visa Studi",
      icon: "folder_open",
      desc: "Pengumpulan dan verifikasi 15-18 dokumen wajib pengajuan visa ke Kedutaan Besar Korea (seperti Paspor, Ijazah Terjemah Tersumpah & Apostille, serta bukti saldo penjamin).",
      details: "Pihak imigrasi Korea mewajibkan adanya saldo rekening koran penjamin sebesar Rp 120 Juta mengendap selama 3 bulan sebagai bukti kemampuan finansial siswa."
    },
    {
      title: "Penerbitan Calling Visa",
      icon: "airplane_ticket",
      desc: "Dokumen Anda diajukan ke Imigrasi Korea Selatan untuk mendapatkan nomor persetujuan visa (Certificate of Admission) guna penerbitan visa resmi di KVAC Jakarta.",
      details: "Seluruh proses pengajuan fisik visa ke KVAC diurus oleh perwakilan tim kami, sehingga Anda tidak perlu mengantre lama di Jakarta."
    },
    {
      title: "Pemberangkatan & Orientasi",
      icon: "flight_takeoff",
      desc: "Pembekalan pra-keberangkatan, pelepasan resmi di bandara, penerbangan ke Korea Selatan, penjemputan di Bandara Incheon, dan pengantaran ke asrama.",
      details: "Perwakilan K-BRIDGE yang berdomisili di Korea Selatan akan menyambut Anda langsung di bandara, membantu orientasi lingkungan, pengurusan kartu tanda pengenal (ARC), dan sim card."
    },
    {
      title: "Kuliah & Kerja Sampingan (Alba)",
      icon: "briefcase",
      desc: "Memulai perkuliahan di kampus mitra. Diberikan bimbingan langsung untuk penempatan kerja sampingan resmi (Alba) guna mencukupi kebutuhan biaya hidup & menabung.",
      details: "Siswa diizinkan bekerja paruh waktu secara legal 20-30 jam/minggu saat masa kuliah, dan bekerja FULL-TIME tanpa batasan jam saat libur semester (musim panas & dingin)."
    },
    {
      title: "Transisi Visa Kerja Profesional E7",
      icon: "award",
      desc: "Setelah lulus kuliah vokasi, universitas mendampingi transisi status visa Anda langsung menjadi Visa Kerja Profesional E7 atau E-7M (K-Core) di perusahaan mitra resmi.",
      details: "Kontrak kerja profesional ini dijamin legal dengan standar upah pokok minimal Rp 35 Juta per bulan sesuai regulasi kementerian ketenagakerjaan Korea Selatan."
    },
    {
      title: "Upgrade Status Visa Tinggal F2",
      icon: "users",
      desc: "Setelah bekerja stabil dengan Visa E7, Anda dibimbing untuk melakukan upgrade status tinggal menjadi Visa Residen F2 (Permanent Residence).",
      details: "Dengan Visa F2, Anda memiliki hak menetap jangka panjang dan diizinkan secara hukum untuk memboyong keluarga inti (istri/suami dan anak) untuk tinggal bersama di Korea Selatan."
    }
  ];

  const faqs = [
    {
      q: "Berapa lama kuliah ?",
      a: "Kuliah vokasi ini seminggu 2 hari kali tatap muka selama 2 tahun dan libur semester 2 bulan, jadi aktual kuliah hanya 4 bulan dan sisa harinya wajib kerja sampingan.\n\nSetelah selesai kuliah diberikan Visa E7 kontrak 3 tahun dan update Visa F2 yaitu visa permanent residence hingga usia 55 tahun."
    },
    {
      q: "Apa itu kuliah Vokasi & Pilihan jurusan ?",
      a: "Program kuliah Vokasi adalah kuliah skill keahalian dan lebih banyak praktik lapangan, jadi bukan kuliah Akademik yang harus menyelesaikan Skipsi & mata kuliah tertentu.\n\nSeleksi ada 2 skema yaitu via interview dan dokumen.\n\n- Jurusan Caregiver & Beauty Non Topik (tidak perlu sertifikat bahasa Topik)\n- Jurusan selain Caregiver & Beauty WAJIB ADA TOPIK minimal Topik 3."
    },
    {
      q: "Kemampuan bahasa & seleksi interview ?",
      a: "Seleksi interview dimulai dari Perkenalan diri pakai bahasa korea dan dilanjut beberapa pertanyaan dasar lainnya, point penting adalah jika perkenalan diri lancar 90% diterima.\n\nBahasa menjadi wajib karena penyampaian materi menggunakan bahasa korea.\n\nStandar bahasa untuk PMI nilai EPS Topik adalah 85 dan bagi Pemula minimal sudah belajar bahasa 3 bulan, PMI yg habis Roster juga lebih dari cukup, Khusus Pemilik sertifikat TOPIK 3 ke atas ada beasiswa."
    },
    {
      q: "Apakah kerja sampingan dicarikan?",
      a: "Sebenarnya Kerja sampingan bebas untuk cari sendiri namun dari pihak agen di korea juga bisa bantu carikan jobnya.\n\nNamun setelah wisuda diberikan Visa E7 dan penempatan kerja oleh kampus sesuai bidang jurusan kuliahnya."
    },
    {
      q: "Apakah pendapatan cukup untuk bayar kuliah ?",
      a: "Gaji UMR korea tahun 2026 adalah KRW 10.200/jam.\n\nPerhitungan kerja sampingan:\n- Kerja 4 hari 8 jam dalam 1 bulan IDR 15.500.000\n- Libur semester 2 bulan gaji full day harian KRW 150.000 (IDR 1.800.000/hari) 6 hari kerja selama 2 bulan adalah IDR 85jt.\n\nArtinya penghasilan selama libur kuliah sudah mencukupi untuk membayar biaya UKT dan asrama."
    },
    {
      q: "Bagaimana Pembayaran proses?",
      a: "Pembayaran proses secara bertahap sesuai instruksi dan invoice dari kampus dan juga pembayaran langsung ke kampus."
    },
    {
      q: "Apakah lulusan SMA/SMK/MA/Paket C bisa mendaftar?",
      a: "Bisa! Persyaratan akademis minimal adalah lulusan SMA, SMK, Madrasah Aliyah (MA), atau Kejar Paket C setara SMA. Untuk Jalur D2 Vokasi usia maksimal mencapai 35 tahun, sedangkan Jalur D4 Bahasa maksimal 5 tahun setelah tahun kelulusan sekolah."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] font-sans antialiased selection:bg-[#0047A0] selection:text-white">
      
      {/* HEADER SECTION */}
      <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-[#E7EEFF] shadow-sm shadow-[0_4px_20px_-2px_rgba(0,71,160,0.06)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center h-20">
          
          {/* Brand Logo & Name */}
          <a href="#" className="flex items-center gap-1 hover:scale-[1.02] transition-transform duration-200">
            <div className="bg-[] p-1.5 rounded-xl">
              <img 
                alt="KOLA Logo" 
                className="h-15 w-auto rounded-lg" 
                src="/image/logo.png"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg md:text-xl font-extrabold text-[#003174] tracking-tight leading-none">
                K-BRIDGE
              </span>
              <span className="text-[9px] text-[#B81D2D] font-bold tracking-wider uppercase mt-0.5">
                EDU INTERNATIONAL
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 font-display text-sm font-semibold text-[#434752] relative z-10">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <motion.a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(item.id, e)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2 rounded-xl transition-colors duration-200 text-sm font-bold flex items-center ${
                    isActive ? "text-[#003174]" : "hover:text-[#003174]/80 text-[#5C6170]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-[#003174]/8 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                </motion.a>
              );
            })}
          </nav>

          {/* Consultation button */}
          <div className="flex items-center gap-3">
            <a 
              href="#konsultasi" 
              className="bg-[#B81D2D] hover:bg-[#A01321] text-white px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-display text-xs md:text-base font-extrabold text-center tracking-wider shadow-[0_5px_0_0_#003174] hover:shadow-[0_4px_0_0_#003174] hover:translate-y-[1px] active:translate-y-[5px] active:shadow-none transition-all duration-100 block"
            >
              KONSULTASI GRATIS
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-36 pb-20 md:py-44 overflow-hidden bg-gradient-to-b from-[#E7EEFF]/50 via-white to-transparent">
        {/* Background graphic assets */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#0047A0]/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-0 w-80 h-80 bg-[#B81D2D]/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column Content */}
            <div className="space-y-6 md:space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E7EEFF] text-[#003174] font-semibold text-xs md:text-sm tracking-wide">
                <Plane className="w-4 h-4 text-[#B81D2D] animate-bounce" />
                <span>✈️ Peluang Karir & Pendidikan Global</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#111C2D] tracking-tight leading-tight md:leading-none">
                JALAN PINTAS <br />
                <span className="text-[#003174] bg-gradient-to-r from-[#003174] to-[#275BB5] bg-clip-text text-transparent">
                  BEKERJA DI KOREA
                </span> <br />
                <span className="text-[#B81D2D]">SELATAN</span>
              </h1>
              
              <p className="text-[#434752] text-base md:text-lg lg:text-xl leading-relaxed max-w-xl">
                Wujudkan impian Anda untuk tinggal, belajar, dan berkarir profesional di Korea Selatan melalui program 
                <strong className="text-[#003174]"> Kuliah Vokasi resmi</strong> atau <strong className="text-[#003174]">Kuliah Bahasa</strong>. Bebas dari biaya jaminan yang ditahan agen!
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <a 
                  href="#konsultasi" 
                  className="bg-[#003174] hover:bg-[#0047A0] text-white px-8 py-3.5 rounded-xl font-display text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex items-center gap-2"
                >
                  Daftar Sekarang
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a 
                  href="#alur" 
                  className="bg-white hover:bg-[#F0F3FF] text-[#003174] border-2 border-[#003174] px-8 py-3.5 rounded-xl font-display text-sm font-bold hover:-translate-y-1 transition-all duration-200 text-center"
                >
                  Pelajari Alur
                </a>
              </div>

              {/* Minimalist Trust Info */}
              <div className="pt-6 border-t border-[#E7EEFF] flex items-center gap-6">
                <div className="flex -space-x-3">
                  <span className="w-10 h-10 rounded-full border-2 border-white bg-[#003174] text-white flex items-center justify-center font-bold text-xs">🎓</span>
                  <span className="w-10 h-10 rounded-full border-2 border-white bg-[#B81D2D] text-white flex items-center justify-center font-bold text-xs">💼</span>
                  <span className="w-10 h-10 rounded-full border-2 border-white bg-[#25354a] text-white flex items-center justify-center font-bold text-xs">✨</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111C2D]">98% Tingkat Kelulusan Visa</p>
                  <p className="text-xs text-[#737783]">Bimbingan dokumen & wawancara dijamin lulus</p>
                </div>
              </div>
            </div>

            {/* Right Column Image & Floating Badge */}
            <div className="relative mt-8 lg:mt-0">
              {/* Background solid framing */}
              <div className="absolute inset-0 bg-[#Afc6ff] rounded-3xl transform rotate-3 scale-105 -z-10 opacity-30 shadow-xl" />
              
              <div className="relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white aspect-[4/3] w-full bg-slate-100">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentSlide}
                    src={heroSlides[currentSlide]}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 w-full h-full object-cover" 
                    alt={`International students study and activities slide ${currentSlide + 1}`} 
                  />
                </AnimatePresence>

                {/* Slider Indicators */}
                <div className="absolute bottom-4 right-4 flex gap-1.5 z-20 bg-black/35 backdrop-blur-xs px-2.5 py-1.5 rounded-full">
                  {heroSlides.map((_, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => setCurrentSlide(sIdx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentSlide === sIdx ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${sIdx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Badge (Glassmorphic) */}
              <div className="absolute -bottom-6 -left-4 md:-left-6 glass-panel p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/60 animate-bounce" style={{ animationDuration: "4s" }}>
                <div className="bg-[#B81D2D]/10 p-2.5 rounded-xl text-[#B81D2D]">
                  <Award className="w-7 h-7 text-[#B81D2D]" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-[#003174]">Visa E7 & F2 Ready</p>
                  <p className="text-xs text-[#434752]">Jaminan Profesional & Keluarga</p>
                </div>
              </div>

              {/* Floating Badge (Secondary) */}
              <div className="absolute -top-6 -right-4 glass-panel p-3.5 rounded-xl shadow-lg flex items-center gap-2 border border-white/50">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                <span className="text-xs font-bold text-[#111C2D]">Pendaftaran Semester Ganjil Buka!</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TRUST MARQUEE SECTION */}
      <section className="py-8 bg-[#F0F3FF] border-y border-[#C3C6D4]/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center font-display text-xs md:text-sm font-bold text-[#737783] uppercase tracking-wider mb-5">
            Dipercaya Oleh Universitas & Vokasi Terkemuka di Korea Selatan
          </p>
          
          <div className="relative w-full flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-12 md:gap-20 py-2 pr-12 md:pr-20">
              <span className="text-base md:text-lg font-bold text-[#737783] hover:text-[#003174] transition-colors duration-300 cursor-default">Sahmyook Health University</span>
              <span className="text-base md:text-lg font-bold text-[#737783] hover:text-[#003174] transition-colors duration-300 cursor-default">Myongji University</span>
              <span className="text-base md:text-lg font-bold text-[#737783] hover:text-[#003174] transition-colors duration-300 cursor-default">Seojeong College</span>
              <span className="text-base md:text-lg font-bold text-[#737783] hover:text-[#003174] transition-colors duration-300 cursor-default">Kyunghee University</span>
              <span className="text-base md:text-lg font-bold text-[#737783] hover:text-[#003174] transition-colors duration-300 cursor-default">Seoul National University</span>
              <span className="text-base md:text-lg font-bold text-[#737783] hover:text-[#003174] transition-colors duration-300 cursor-default">Korea University</span>
            </div>
            
            {/* Repeated set for infinite scroll */}
            <div className="absolute top-0 left-0 animate-marquee2 whitespace-nowrap flex items-center gap-12 md:gap-20 py-2 pr-12 md:pr-20">
              <span className="text-base md:text-lg font-bold text-[#737783] hover:text-[#003174] transition-colors duration-300 cursor-default">Sahmyook Health University</span>
              <span className="text-base md:text-lg font-bold text-[#737783] hover:text-[#003174] transition-colors duration-300 cursor-default">Myongji University</span>
              <span className="text-base md:text-lg font-bold text-[#737783] hover:text-[#003174] transition-colors duration-300 cursor-default">Seojeong College</span>
              <span className="text-base md:text-lg font-bold text-[#737783] hover:text-[#003174] transition-colors duration-300 cursor-default">Kyunghee University</span>
              <span className="text-base md:text-lg font-bold text-[#737783] hover:text-[#003174] transition-colors duration-300 cursor-default">Seoul National University</span>
              <span className="text-base md:text-lg font-bold text-[#737783] hover:text-[#003174] transition-colors duration-300 cursor-default">Korea University</span>
            </div>
          </div>
        </div>
      </section>

      {/* KEY BENEFITS (Bento Grid) */}
      <section id="keunggulan" className="py-20 md:py-28 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#003174] font-bold text-xs md:text-sm tracking-wider uppercase bg-[#E7EEFF] px-3.5 py-1 rounded-full">
              Sistem Terpadu & Sukses
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#111C2D] mt-4 mb-4">
              Mengapa Memilih Program Kami?
            </h2>
            <p className="text-[#434752] text-sm md:text-base">
              Kami merancang sistem komprehensif untuk memastikan keberhasilan akademis, kenyamanan finansial, dan kesuksesan karir profesional Anda secara legal di Korea Selatan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-[#F0F3FF] rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 border-t-4 border-[#003174] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white text-[#003174] flex items-center justify-center mb-6 shadow-sm">
                  <DollarSign className="w-6 h-6 text-[#003174]" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#111C2D] mb-3">
                  Penghasilan Maksimal
                </h3>
                <p className="text-sm text-[#434752] leading-relaxed">
                  Potensi kerja paruh waktu yang terjamin selama kuliah hingga <strong className="text-[#003174]">Rp 15 Juta/bulan</strong>. Dan upah pokok karir profesional setelah lulus minimal <strong className="text-[#003174]">Rp 35 Juta/bulan</strong>.
                </p>
              </div>
              <span className="text-xs text-[#003174] font-bold mt-4 inline-flex items-center gap-1">
                Legal & Terjamin <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F9F9FF] rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 border-t-4 border-[#B81D2D] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white text-[#B81D2D] flex items-center justify-center mb-6 shadow-sm">
                  <Briefcase className="w-6 h-6 text-[#B81D2D]" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#111C2D] mb-3">
                  Jaminan Visa Profesional
                </h3>
                <p className="text-sm text-[#434752] leading-relaxed">
                  Lulus langsung ditempatkan bekerja dengan status <strong className="text-[#B81D2D]">Visa E7 (Profesi)</strong>. Setelah itu dapat di-upgrade ke <strong className="text-[#B81D2D]">Visa F2 (Residen Tetap)</strong> untuk memboyong keluarga inti Anda ke Korea.
                </p>
              </div>
              <span className="text-xs text-[#B81D2D] font-bold mt-4 inline-flex items-center gap-1">
                Keluarga Bisa Ikut <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F0F3FF] rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 border-t-4 border-[#003174] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white text-[#003174] flex items-center justify-center mb-6 shadow-sm">
                  <GraduationCap className="w-6 h-6 text-[#003174]" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#111C2D] mb-3">
                  Kuliah Berimbang & Kerja
                </h3>
                <p className="text-sm text-[#434752] leading-relaxed">
                  Kuliah Vokasi yang fleksibel, tatap muka hanya <strong className="text-[#003174]">2-3 hari seminggu</strong>. Sisa hari Anda sepenuhnya dibimbing untuk bekerja paruh waktu secara legal dan aman di Korea.
                </p>
              </div>
              <span className="text-xs text-[#003174] font-bold mt-4 inline-flex items-center gap-1">
                Bimbingan Cari Kerja <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Card 4 */}
            <div className="bg-[#F9F9FF] rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 border-t-4 border-[#B81D2D] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white text-[#B81D2D] flex items-center justify-center mb-6 shadow-sm">
                  <Award className="w-6 h-6 text-[#B81D2D]" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#111C2D] mb-3">
                  Peluang Beasiswa Luas
                </h3>
                <p className="text-sm text-[#434752] leading-relaxed">
                  Beasiswa masuk <strong className="text-[#B81D2D]">20% s.d 30%</strong> dari biaya kuliah untuk pendatang baru, dan tambahan beasiswa akademik prestasi hingga <strong className="text-[#B81D2D]">50%</strong> jika memiliki kualifikasi TOPIK 3.
                </p>
              </div>
              <span className="text-xs text-[#B81D2D] font-bold mt-4 inline-flex items-center gap-1">
                Meringankan Biaya <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* PROGRAM SELECTION SECTION */}
      <section id="program" className="py-20 md:py-28 bg-[#F0F3FF] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#003174] font-bold text-xs md:text-sm tracking-wider uppercase bg-white px-3.5 py-1 rounded-full shadow-sm">
              Temukan Masa Depan Anda
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#111C2D] mt-4 mb-4">
              Pilihan Jalur Program Resmi
            </h2>
            <p className="text-[#434752] text-sm md:text-base">
              Pilihlah jalur program pendaftaran yang paling sesuai dengan kualifikasi pendidikan, minat keahlian, dan kemampuan bahasa Korea Anda saat ini.
            </p>
            <div className="mt-6 bg-[#E7EEFF] border-l-4 border-[#003174] p-4 rounded-r-2xl max-w-2xl mx-auto text-xs md:text-sm flex items-center gap-3 shadow-xs">
              <span className="text-lg">📢</span>
              <p className="font-bold text-[#003174] text-left">
                Skema Seleksi: Seleksi penerimaan mahasiswa dengan skema interview secara langsung baik Online / offline.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-start">
            
            {/* Jalur D2 (Kuliah Vokasi) */}
            <div className="flex flex-col gap-6">
              <div className="relative overflow-hidden rounded-3xl group shadow-lg hover:shadow-xl transition-all duration-300 bg-[#003174]">
                {/* Image hotlink from HTML */}
                <img 
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 transform group-hover:scale-105 transition-transform duration-700" 
                  alt="Vocational class in Korea" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAANZpmOaUt3dFEQRoqergLPcgff9L4TTGdO2CKxp0CAP4nendjEP6hzTnH5va7nLj-1RFcoCPTjZC3sc1HVeOMqra7jo2WTk004FnyguDK3b68WNZuHNaIFAMU1wWzilrtpccjK5oukSvSX0JCuyi9EnxlMjrHRzoCpVgwJ96yuII2tbplCweSF4oGeNgtR6jX_Dk6taP8AUknY1EjwL4GXnUqG6oBO2auOv4tfWaf9_3UKx4MVY0HVg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#003174] via-[#003174]/70 to-transparent" />
                
                <div className="relative p-8 md:p-10 h-full flex flex-col justify-end min-h-[440px]">
                  <span className="bg-[#B81D2D]/90 text-white w-fit px-4 py-1.5 rounded-full font-display text-[10px] font-bold mb-4 uppercase tracking-wider">
                    👵 Jalur Langsung Vokasi (D2)
                  </span>
                  
                  <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-3">
                    Jalur D2 (Kuliah Vokasi - 2 Tahun)
                  </h3>
                  
                  <p className="text-white/90 text-xs md:text-sm mb-6 leading-relaxed">
                    <strong className="text-white">Tanpa syarat sertifikat TOPIK awal</strong> untuk jurusan Caregiver, K-Beauty, dan K-Bisnis. Masuk langsung kuliah 2 tahun dengan pola kuliah 2-3 hari dan sisa hari dijamin kerja sampingan resmi.
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-6 text-[11px] text-white/90">
                    <div className="flex items-center gap-1.5">
                      <span className="text-green-400">✓</span>
                      <span>Maksimal Umur 35 Tahun</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-green-400">✓</span>
                      <span>Bebas Nilai Rapor Minimum</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-green-400">✓</span>
                      <span>Beasiswa 20%-30% Newcomers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-green-400">✓</span>
                      <span>Kerja Profesional Visa E7</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedProgramDetail(selectedProgramDetail === "vokasi" ? null : "vokasi")}
                      className="bg-white text-[#003174] font-bold text-xs md:text-sm px-6 py-3 rounded-xl hover:bg-[#F9F9FF] transition-all flex items-center gap-1.5"
                    >
                      {selectedProgramDetail === "vokasi" ? "Tutup Detail" : "Lihat Jurusan & Syarat"}
                    </button>
                    <a href="#konsultasi" className="border-2 border-white text-white font-bold text-xs md:text-sm px-5 py-3 rounded-xl hover:bg-white/10 transition-all text-center">
                      Konsultasi
                    </a>
                  </div>
                </div>
              </div>

              {/* Vokasi Details Inline */}
              <AnimatePresence>
                {selectedProgramDetail === "vokasi" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white rounded-3xl p-6 border-2 border-[#E7EEFF] shadow-md space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-display font-extrabold text-lg text-[#003174]">
                            Ketentuan & Jurusan D2 Vokasi
                          </h4>
                          <p className="text-[11px] text-[#737783]">Pola kuliah vokasi praktis 2 tahun di Korea Selatan</p>
                        </div>
                        <button 
                          onClick={() => setSelectedProgramDetail(null)}
                          className="p-1 rounded-lg hover:bg-[#F0F3FF] text-[#737783]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-[#F0F3FF] border border-[#E7EEFF]">
                          <span className="text-2xl">👵</span>
                          <h5 className="font-bold text-sm text-[#111C2D] mt-2 mb-1">Caregiver & Global Care</h5>
                          <p className="text-xs text-[#434752] leading-relaxed">Jurusan dengan kuota paling melimpah. Tanpa syarat TOPIK bahasa Korea awal untuk pendaftaran. Penempatan kerja langsung pasca-lulus dengan prospek karir hingga usia 55 tahun.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F0F3FF] border border-[#E7EEFF]">
                          <span className="text-2xl">💅</span>
                          <h5 className="font-bold text-sm text-[#111C2D] mt-2 mb-1">K-Beauty (Kecantikan)</h5>
                          <p className="text-xs text-[#434752] leading-relaxed">Mempelajari tata rambut, kosmetika, kecantikan, dan perawatan kulit profesional langsung di kiblat tren kecantikan dunia.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F0F3FF] border border-[#E7EEFF]">
                          <span className="text-2xl">🍳</span>
                          <h5 className="font-bold text-sm text-[#111C2D] mt-2 mb-1">K-Bisnis & Hospitality</h5>
                          <p className="text-xs text-[#434752] leading-relaxed">Manajemen kuliner, perhotelan, manajemen tata boga, serta operasional bisnis internasional.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F5F7FF] border border-[#E7EEFF] flex flex-col justify-between">
                          <div>
                            <span className="text-sm font-bold text-[#003174] block mb-1">⚠️ Ketentuan Jurusan Lain</span>
                            <p className="text-[11px] text-[#434752] leading-relaxed">
                              Untuk bidang teknik/industri lainnya (elektrik, otomotif, mesin), pendaftar D2 wajib memiliki sertifikat TOPIK level 2-3 dari Indonesia. Jika belum punya, disarankan mengambil jalur D4 terlebih dahulu.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Jalur D4 (Kuliah Bahasa) */}
            <div className="flex flex-col gap-6">
              <div className="relative overflow-hidden rounded-3xl group shadow-lg hover:shadow-xl transition-all duration-300 bg-[#25354A]">
                {/* Image hotlink from HTML */}
                <img 
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 transform group-hover:scale-105 transition-transform duration-700" 
                  alt="Industrial class in Korea" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWJ881rOHKoxYmc-9NGLKQtE0rCzwEPe1FBzhsBAumv7eJTLJzO6iYyMRooYOiLrZB9Dc7tALGBVq_kua0cefMoBOosG12OF1sJAVNOWgDXpy-f0TuQJ7A0mH8MUjw1034fhugWK72fA5E63l5sGkwwW9GfYL93NExTamSXnMakzl9wFf-_hcD79dDY9ChYME1hSuKGBthLXsZ4JFdwP0qv3DvJaA_07XMPEe8SwNsQ3kP-y0Yna2Qxg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#25354A] via-[#25354A]/70 to-transparent" />
                
                <div className="relative p-8 md:p-10 h-full flex flex-col justify-end min-h-[440px]">
                  <span className="bg-[#003174]/90 text-white w-fit px-4 py-1.5 rounded-full font-display text-[10px] font-bold mb-4 uppercase tracking-wider">
                    💬 Jembatan Bahasa & Teknik (D4)
                  </span>
                  
                  <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-3">
                    Jalur D4 (Kuliah Bahasa - 6 s.d 12 Bulan)
                  </h3>
                  
                  <p className="text-white/90 text-xs md:text-sm mb-6 leading-relaxed">
                    <strong className="text-white">Tanpa seleksi masuk akademis awal (hanya dokumen)</strong>. Belajar bahasa Korea langsung di kampus tujuan selama 6-12 bulan untuk mengejar TOPIK 3, lalu lanjut kuliah D2 Vokasi jurusan teknik terlengkap.
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-6 text-[11px] text-white/90">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#Afc6ff]">✓</span>
                      <span>Umur Maksimal Lulus Sekolah + 5 Thn</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#Afc6ff]">✓</span>
                      <span>Nilai Rapor Rata-rata Min 7.5</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#Afc6ff]">✓</span>
                      <span>Sisa Semester Refundable jika TOPIK 3</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#Afc6ff]">✓</span>
                      <span>Prospek Visa Kerja E7 & E-7M (K-Core)</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedProgramDetail(selectedProgramDetail === "root" ? null : "root")}
                      className="bg-white text-[#25354A] font-bold text-xs md:text-sm px-6 py-3 rounded-xl hover:bg-[#F9F9FF] transition-all flex items-center gap-1.5"
                    >
                      {selectedProgramDetail === "root" ? "Tutup Detail" : "Lihat Jurusan & Syarat"}
                    </button>
                    <a href="#konsultasi" className="border-2 border-white text-white font-bold text-xs md:text-sm px-5 py-3 rounded-xl hover:bg-white/10 transition-all text-center">
                      Konsultasi
                    </a>
                  </div>
                </div>
              </div>

              {/* Root Details Inline */}
              <AnimatePresence>
                {selectedProgramDetail === "root" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white rounded-3xl p-6 border-2 border-[#E7EEFF] shadow-md space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-display font-extrabold text-lg text-[#25354A]">
                            Ketentuan & Jurusan D4 Bahasa
                          </h4>
                          <p className="text-[11px] text-[#737783]">Langkah aman menuju penguasaan bahasa Korea & karir industri</p>
                        </div>
                        <button 
                          onClick={() => setSelectedProgramDetail(null)}
                          className="p-1 rounded-lg hover:bg-[#F0F3FF] text-[#737783]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-[#F0F3FF] border border-[#E7EEFF]">
                          <span className="text-2xl">⚡</span>
                          <h5 className="font-bold text-sm text-[#111C2D] mt-2 mb-1">Elektrikal & Energi</h5>
                          <p className="text-xs text-[#434752] leading-relaxed">Jurusan Kendaraan Listrik, kelistrikan umum, energi terbarukan, dan teknik elektro modern di Korea.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F0F3FF] border border-[#E7EEFF]">
                          <span className="text-2xl">🚗</span>
                          <h5 className="font-bold text-sm text-[#111C2D] mt-2 mb-1">Otomotif & Mekanik</h5>
                          <p className="text-xs text-[#434752] leading-relaxed">Teknik mesin, manufaktur mobil, pengelasan tingkat tinggi, dan perakitan presisi bodi kendaraan Hyundai/Kia.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F0F3FF] border border-[#E7EEFF]">
                          <span className="text-2xl">🌾</span>
                          <h5 className="font-bold text-sm text-[#111C2D] mt-2 mb-1">Agro-Pangan & Smart Farming</h5>
                          <p className="text-xs text-[#434752] leading-relaxed">Teknologi pertanian modern berbasis kecerdasan buatan, rumah kaca otomatis, dan ketahanan pangan di Korea.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F5F7FF] border border-[#E7EEFF] flex flex-col justify-between">
                          <div>
                            <span className="text-sm font-bold text-[#003174] block mb-1">🎯 Jurusan Lainnya</span>
                            <p className="text-[11px] text-[#434752] leading-relaxed">
                              Tersedia juga program Tekstil dan Fashion, Teknik Mesin Konstruksi, dan bidang Engineering umum yang disupport Visa E-7-M (K-Core) terbaru.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Table Comparison matrix */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E7EEFF] shadow-sm overflow-x-auto">
            <h4 className="font-display font-extrabold text-lg text-[#111C2D] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#B81D2D]" />
              <span>Matriks Perbandingan Cepat Program (PDF Page 8)</span>
            </h4>
            <table className="w-full text-left border-collapse text-xs md:text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-[#E7EEFF] bg-[#F0F3FF] text-[#003174] font-bold text-center">
                  <th className="p-4 text-left">Aspek Perbandingan</th>
                  <th className="p-4">Jalur D4 (Kuliah Bahasa)</th>
                  <th className="p-4">Jalur D2 (Kuliah Vokasi)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E7EEFF]">
                  <td className="p-4 font-bold text-[#111C2D]">Pendaftaran</td>
                  <td className="p-4 text-center">Kapan saja (Sepanjang Tahun)</td>
                  <td className="p-4 text-center">2 kali dalam 1 tahun</td>
                </tr>
                <tr className="border-b border-[#E7EEFF]">
                  <td className="p-4 font-bold text-[#111C2D]">Seleksi Masuk</td>
                  <td className="p-4 text-center">Tidak ada seleksi akademis, hanya berkas</td>
                  <td className="p-4 text-center font-medium text-[#003174]">Seleksi Interview & Tes Tertulis kampus</td>
                </tr>
                <tr className="border-b border-[#E7EEFF]">
                  <td className="p-4 font-bold text-[#111C2D]">Uang Semester Awal</td>
                  <td className="p-4 text-center">Bayar penuh di depan (1 tahun / 4 sem)</td>
                  <td className="p-4 text-center">Bayar per 1 semester di depan</td>
                </tr>
                <tr className="border-b border-[#E7EEFF]">
                  <td className="p-4 font-bold text-[#111C2D]">Pilihan Kampus</td>
                  <td className="p-4 text-center text-green-600 font-medium">Banyak pilihan kampus & lokasi</td>
                  <td className="p-4 text-center">Kampus sudah ditentukan universitas mitra</td>
                </tr>
                <tr className="border-b border-[#E7EEFF]">
                  <td className="p-4 font-bold text-[#111C2D]">Batasan Jurusan</td>
                  <td className="p-4 text-center">Banyak pilihan prodi & jurusan kuliah</td>
                  <td className="p-4 text-center">Fokus utama Caregiver (*Jurusan lain terbatas)</td>
                </tr>
                <tr className="border-b border-[#E7EEFF]">
                  <td className="p-4 font-bold text-[#111C2D]">Jenis Visa Kerja Pasca Lulus</td>
                  <td className="p-4 text-center font-medium text-[#B81D2D]">Visa Kerja E7 & E-7M (K-Core)</td>
                  <td className="p-4 text-center font-medium text-[#003174]">Visa Kerja E7 Profesional</td>
                </tr>
                <tr className="border-b border-[#E7EEFF]">
                  <td className="p-4 font-bold text-[#111C2D]">Ikatan Kontrak Kerja</td>
                  <td className="p-4 text-center">Kontrak awal mulai pendaftaran kuliah</td>
                  <td className="p-4 text-center">Kontrak kerja resmi setelah lulus kuliah</td>
                </tr>
                <tr className="border-b border-[#E7EEFF]">
                  <td className="p-4 font-bold text-[#111C2D]">Persyaratan Umur</td>
                  <td className="p-4 text-center">Maksimal 5 tahun setelah lulus SMA/SMK</td>
                  <td className="p-4 text-center font-bold text-green-600">Maksimal 35 tahun (sangat fleksibel)</td>
                </tr>
                <tr className="border-b border-[#E7EEFF]">
                  <td className="p-4 font-bold text-[#111C2D]">Persyaratan Akademik</td>
                  <td className="p-4 text-center">Nilai rapor rata-rata minimal 7.5</td>
                  <td className="p-4 text-center text-green-600 font-medium">Tidak perlu syarat nilai rata-rata rapor</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Searchable Partner Universities Directory */}
          <div className="mt-12 bg-slate-50 rounded-3xl p-6 md:p-8 border border-[#E7EEFF] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h4 className="font-display font-extrabold text-lg md:text-xl text-[#003174] flex items-center gap-2">
                  <GraduationCap className="w-5.5 h-5.5 text-[#B81D2D]" />
                  <span>Direktori Universitas Mitra Resmi K-BRIDGE EDU INTERNATIONAL</span>
                </h4>
                <p className="text-xs text-[#737783] mt-1">Cari dan filter kampus impian Anda di Korea Selatan</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80 shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama kampus atau kota..."
                  value={univSearch}
                  onChange={(e) => setUnivSearch(e.target.value)}
                  className="w-full text-xs p-3 pl-10 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003174]/20 focus:border-[#003174]"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
              <button 
                onClick={() => setUnivCategory("all")}
                className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${
                  univCategory === "all" 
                    ? "bg-[#003174] text-white shadow-sm" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Semua Kampus ({partnerUniversities.length})
              </button>
              <button 
                onClick={() => setUnivCategory("caregiver")}
                className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${
                  univCategory === "caregiver" 
                    ? "bg-[#B81D2D] text-white shadow-sm" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                👵 Caregiver / Beauty / Business (20)
              </button>
              <button 
                onClick={() => setUnivCategory("technical")}
                className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${
                  univCategory === "technical" 
                    ? "bg-[#25354A] text-white shadow-sm" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                ⚡ Teknik / Engineering / Agro (16)
              </button>
              <button 
                onClick={() => setUnivCategory("root")}
                className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${
                  univCategory === "root" 
                    ? "bg-[#0047A0] text-white shadow-sm" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                🔩 Root Industry (14)
              </button>
            </div>

            {/* Grid of Universities */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {(() => {
                const filtered = partnerUniversities.filter(u => {
                  const matchCat = univCategory === "all" || u.type === univCategory;
                  const matchSearch = u.name.toLowerCase().includes(univSearch.toLowerCase()) || 
                                      u.location.toLowerCase().includes(univSearch.toLowerCase()) ||
                                      u.programs.some(p => p.toLowerCase().includes(univSearch.toLowerCase()));
                  return matchCat && matchSearch;
                });
                const displayed = showAllUniversities ? filtered : filtered.slice(0, 6);
                return displayed.map((u, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                        <h5 className="font-display font-bold text-xs sm:text-base text-[#111C2D] line-clamp-2 sm:line-clamp-none">
                          {u.name}
                        </h5>
                        <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                          u.type === "caregiver" 
                            ? "bg-red-50 text-[#B81D2D]" 
                            : u.type === "technical"
                            ? "bg-blue-50 text-[#003174]"
                            : "bg-slate-100 text-slate-800"
                        }`}>
                          {u.type === "caregiver" ? "Vokasi D2" : u.type === "technical" ? "Teknik D4" : "Root"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 mb-2 sm:mb-3">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#B81D2D]" />
                        <span className="truncate">{u.location}</span>
                      </div>

                      <p className="text-[10px] sm:text-xs text-slate-600 leading-normal sm:leading-relaxed mb-3 sm:mb-4 italic line-clamp-3 sm:line-clamp-none">
                        "{u.merit}"
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 sm:pt-3 border-t border-slate-100">
                      <div className="flex flex-wrap gap-1">
                        {u.programs.map((p, pIdx) => (
                          <span key={pIdx} className="text-[8px] sm:text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 sm:px-2.5 py-0.5 rounded-full truncate max-w-full">
                            {p}
                          </span>
                        ))}
                      </div>
                      <a 
                        href="#konsultasi" 
                        className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#003174] hover:text-[#B81D2D] transition-colors mt-1"
                      >
                        <span>Daftar</span>
                        <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </a>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Toggle Button for viewing more campuses */}
            {(() => {
              const filtered = partnerUniversities.filter(u => {
                const matchCat = univCategory === "all" || u.type === univCategory;
                const matchSearch = u.name.toLowerCase().includes(univSearch.toLowerCase()) || 
                                    u.location.toLowerCase().includes(univSearch.toLowerCase()) ||
                                    u.programs.some(p => p.toLowerCase().includes(univSearch.toLowerCase()));
                return matchCat && matchSearch;
              });
              if (filtered.length <= 6) return null;
              return (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setShowAllUniversities(!showAllUniversities)}
                    className="inline-flex items-center gap-2 bg-[#0047A0] hover:bg-[#003C88] text-white px-8 py-3 rounded-xl font-display text-xs md:text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span>{showAllUniversities ? "TAMPILKAN SEBAGIAN" : "LIHAT SEMUA"}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllUniversities ? "rotate-180" : ""}`} />
                  </button>
                </div>
              );
            })()}

            {partnerUniversities.filter(u => {
              const matchCat = univCategory === "all" || u.type === univCategory;
              const matchSearch = u.name.toLowerCase().includes(univSearch.toLowerCase()) || 
                                  u.location.toLowerCase().includes(univSearch.toLowerCase()) ||
                                  u.programs.some(p => p.toLowerCase().includes(univSearch.toLowerCase()));
              return matchCat && matchSearch;
            }).length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-dashed border-slate-300">
                <GraduationCap className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">Kampus tidak ditemukan</p>
                <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian lainnya.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* TIMELINE SECTION (Alur Pendaftaran) */}
      <section id="alur" className="py-20 md:py-28 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#B81D2D] font-bold text-xs md:text-sm tracking-wider uppercase bg-[#Fff5f5] px-3.5 py-1 rounded-full border border-red-100">
              Proses Transparan & Terjamin
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#111C2D] mt-4 mb-4">
              Alur Pendaftaran & Keberangkatan
            </h2>
            <p className="text-[#434752] text-sm md:text-base">
              Kami menjamin proses administrasi dan persiapan yang sangat transparan dan terstruktur rapi menuju keberangkatan mimpi besar Anda.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {timelineSteps.map((step, idx) => {
              const isOpen = selectedTimelineStep === idx;
              return (
                <div 
                  key={idx}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? "bg-white border-[#003174] shadow-md transform translate-x-1" 
                      : "bg-[#F9F9FF] border-[#E7EEFF] hover:bg-[#F0F3FF]"
                  }`}
                >
                  {/* Step Header Button */}
                  <button
                    onClick={() => setSelectedTimelineStep(isOpen ? -1 : idx)}
                    className="w-full text-left p-5 flex items-start sm:items-center gap-4 focus:outline-none"
                  >
                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isOpen 
                        ? "bg-[#003174] text-white" 
                        : "bg-[#E7EEFF] text-[#003174]"
                    }`}>
                      {idx + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isOpen ? "bg-[#E7EEFF] text-[#003174]" : "bg-[#F0F3FF] text-[#737783]"
                        }`}>
                          Tahap {idx + 1}
                        </span>
                        {isOpen && (
                          <span className="flex items-center gap-1 text-[9px] text-green-600 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span>Aktif</span>
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-sm md:text-base text-[#111C2D]">
                        {step.title}
                      </h4>
                    </div>

                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? "bg-[#003174]/10 text-[#003174] rotate-180" : "text-[#737783]"
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Step Expanded Content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 border-t border-gray-50 bg-[#F9F9FF]/30">
                          <p className="text-[#111C2D] font-medium text-xs md:text-sm mb-3 leading-relaxed">
                            {step.desc}
                          </p>

                          <div className="bg-white p-4 rounded-xl border border-[#E7EEFF] shadow-inner text-xs text-[#434752] leading-relaxed">
                            {step.details}
                          </div>

                          <div className="mt-4 pt-4 border-t border-[#E7EEFF]/60 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                            <span className="text-xs text-[#737783] font-bold flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                              <span>Bimbingan penuh dari agen Korea Edu Work</span>
                            </span>
                            <a 
                              href="#konsultasi" 
                              className="text-xs font-bold text-[#003174] hover:text-[#B81D2D] transition-colors flex items-center gap-1"
                            >
                              <span>Tanya Min-Ji terkait tahap ini</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FINANCIAL TRANSPARENCY SECTION (Biaya) */}
      <section id="biaya" className="py-20 bg-[#003174] text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="bg-[#B81D2D] text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                100% Bebas Jaminan / Deposit Uang Ditahan
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">
                Transparansi Biaya <br />
                <span className="text-yellow-400">ALL IN: Rp 75 Juta</span>
              </h2>
              <p className="text-white/85 text-base md:text-lg leading-relaxed">
                Kami sangat menjunjung tinggi integritas. Seluruh rincian biaya pendaftaran kuliah, penerjemahan dokumen, visa, asuransi kesehatan, bimbingan, hingga tiket pesawat adalah <strong className="text-white">pembayaran resmi kampus Anda sendiri</strong>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                  <Check className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Virtual Account Resmi</h4>
                    <p className="text-xs text-white/70">Pembayaran langsung ke akun Virtual Account resmi universitas Anda di Korea Selatan.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                  <Check className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Pembayaran Bertahap</h4>
                    <p className="text-xs text-white/70">Biaya pendaftaran dan administrasi dapat dicicil per tahapan visa secara transparan.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                  <Check className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Sudah Termasuk Semester 1</h4>
                    <p className="text-xs text-white/70">Sudah mencakup uang pendaftaran dan SPP/UKT resmi Semester pertama di Korea.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                  <Check className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Tanpa Jaminan Ditahan</h4>
                    <p className="text-xs text-white/70">Sama sekali tidak ada uang puluhan juta ditahan agen sebagai jaminan pendaftaran.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Payment Calculator card */}
            <div className="lg:col-span-5 bg-white text-[#111C2D] rounded-3xl p-6 md:p-8 shadow-xl border border-[#E7EEFF]">
              <h3 className="font-display font-extrabold text-xl text-[#003174] mb-2">
                Simulasi Keuangan Mandiri
              </h3>
              <p className="text-xs text-[#737783] mb-6">
                Berapa tabungan yang bisa Anda kumpulkan di Korea dengan kuliah & part-time?
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm p-3 bg-[#F0F3FF] rounded-xl border border-[#E7EEFF]">
                  <span className="text-[#434752]">Estimasi Gaji Sampingan (Bulan)</span>
                  <span className="font-bold text-[#003174]">~ Rp 15.000.000</span>
                </div>

                <div className="flex justify-between items-center text-sm p-3 bg-[#F0F3FF] rounded-xl border border-[#E7EEFF]">
                  <span className="text-[#434752]">Estimasi Biaya Hidup + Asrama</span>
                  <span className="font-bold text-[#B81D2D]">- Rp 5.000.000</span>
                </div>

                <div className="flex justify-between items-center text-sm p-3 bg-green-50 rounded-xl border border-green-200">
                  <span className="text-green-800 font-bold">Potensi Tabungan Bersih / Bln</span>
                  <span className="font-extrabold text-green-700">~ Rp 10.000.000</span>
                </div>

                <div className="pt-4 border-t border-[#E7EEFF]">
                  <p className="text-[11px] text-[#737783] leading-relaxed text-center mb-4">
                    *Estimasi di atas dihitung berdasarkan upah minimum kerja paruh waktu resmi di Korea Selatan tahun 2026/2027 (~₩9,860/jam).
                  </p>
                  
                  <a 
                    href="#konsultasi" 
                    className="block w-full bg-[#B81D2D] hover:bg-[#92001B] text-white text-center py-3 rounded-xl font-display text-sm font-bold shadow-md transition-colors"
                  >
                    Dapatkan Penawaran & Kuota
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* INTERACTIVE REGISTRATION & AI CONSULTATION SECTION */}
      <section id="konsultasi" className="py-20 md:py-28 bg-[#F0F3FF] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#003174] font-bold text-xs md:text-sm tracking-wider uppercase bg-white px-3.5 py-1 rounded-full shadow-sm">
              Formulir & Konseling Virtual
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#111C2D] mt-4 mb-4">
              Mulai Konsultasi & Pendaftaran Gratis
            </h2>
            <p className="text-[#434752] text-sm md:text-base">
              Silakan isi formulir pendaftaran kelayakan pendaftaran di bawah atau tanyakan apa pun langsung ke asisten AI virtual kami yang siaga 24 jam.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Lead Form */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#E7EEFF] flex flex-col justify-between">
              <div>
                <h3 className="font-display font-extrabold text-lg text-[#003174] mb-1 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#B81D2D]" />
                  <span>Formulir Cek Kelayakan & Pendaftaran</span>
                </h3>
                <p className="text-xs text-[#737783] mb-6">
                  Isi data Anda untuk mendapatkan jadwal interview universitas dan bimbingan dokumen.
                </p>

                {submitSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center space-y-4 overflow-hidden"
                  >
                    {/* Confetti Animation Effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                      {confettiParticles.map((p) => (
                        <motion.div
                          key={p.id}
                          initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                          animate={{ 
                            x: p.x, 
                            y: p.y, 
                            scale: [0, 1.2, 1, 0],
                            rotate: p.rotation,
                            opacity: [1, 1, 0.7, 0]
                          }}
                          transition={{ 
                            duration: 1.8, 
                            ease: [0.1, 0.8, 0.3, 1],
                            delay: p.delay
                          }}
                          style={{
                            position: "absolute",
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            borderRadius: p.id % 3 === 0 ? "50%" : p.id % 3 === 1 ? "0%" : "2px",
                          }}
                        />
                      ))}
                    </div>

                    {/* Animated Checkmark SVG */}
                    <div className="relative flex justify-center py-2">
                      <motion.svg
                        width="72"
                        height="72"
                        viewBox="0 0 50 50"
                        initial="hidden"
                        animate="visible"
                        className="z-10"
                      >
                        <motion.circle
                          cx="25"
                          cy="25"
                          r="22"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="3"
                          variants={circleVariants}
                        />
                        <motion.path
                          d="M15 26 l7 7 l14 -14"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          variants={tickVariants}
                        />
                      </motion.svg>
                    </div>

                    <h4 className="font-display font-bold text-lg text-green-800 z-10 relative">Pendaftaran Berhasil Terkirim!</h4>
                    <p className="text-sm text-green-700 leading-relaxed z-10 relative">
                      Halo <strong className="text-green-900">{formData.name}</strong>, data kelayakan pendaftaran Anda telah tercatat dalam sistem kami.
                    </p>
                    <p className="text-xs text-[#434752] z-10 relative">
                      Tim konsultan kami (Heri Purwanto) akan menghubungi Anda via WhatsApp di nomor pendaftaran Anda sesegera mungkin.
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center z-10 relative">
                      <a 
                        href={`https://wa.me/6281290490066?text=Halo%20Korea%20Edu%20Work%2C%20saya%20sudah%20mengisi%20formulir%20pendaftaran%20atas%20nama%20${encodeURIComponent(formData.name)}.%20Mohon%20jadwal%20konsultasi%20selanjutnya.`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg inline-flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" /> Hubungi WhatsApp Sekarang
                      </a>
                      <button 
                        onClick={() => setSubmitSuccess(false)}
                        className="bg-[#E7EEFF] text-[#003174] text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#D8E2FF]"
                      >
                        Isi Formulir Baru
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    
                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1">Nama Lengkap *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Heri Purwanto"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full text-sm p-3 rounded-xl border border-[#C3C6D4] focus:outline-none focus:border-[#003174] focus:ring-2 focus:ring-[#003174]/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1">Nomor WhatsApp *</label>
                        <input 
                          type="tel" 
                          required
                          placeholder="Contoh: 081290490066"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                          className="w-full text-sm p-3 rounded-xl border border-[#C3C6D4] focus:outline-none focus:border-[#003174] focus:ring-2 focus:ring-[#003174]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1">Alamat Email (Opsional)</label>
                        <input 
                          type="email" 
                          placeholder="alamat@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full text-sm p-3 rounded-xl border border-[#C3C6D4] focus:outline-none focus:border-[#003174] focus:ring-2 focus:ring-[#003174]/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1">Pendidikan Terakhir *</label>
                        <select 
                          value={formData.education}
                          onChange={(e) => setFormData({...formData, education: e.target.value})}
                          className="w-full text-sm p-3 rounded-xl border border-[#C3C6D4] bg-white focus:outline-none focus:border-[#003174]"
                        >
                          <option>SMA/SMK</option>
                          <option>Madrasah Aliyah (MA)</option>
                          <option>Paket C</option>
                          <option>Diploma (D3)</option>
                          <option>Sarjana (S1)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#111C2D] mb-1">Jalur Minat Program *</label>
                        <select 
                          value={formData.programOfInterest}
                          onChange={(e) => setFormData({...formData, programOfInterest: e.target.value})}
                          className="w-full text-sm p-3 rounded-xl border border-[#C3C6D4] bg-white focus:outline-none focus:border-[#003174]"
                        >
                          <option>Jalur Vokasi (Kuliah & Kerja)</option>
                          <option>Jalur Root Industry (Teknis)</option>
                          <option>Belum Tahu / Butuh Saran</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111C2D] mb-1">Catatan Tambahan / Profil Singkat</label>
                      <textarea 
                        rows={3}
                        placeholder="Tuliskan pengalaman kerja atau pertanyaan khusus Anda..."
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full text-sm p-3 rounded-xl border border-[#C3C6D4] focus:outline-none focus:border-[#003174]"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#003174] hover:bg-[#0047A0] disabled:bg-slate-400 text-white font-display font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Memproses pendaftaran...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Kirim Data Pendaftaran Gratis</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-6 p-4 bg-[#F0F3FF] rounded-2xl border border-[#E7EEFF] text-xs text-[#737783] flex items-center gap-3">
                <span className="text-xl">🔒</span>
                <p>Kami menjamin kerahasiaan data pribadi Anda. Data Anda hanya akan digunakan untuk koordinasi interview bersama kampus resmi.</p>
              </div>
            </div>

            {/* Right Chat Consultant */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-md border border-[#E7EEFF] flex flex-col justify-between">
              
              {/* Chat Header */}
              <div className="pb-4 border-b border-[#E7EEFF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#003174]/10 border border-[#003174]/20 flex items-center justify-center text-xl">
                    🌸
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm md:text-base text-[#003174] flex items-center gap-1.5">
                      <span>Min-Ji (Konsultan AI)</span>
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                    </h3>
                    <p className="text-[10px] text-[#737783]">Aktif 24 Jam • Bahasa Indonesia</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] bg-[#E7EEFF] text-[#003174] px-2 py-1 rounded-full font-bold">
                  <Sparkles className="w-3 h-3 text-[#B81D2D]" />
                  <span>Powered by Gemini</span>
                </div>
              </div>

              {/* Chat Message list */}
              <div className="flex-1 overflow-y-auto max-h-[300px] py-4 space-y-3 pr-1 text-sm">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-3.5 ${
                      msg.role === "user" 
                        ? "bg-[#003174] text-white rounded-tr-none" 
                        : "bg-[#F0F3FF] text-[#111C2D] rounded-tl-none border border-[#E7EEFF]"
                    }`}>
                      <div className="text-xs leading-relaxed md:text-sm">
                        <Markdown components={chatMarkdownComponents}>
                          {msg.text}
                        </Markdown>
                      </div>
                    </div>
                  </div>
                ))}

                {aiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#F0F3FF] text-[#111C2D] rounded-2xl p-3.5 rounded-tl-none border border-[#E7EEFF]">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#003174] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-[#003174] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-[#003174] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat quick prompts & text box */}
              <div className="pt-4 border-t border-[#E7EEFF] space-y-3">
                
                {/* Quick prompts */}
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      disabled={aiTyping}
                      onClick={() => handleSendMessage(undefined, q)}
                      className="text-[10px] font-semibold text-[#003174] bg-[#F0F3FF] hover:bg-[#D8E2FF] border border-[#E7EEFF] rounded-lg px-2 py-1 transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text"
                    disabled={aiTyping}
                    placeholder="Tulis pertanyaan Anda di sini..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-1 text-xs md:text-sm p-3 rounded-xl border border-[#C3C6D4] bg-white focus:outline-none focus:border-[#003174]"
                  />
                  <button 
                    type="submit"
                    disabled={aiTyping || !userInput.trim()}
                    className="bg-[#003174] hover:bg-[#0047A0] disabled:bg-slate-300 text-white p-3 rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section id="faq" className="py-20 md:py-28 bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          
          <div className="text-center mb-16">
            <span className="text-[#003174] font-bold text-xs md:text-sm tracking-wider uppercase bg-[#E7EEFF] px-3.5 py-1 rounded-full">
              Pertanyaan yang Sering Diajukan
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#111C2D] mt-4 mb-4">
              Paling Sering Ditanyakan (FAQ)
            </h2>
            <p className="text-[#434752] text-sm md:text-base">
              Berikut adalah kompilasi jawaban dari pertanyaan-pertanyaan mendasar terkait keberangkatan, biaya, dan kemitraan Korea Edu Work.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-[#E7EEFF] rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => setFaqOpen({ ...faqOpen, [idx]: !faqOpen[idx] })}
                  className="w-full flex justify-between items-center p-5 text-left bg-white hover:bg-[#F9F9FF] transition-colors"
                >
                  <span className="font-display font-bold text-[#111C2D] text-sm md:text-base pr-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#B81D2D] shrink-0" />
                    {faq.q}
                  </span>
                  {faqOpen[idx] ? (
                    <ChevronUp className="w-5 h-5 text-[#737783] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#737783] shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {faqOpen[idx] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-[#F9F9FF] border-t border-[#E7EEFF]"
                    >
                      <div className="p-5 text-xs md:text-sm text-[#434752] leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="bg-[#25354A] text-white pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-white/10">
            
            {/* Column 1: Brand */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-1">
                <div className="bg-white p-1 rounded-xl">
                  <img 
                    alt="KOLA Logo" 
                    className="h-10 w-auto rounded-lg" 
                    src="/image/logo.png"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-lg font-extrabold text-white tracking-tight">
                    K-BRIDGE
                  </span>
                  <span className="text-[9px] text-[#Afc6ff] font-bold tracking-wider uppercase">
                    K-BRIDGE EDU INTERNATIONAL
                  </span>
                </div>
              </div>
              <p className="text-white/80 text-xs md:text-sm leading-relaxed max-w-sm">
                Jalan Pintas Bekerja di Korea Selatan. Kami adalah partner jembatan pendidikan vokasi dan karir profesional terpercaya yang resmi dan transparan di Indonesia.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <div className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                   Indonesia
                </div>
                <div className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                   South Korea
                </div>
              </div>
            </div>

            {/* Column 2: Kontak */}
            <div className="md:col-span-3 space-y-4 text-xs md:text-sm">
              <h4 className="font-display font-bold uppercase tracking-wider text-white/50 text-xs">
                Hubungi Kami
              </h4>
              <ul className="space-y-2.5 text-white/80">
                <li className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#Afc6ff] shrink-0" />
                  <span>Heri Purwanto (Konsultan Utama)</span>
                </li>
                <li>
                  <a 
                    href="https://wa.me/6281290490066" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors group"
                  >
                    <Phone className="w-4 h-4 text-[#Afc6ff] group-hover:scale-110 transition-transform" />
                    <span>WhatsApp: 0812-9049-0066</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:h3r1woori@gmail.com" 
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4 text-[#Afc6ff]" />
                    <span>Email: h3r1woori@gmail.com</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Lokasi */}
            <div className="md:col-span-4 space-y-4 text-xs md:text-sm">
              <h4 className="font-display font-bold uppercase tracking-wider text-white/50 text-xs">
                Lokasi Kantor
              </h4>
              <div className="flex gap-2 text-white/80 leading-relaxed">
                <MapPin className="w-5 h-5 text-[#Afc6ff] shrink-0 mt-0.5" />
                <address className="not-italic">
                  Pondok Gede,<br />
                  Kec. Pondok Gede, Kota Bekasi,<br />
                  Jawa Barat, Indonesia
                </address>
              </div>
              <div className="pt-1">
                <a 
                  href="#konsultasi"
                  className="inline-flex items-center gap-1.5 bg-[#Afc6ff] hover:bg-white text-[#25354A] font-bold text-xs px-3.5 py-2 rounded-lg transition-colors"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Konsultasi AI Virtual</span>
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Footer Credits */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
            <p>© 2024 - 2026 K-BRIDGE EDU INTERNATIONAL. All Rights Reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-white">Kebijakan Privasi</a>
              <button 
                onClick={() => {
                  setShowCounselorPortal(true);
                  if (!isUnlocked) {
                    setPasscode("");
                    setPortalError("");
                  }
                }}
                className="text-[#Afc6ff] hover:underline font-bold flex items-center gap-1"
              >
                <Lock className="w-3 h-3" /> Portal Konselor
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* FLOAT CHAT ICON & CONSOLE */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        
        {/* Confirmed Alert bubble if user submits lead */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-[#003174] text-white p-4 rounded-2xl shadow-xl max-w-[280px] text-xs space-y-2 border border-white/20"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold">✨ Pendaftaran Disimpan!</span>
                <button onClick={() => setSubmitSuccess(false)}><X className="w-3.5 h-3.5" /></button>
              </div>
              <p className="text-white/80 leading-relaxed">Hubungi Kak Heri via WhatsApp langsung agar jadwal interview bisa diamankan segera.</p>
              <a 
                href="https://wa.me/6281290490066"
                target="_blank"
                rel="noreferrer"
                className="block text-center bg-[#B81D2D] hover:bg-[#92001B] py-1.5 rounded-lg font-bold"
              >
                Chat WhatsApp
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Chat widget panel */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-[#E7EEFF] w-[340px] md:w-[380px] overflow-hidden flex flex-col h-[480px]"
            >
              {/* Chat panel header */}
              <div className="bg-[#003174] text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">
                    🌸
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm leading-tight">Min-Ji (AI Konsultan)</h4>
                    <span className="text-[10px] text-white/70">Online • Balasan Instan</span>
                  </div>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="text-white/85 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat panel message space */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9F9FF] text-xs">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                      msg.role === "user" ? "bg-[#003174] text-white rounded-tr-none" : "bg-white text-[#111C2D] border border-[#E7EEFF] rounded-tl-none"
                    }`}>
                      <div className="text-xs leading-relaxed">
                        <Markdown components={chatMarkdownComponents}>
                          {msg.text}
                        </Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {aiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-[#E7EEFF] p-3 rounded-xl rounded-tl-none">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#003174] rounded-full animate-pulse" />
                        <span className="w-1.5 h-1.5 bg-[#003174] rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-[#003174] rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat panel quick prompts */}
              <div className="p-3 bg-white border-t border-[#E7EEFF] space-y-2">
                <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
                  <button 
                    disabled={aiTyping}
                    onClick={() => handleSendMessage(undefined, "Berapa biayanya?")}
                    className="text-[9px] bg-[#F0F3FF] text-[#003174] font-bold px-2 py-1 rounded-lg border border-[#E7EEFF] shrink-0"
                  >
                    Biaya? 💰
                  </button>
                  <button 
                    disabled={aiTyping}
                    onClick={() => handleSendMessage(undefined, "Apa saja jurusan vokasi?")}
                    className="text-[9px] bg-[#F0F3FF] text-[#003174] font-bold px-2 py-1 rounded-lg border border-[#E7EEFF] shrink-0"
                  >
                    Jurusan? 🎓
                  </button>
                  <button 
                    disabled={aiTyping}
                    onClick={() => handleSendMessage(undefined, "Apakah ada syarat umur?")}
                    className="text-[9px] bg-[#F0F3FF] text-[#003174] font-bold px-2 py-1 rounded-lg border border-[#E7EEFF] shrink-0"
                  >
                    Syarat Umur? 🔞
                  </button>
                </div>
                
                {/* Chat panel box */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }} 
                  className="flex gap-1.5"
                >
                  <input 
                    type="text"
                    disabled={aiTyping}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ketik pertanyaan untuk Min-Ji..."
                    className="flex-1 bg-[#F9F9FF] border border-[#C3C6D4] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#003174]"
                  />
                  <button 
                    type="submit"
                    disabled={aiTyping || !userInput.trim()}
                    className="bg-[#003174] hover:bg-[#0047A0] text-white p-2.5 rounded-xl transition-colors disabled:bg-slate-300"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Buttons */}
        <div className="flex gap-2">
          {/* Scroll to top */}
          {showScrollTop && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-[#25354A] hover:bg-[#111C2D] text-white p-3 rounded-full shadow-lg transition-transform duration-200 hover:scale-110"
              title="Kembali ke atas"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          )}

          {/* Chat toggle button */}
          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className="bg-[#B81D2D] hover:bg-[#92001B] text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all duration-200 relative group"
            title="Konsultasi AI Instan"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute right-full mr-2 bg-[#003174] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
              Konsultasi AI Virtual 🌸
            </span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full border-2 border-white animate-ping" />
          </button>
        </div>

      </div>

      {/* COUNSELOR PORTAL (CRM MODAL) */}
      <AnimatePresence>
        {showCounselorPortal && (
          <div className="fixed inset-0 bg-[#111C2D]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-[#E7EEFF] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              
              {/* Header */}
              <div className="bg-[#25354A] text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-[#Afc6ff]" />
                  <div>
                    <h3 className="font-display font-extrabold text-base md:text-lg">Portal CRM Calon Peserta Korea Edu Work</h3>
                    <p className="text-xs text-white/70">Kelola dan lihat leads pendaftaran siswa secara real-time</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCounselorPortal(false)}
                  className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Portal Content */}
              {!isUnlocked ? (
                /* Unlocked Section */
                <div className="p-8 max-w-md mx-auto text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#E7EEFF] text-[#003174] flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-display font-bold text-lg text-[#111C2D]">Sandi Akses Konselor Diperlukan</h4>
                    <p className="text-xs text-[#737783] leading-relaxed">
                      Masukkan kode sandi otentikasi admin untuk melihat database calon pendaftar yang masuk ke server.
                    </p>
                  </div>

                  <form onSubmit={handleUnlockPortal} className="space-y-3">
                    <input 
                      type="password"
                      placeholder="Masukkan kata sandi"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full text-center p-3 rounded-xl border border-[#C3C6D4] text-sm focus:outline-none focus:border-[#003174]"
                    />
                    {portalError && <p className="text-xs text-[#B81D2D] font-bold">{portalError}</p>}
                    
                    <button 
                      type="submit"
                      className="w-full bg-[#003174] hover:bg-[#0047A0] text-white font-display font-bold py-3 rounded-xl shadow-md text-sm transition-colors"
                    >
                      Buka Database Leads
                    </button>
                  </form>
                </div>
              ) : (
                /* Active CRM Dashboard Section */
                <div className="p-6 flex-1 flex flex-col overflow-hidden text-sm">
                  
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-4 mb-4 border-b border-[#E7EEFF]">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-[#737783] absolute left-3 top-3.5" />
                      <input 
                        type="text" 
                        placeholder="Cari nama, WhatsApp, email..."
                        value={leadsSearch}
                        onChange={(e) => setLeadsSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#C3C6D4] text-xs focus:outline-none focus:border-[#003174]"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button 
                        onClick={fetchLeads}
                        disabled={leadsLoading}
                        className="p-2 rounded-xl border border-[#C3C6D4] hover:bg-[#F0F3FF] text-[#003174] transition-colors flex items-center gap-1 text-xs"
                        title="Segarkan data"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${leadsLoading ? "animate-spin" : ""}`} />
                        <span>Refresh ({leads.length})</span>
                      </button>
                      <button 
                        onClick={() => {
                          setIsUnlocked(false);
                          setPasscode("");
                        }}
                        className="p-2 rounded-xl border border-[#C3C6D4] hover:bg-red-50 text-[#B81D2D] transition-colors text-xs font-bold"
                      >
                        Kunci Sesi
                      </button>
                    </div>
                  </div>

                  {/* Leads Data Grid */}
                  <div className="flex-1 overflow-auto rounded-xl border border-[#E7EEFF]">
                    {leadsLoading ? (
                      <div className="p-12 text-center text-[#737783] space-y-2">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#003174]" />
                        <p className="text-xs">Sedang memuat data calon peserta...</p>
                      </div>
                    ) : leads.length === 0 ? (
                      <div className="p-12 text-center text-[#737783] space-y-2 bg-[#F9F9FF]">
                        <Users className="w-10 h-10 mx-auto text-[#C3C6D4]" />
                        <h5 className="font-bold text-sm text-[#111C2D]">Database Masih Kosong</h5>
                        <p className="text-xs max-w-xs mx-auto">
                          Belum ada calon peserta yang mendaftar. Silakan isi form di website terlebih dahulu untuk mencobanya!
                        </p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                        <thead>
                          <tr className="bg-[#F0F3FF] text-[#003174] font-bold border-b border-[#E7EEFF]">
                            <th className="p-3">Tanggal Masuk</th>
                            <th className="p-3">Nama Lengkap</th>
                            <th className="p-3">Nomor WhatsApp</th>
                            <th className="p-3">Pendidikan</th>
                            <th className="p-3">Jalur Minat</th>
                            <th className="p-3">Pesan / Profil</th>
                            <th className="p-3 text-center">Tindakan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads
                            .filter(l => 
                              l.name.toLowerCase().includes(leadsSearch.toLowerCase()) ||
                              l.whatsapp.includes(leadsSearch) ||
                              l.email.toLowerCase().includes(leadsSearch.toLowerCase())
                            )
                            .map((l, index) => (
                              <tr key={l.id} className="border-b border-[#E7EEFF] hover:bg-[#F9F9FF] transition-colors">
                                <td className="p-3 text-[#737783] font-mono whitespace-nowrap">
                                  {new Date(l.createdAt).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </td>
                                <td className="p-3 font-bold text-[#111C2D]">{l.name}</td>
                                <td className="p-3 font-mono font-medium text-[#003174]">{l.whatsapp}</td>
                                <td className="p-3">
                                  <span className="bg-[#E7EEFF] text-[#003174] px-2 py-0.5 rounded-full font-bold text-[10px]">
                                    {l.education}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                    l.programOfInterest.includes("Vokasi") 
                                      ? "bg-green-50 text-green-700 border border-green-100" 
                                      : "bg-[#Fff5f5] text-[#B81D2D] border border-red-100"
                                  }`}>
                                    {l.programOfInterest}
                                  </span>
                                </td>
                                <td className="p-3 text-[#434752] max-w-[180px] truncate" title={l.message}>
                                  {l.message || "-"}
                                </td>
                                <td className="p-3 text-center">
                                  <a 
                                    href={`https://wa.me/${l.whatsapp.replace(/^0/, "62")}?text=Halo%20${encodeURIComponent(l.name)}%2C%20saya%20Heri%20Purwanto%20dari%20Korea%20Edu%20Work.%20Terima%20kasih%20telah%20mendaftar%20di%20website%20kami.`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors inline-block"
                                  >
                                    Chat WA
                                  </a>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="pt-4 mt-2 text-center text-xs text-[#737783]">
                    Menampilkan total <strong className="text-[#003174]">{leads.length}</strong> data leads pendaftar resmi.
                  </div>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
