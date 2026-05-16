"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useInView, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import api from "@/lib/api";
import MagneticButton from "@/components/MagneticButton";
import { t, type Locale } from "@/lib/i18n";
import Logo from "@/components/Logo";

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function useLiveCounter(target: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let startTime: number | null = null;
    const duration = 2000;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target]);
  return count;
}

function TypewriterWord({ word, delay }: { word: string; delay: number }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(word.slice(0, i));
        if (i >= word.length) clearInterval(interval);
      }, 60);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [word, delay]);
  return (
    <span>
      {displayed}
      <span className="inline-block w-0.5 h-[1em] bg-[#00D4AA] ml-0.5 animate-pulse align-middle" />
    </span>
  );
}

function AnimatedStepNumber({ target, inView: show }: { target: number; inView: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!show) return;
    const duration = 600;
    const start = performance.now();
    const raf = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [show, target]);
  return <>{show ? String(val).padStart(2, "0") : "00"}</>;
}

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 25 });
  const springY = useSpring(y, { stiffness: 200, damping: 25 });
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(50);
  const bgShine = useSpring(shineX);
  const bgShineY = useSpring(shineY);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (e.clientX - rect.left - cx) / cx;
    const dy = (e.clientY - rect.top - cy) / cy;
    x.set(-dy * 10);
    y.set(dx * 14);
    shineX.set(50 + dx * 30);
    shineY.set(50 + dy * 30);
  }, [x, y, shineX, shineY]);

  const handleMouseLeave = useCallback(() => {
    x.set(0); y.set(0); shineX.set(50); shineY.set(50);
  }, [x, y, shineX, shineY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200, rotateX: springY, rotateY: springX }}
      className={`relative ${className}`}
    >
      {children}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl z-10"
        style={{
          background: bgShine.get() && bgShineY.get()
            ? `radial-gradient(circle at ${bgShine.get()}% ${bgShineY.get()}%, rgba(255,255,255,0.06) 0%, transparent 60%)`
            : "transparent",
        }}
      />
    </motion.div>
  );
}

function ScrollIndicator({ locale }: { locale: Locale }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <div className="w-6 h-10 rounded-full border border-[#00D4AA]/30 flex justify-center pt-2">
        <div className="w-1 h-2 rounded-full bg-[#00D4AA] animate-[scrollDot_1.5s_ease-in-out_infinite]" />
      </div>
      <span className="text-[10px] text-[#64748B] font-medium tracking-widest uppercase">
        {t(locale, "scroll.hint")}
      </span>
      <style>{`
        @keyframes scrollDot {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(10px); opacity: 0.3; }
        }
      `}</style>
    </motion.div>
  );
}

const StepIconRx = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const ShieldIcon = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const TruckIcon = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const testimonials = [
  { name: "Dr. Ahmed Mansour", pharmacy: "Pharmacie Centrale", city: "Tunis", initials: "AM", text: "Depuis PharmaGo, zéro erreur de livraison. Le suivi en temps réel a transformé notre service.", rating: 5 },
  { name: "Pr. Sonia Bouaziz", pharmacy: "Pharmacie El Amal", city: "Sfax", initials: "SB", text: "Nos patients adorent le suivi en temps réel. Notre taux de satisfaction a grimpé de 40%.", rating: 5 },
  { name: "Dr. Karim Trabelsi", pharmacy: "Pharmacie Ibn Sina", city: "Sousse", initials: "KT", text: "ROI positif dès le premier mois. L'équipe a adopté l'outil en moins d'une semaine.", rating: 5 },
  { name: "Dr. Nadia Mehdi", pharmacy: "Pharmacie Nour", city: "Ariana", initials: "NM", text: "La gestion des ordonnances contrôlées est maintenant un jeu d'enfant. PharmaGo nous fait gagner 2h par jour.", rating: 5 },
  { name: "Pr. Youssef Gharbi", pharmacy: "Pharmacie Essalam", city: "Bizerte", initials: "YG", text: "Interface intuitive, support réactif. Je recommande PharmaGo à chaque pharmacien tunisien.", rating: 5 },
];

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/public/newsletter", { email });
      setDone(true);
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Inscrit avec succès !" } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Erreur, réessayez" } }));
    } finally {
      setLoading(false);
    }
  };
  return done ? (
    <p className="text-xs text-[#00C9A7]">Merci pour votre inscription !</p>
  ) : (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.com"
        required
        className="flex-1 px-3 py-2 rounded-lg bg-[#0A1628] border border-[#00D4AA]/20 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#00D4AA] transition-colors"
      />
      <button type="submit" disabled={loading}
        className="px-4 py-2 rounded-lg bg-[#00D4AA] text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
        {loading ? "..." : "S'abonner"}
      </button>
    </form>
  );
}

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 4000);
    return () => clearInterval(interval);
  }, [autoplay]);

  return (
    <div className="relative max-w-2xl mx-auto" onMouseEnter={() => setAutoplay(false)} onMouseLeave={() => setAutoplay(true)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="bg-[#020814] border border-[#00D4AA]/20 rounded-2xl p-8 text-center"
        >
          <div className="flex gap-1 mb-4 justify-center">
            {Array.from({ length: testimonials[current].rating }).map((_, si) => <StarIcon key={si} />)}
          </div>
          <div className="opacity-20 mb-4 flex justify-center"><QuoteIcon /></div>
          <p className="text-base text-[#E2E8F0] leading-relaxed mb-6">"{testimonials[current].text}"</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00D4AA]/20 flex items-center justify-center text-xs font-bold text-[#00D4AA]">
              {testimonials[current].initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{testimonials[current].name}</div>
              <div className="text-xs text-[#64748B]">{testimonials[current].pharmacy}, {testimonials[current].city}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => { setCurrent(i); setAutoplay(false); }}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{ background: i === current ? "#00C9A7" : "rgba(255,255,255,0.2)", width: i === current ? "24px" : "8px" }} />
        ))}
      </div>
    </div>
  );
}
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#00D4AA" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const QuoteIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
  </svg>
);

/* FAQ */
const ChevronDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const faqItems = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
  { qKey: "faq.q5", aKey: "faq.a5" },
  { qKey: "faq.q6", aKey: "faq.a6" },
  { qKey: "faq.q7", aKey: "faq.a7" },
];
const PharmaciesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const ShieldCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 12 15 16 10"/>
  </svg>
);

function PharmacyCounter() {
  const [count, setCount] = useState(12);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const targets = [12, 27, 43, 58, 71, 82, 93, 101, 112];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCount(targets[i] ?? 112);
      if (i >= targets.length - 1) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [inView]);
  return <span ref={ref} className="text-5xl font-bold text-[#00D4AA]">{count}</span>;
}

function FAQAccordion({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {faqItems.map((item, i) => (
        <div key={i} className="bg-[#020814] border border-[#00D4AA]/20 rounded-lg overflow-hidden transition-all duration-300 hover:border-[#00D4AA]/40">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full px-5 py-4 flex items-center justify-between text-left">
            <span className="text-sm font-medium text-white pr-4">{t(locale, item.qKey)}</span>
            <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[#00D4AA] flex-shrink-0">
              <ChevronDownIcon />
            </motion.div>
          </button>
          <motion.div initial={false} animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <p className="px-5 pb-4 text-sm text-[#E2E8F0] leading-relaxed">{t(locale, item.aKey)}</p>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

const LockIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const KeyIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);
const LayersIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);
const ClockIcon2 = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const EyeIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const FileIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

function DemoButton({ locale }: { locale: Locale }) {
  const [hovered, setHovered] = useState(false);
  const handleScroll = () => {
    document.getElementById("demo-form")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <button
      onClick={handleScroll}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative px-5 py-2 rounded-btn text-sm font-medium text-white overflow-hidden bg-[#00D4AA] border border-[#00D4AA] shadow-[0_4px_14px_rgba(0,212,170,0.3)] transition-all duration-300 hover:bg-[#059669]"
    >
      {hovered && (
        <span
          className="absolute inset-0 rounded-btn"
          style={{
            background: "conic-gradient(from 0deg, transparent, rgba(0,212,170,0.3), transparent, rgba(0,212,170,0.3), transparent)",
            animation: "spinBorder 1.5s linear infinite",
          }}
        />
      )}
      <span className="relative z-10">{t(locale, "nav.demo")}</span>
      <style>{`
        @keyframes spinBorder { to { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
}

function LocaleToggle({ locale, onToggle }: { locale: Locale; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="relative w-14 h-7 rounded-full bg-[#F0FDF9] border border-[#A7F3D0] transition-all duration-200 hover:border-[#00D4AA]">
      <motion.span
        className="absolute top-0.5 w-6 h-6 rounded-full bg-[#00D4AA] flex items-center justify-center text-[10px] font-semibold text-white"
        animate={{ left: locale === "ar" ? "calc(100% - 26px)" : "2px" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {locale === "ar" ? "AR" : "FR"}
      </motion.span>
    </button>
  );
}

const prescriptionCards = [
  { drug: "Paracetamol 500mg", status: "VERIFIED", label: "Verified", color: "border-l-primary-400", dot: "bg-primary-400", badgeClass: "bg-primary-500/10 text-primary-400" },
  { drug: "Tramadol 100mg", status: "HIGH_RISK", label: "High Risk", color: "border-l-danger-400", dot: "bg-danger-400 animate-pulse", badgeClass: "bg-danger-500/10 text-danger-400" },
  { drug: "Amoxicillin 250mg", status: "PENDING", label: "Pending", color: "border-l-warning-400", dot: "bg-warning-400 animate-pulse", badgeClass: "bg-warning-500/10 text-warning-400" },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [locale, setLocale] = useState<Locale>("fr");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const secureCount = useLiveCounter(1295);
  const lineRef = useRef<SVGLineElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-100px" });

  const [form, setForm] = useState({ name: "", pharmacy: "", city: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    const savedLocale = localStorage.getItem("lang") as Locale | null;
    if (savedLocale) setLocale(savedLocale);
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowStickyCta(window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", locale);
  }, [locale]);

  const isRtl = locale === "ar";
  const headline1 = t(locale, "hero.headline1");
  const headline2 = t(locale, "hero.headline2");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: res } = await (await import("@/lib/api")).default.post("/public/demo-request", {
        name: form.name,
        pharmacy: form.pharmacy,
        city: form.city,
        phone: form.phone,
        message: form.message,
      });
      setSubmitted(true);
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Demande envoyée ! Nous vous contacterons bientôt." } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Erreur lors de l'envoi. Veuillez réessayer." } }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020814] text-white overflow-x-hidden" dir={isRtl ? "rtl" : "ltr"}>

      {/* NAVBAR */}
      <nav
        className={`fixed top-0 ${isRtl ? "left-0 right-0" : "left-0 right-0"} z-50 transition-all duration-300 ${
          scrolled ? "bg-[#020814]/80 backdrop-blur-xl border-b border-[#00D4AA]/20" : "bg-transparent"
        }`}
      >
        <div className={`max-w-7xl mx-auto px-6 h-16 flex items-center ${isRtl ? "flex-row-reverse" : "justify-between"}`}>
          <Logo className="h-8 w-auto" />
          <div className="hidden md:flex items-center gap-4">
            <LocaleToggle locale={locale} onToggle={() => setLocale(isRtl ? "fr" : "ar")} />
            <a href="/register/pharmacy" className="px-4 py-2 rounded-btn text-sm font-medium text-[#00D4AA] border border-[#00D4AA]/30 hover:border-[#00D4AA] hover:bg-[#00D4AA]/10 transition-all duration-200">
              Inscrire ma pharmacie →
            </a>
            <a href="/login" className="px-4 py-2 rounded-btn text-sm font-medium text-white bg-[#00D4AA] hover:bg-[#009B7D] transition-all duration-200">
              Se connecter
            </a>
            <DemoButton locale={locale} />
            {showStickyCta && (
              <motion.a
                href="/register/pharmacy"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-2 rounded-btn text-sm font-semibold bg-[#00D4AA] text-white hover:bg-[#009B7D] shadow-[0_4px_14px_rgba(0,212,170,0.3)] transition-all duration-200"
              >
                Inscrire ma pharmacie →
              </motion.a>
            )}
          </div>
          <button className="md:hidden w-9 h-9 flex items-center justify-center text-[#64748B]" onClick={() => setMobileMenu(!mobileMenu)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileMenu ? (
                <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              )}
            </svg>
          </button>
        </div>
        {mobileMenu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:hidden fixed inset-0 top-16 z-40 bg-[#020814]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6">
            <LocaleToggle locale={locale} onToggle={() => setLocale(isRtl ? "fr" : "ar")} />
            <a href="/register/pharmacy" className="px-4 py-2 rounded-btn text-sm font-medium text-[#00D4AA] border border-[#00D4AA]/30">
              Inscrire ma pharmacie →
            </a>
            <a href="/login" className="px-4 py-2 rounded-btn text-sm font-medium text-white bg-[#00D4AA]">
              Se connecter
            </a>
            <DemoButton locale={locale} />
          </motion.div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#020814]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full" style={{ width: "60vw", height: "60vw", top: "-10%", right: "-15%", background: "radial-gradient(circle, rgba(0,212,170,0.25) 0%, transparent 70%)", animation: "blob1 20s ease-in-out infinite alternate" }} />
          <div className="absolute rounded-full" style={{ width: "50vw", height: "50vw", bottom: "-10%", left: "-10%", background: "radial-gradient(circle, rgba(0,212,170,0.15) 0%, transparent 70%)", animation: "blob2 18s ease-in-out infinite alternate" }} />
          <div className="absolute rounded-full" style={{ width: "40vw", height: "40vw", top: "40%", left: "30%", background: "radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 60%)", animation: "blob3 25s ease-in-out infinite alternate" }} />
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-[#00D4AA]" style={{
              width: (i % 3 === 0 ? 2 : 1) + "px",
              height: (i % 3 === 0 ? 2 : 1) + "px",
              left: (i * 4.13 % 100) + "%",
              top: (i * 7.7 % 100) + "%",
              opacity: 0.4,
              animation: `particleFloat ${8 + (i % 7)}s ease-in-out ${i * 0.4}s infinite`,
            }} />
          ))}
          <style>{`
            @keyframes blob1 { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,-30px) scale(1.1); } 100% { transform: translate(-20px,40px) scale(0.95); } }
            @keyframes blob2 { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,40px) scale(1.05); } 100% { transform: translate(30px,-20px) scale(0.9); } }
            @keyframes particleFloat { 0%,100% { transform: translateY(0) translateX(0); opacity: 0.4; } 25% { transform: translateY(-40px) translateX(10px); opacity: 0.5; } 50% { transform: translateY(-80px) translateX(-5px); opacity: 0.2; } 75% { transform: translateY(-120px) translateX(8px); opacity: 0.4; } }
          `}</style>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={staggerItem}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D4AA]/10 text-xs font-medium text-[#00D4AA] border border-[#00D4AA]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
                  {t(locale, "hero.badge")}
                </div>
              </motion.div>

              <motion.h1 variants={staggerItem} className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
                  <motion.span
                    initial={{ opacity: 0, y: 40, clipPath: "inset(0 0 100% 0)" }}
                    animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
                    transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                    className="block"
                  >
                    {headline1}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 40, clipPath: "inset(0 0 100% 0)" }}
                    animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
                    transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                    className="block text-[#00D4AA]"
                  >
                    <TypewriterWord word={headline2} delay={0.7} />
                  </motion.span>
                </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="text-base text-[#E2E8F0] max-w-md leading-relaxed"
              >
                {t(locale, "hero.subheadline")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
                <span className="text-sm text-[#64748B]">{t(locale, "hero.counter")}</span>
                <span className="text-lg font-bold text-[#00D4AA] tabular-nums font-mono">
                  {secureCount.toLocaleString()}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <MagneticButton
                  onClick={() => document.getElementById("demo-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="group px-6 py-3 rounded-btn text-sm font-semibold bg-[#00D4AA] text-white hover:bg-[#059669] transition-all duration-200 active:scale-[0.96] flex items-center gap-2 shadow-[0_4px_14px_rgba(0,212,170,0.3)]"
                >
                  {t(locale, "hero.cta.primary")}
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                </MagneticButton>
                <MagneticButton
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-6 py-3 rounded-btn text-sm font-medium border border-[#00D4AA]/30 text-[#00D4AA] hover:bg-[#00D4AA]/10 transition-all duration-200 active:scale-[0.96]"
                >
                  {t(locale, "hero.cta.secondary")}
                </MagneticButton>
              </motion.div>
            </motion.div>

            {/* Dashboard Card */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="hidden lg:block"
            >
              <div className="relative" style={{ animation: "cardFloat 4s ease-in-out infinite" }}>
                <div className="absolute -bottom-4 left-[10%] w-[80%] h-10 rounded-full bg-primary-400/20 blur-[60px]" />
                <style>{`@keyframes cardFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }`}</style>
                <TiltCard>
                  <div
                    className="p-5 rounded-xl relative"
                    style={{
                      background: "#0A1628",
                      backdropFilter: "blur(24px)",
                      border: "1px solid rgba(0,212,170,0.2)",
                      boxShadow: "0 4px 20px rgba(0,212,170,0.15), 0 0 0 1px rgba(0,212,170,0.1)",
                      borderRadius: "16px",
                    }}
                  >
                    <div className="absolute top-0 left-4 right-4 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,170,0.6), transparent)", filter: "blur(1px)" }} />
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#00D4AA]/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
                        <span className="text-xs font-medium text-white">{t(locale, "queue.title")}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2D]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {prescriptionCards.map((p, i) => (
                        <div key={i} className={`rounded-lg p-3 border-l-2 ${p.color}`} style={{ background: "rgba(0,212,170,0.08)", backdropFilter: "blur(12px)" }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                              <span className="text-xs text-[#E2E8F0] font-medium">{p.drug}</span>
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.badgeClass}`}>{p.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="h-9 rounded-btn bg-[#00D4AA]/20 flex items-center justify-center cursor-default">
                        <span className="text-xs font-medium text-[#00D4AA]">{t(locale, "queue.verify")}</span>
                      </div>
                      <div className="h-9 rounded-btn bg-[#00D4AA]/10 flex items-center justify-center cursor-default">
                        <span className="text-xs font-medium text-[#E2E8F0]">{t(locale, "queue.dispense")}</span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </motion.div>
          </div>
        </div>

        <ScrollIndicator locale={locale} />
      </section>

      {/* TRUST BAR */}
      <section className="relative border-t border-[#00D4AA]/10 py-5 overflow-hidden bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-[10px] text-[#00D4AA] font-semibold uppercase tracking-[0.15em] whitespace-nowrap">
              {t(locale, "trust.label")}
            </span>
            <div className="flex-1 h-px bg-[#00D4AA]/20" />
          </div>
          <div className="overflow-hidden">
            <div className="flex gap-8" style={{ width: "max-content", animation: "trustScroll 40s linear infinite" }}>
              {[...Array(2)].map((_, loop) => (
                <div key={loop} className="flex gap-8 items-center">
                  {["Fernet-256", "HMAC-SHA256", "bcrypt", "JWT RS256", "Rate Limiting", "AES Encryption", "Zero PII Logs", "OTP Lockout", "Audit Trail"].map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-[#64748B] whitespace-nowrap">
                      <span className="text-[#00D4AA] text-xs">.</span>
                      <span className="text-xs font-mono">{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes trustScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        `}</style>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative py-24 bg-[#020814]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">{t(locale, "section.fonctionnement")}</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3 text-white">{t(locale, "section.fonctionnement.title")}</h2>
            </div>
          </Reveal>

          <div className="relative grid md:grid-cols-3 gap-8">
            <svg className="absolute top-16 left-[8%] w-[84%] h-2 hidden md:block overflow-visible" viewBox="0 0 800 8">
              <defs>
                <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="30%" stopColor="rgba(0,212,170,0.4)" />
                  <stop offset="70%" stopColor="rgba(0,212,170,0.4)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <line x1="0" y1="4" x2="800" y2="4" stroke="rgba(0,212,170,0.2)" strokeWidth="1.5" strokeDasharray="6 8" />
              <line ref={lineRef} x1="0" y1="4" x2="800" y2="4" stroke="url(#flowGrad)" strokeWidth="2" strokeDasharray="6 8" strokeDashoffset={lineInView ? "0" : "800"} className={lineInView ? "flow-line" : ""} />
            </svg>
            <style>{`.flow-line { animation: flowDash 1.5s linear infinite; } @keyframes flowDash { to { stroke-dashoffset: -28; } }`}</style>

            {[
              { num: 1, icon: StepIconRx, titleKey: "step1.title", descKey: "step1.desc" },
              { num: 2, icon: ShieldIcon, titleKey: "step2.title", descKey: "step2.desc" },
              { num: 3, icon: TruckIcon, titleKey: "step3.title", descKey: "step3.desc" },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 0.1}>
                <motion.div
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 30 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative bg-[#0A1628] border border-[#00D4AA]/20 rounded-card shadow-[0_4px_20px_rgba(0,212,170,0.1)] p-8 text-center md:text-left transition-all duration-300 hover:border-[#00D4AA] hover:shadow-[0_8px_30px_rgba(0,212,170,0.25)]"
                >
                  <span className="text-6xl font-bold text-[#00D4AA]/20 block mb-4 tracking-tight leading-none"><AnimatedStepNumber target={step.num} inView={lineInView} /></span>
                  <div className="mb-4 flex justify-center md:justify-start">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t(locale, step.titleKey)}</h3>
                  <p className="text-sm text-[#E2E8F0] leading-relaxed">{t(locale, step.descKey)}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHOM */}
      <section className="relative py-24 bg-[#0D1E32]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">{t(locale, "section.cible")}</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3 text-white">{t(locale, "section.cible.title")}</h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { roleKey: "pharmacien", icon: LockIcon, benefitKeys: ["pharmacien.b1", "pharmacien.b2", "pharmacien.b3"] },
              { roleKey: "patient", icon: EyeIcon, benefitKeys: ["patient.b1", "patient.b2", "patient.b3"] },
              { roleKey: "medecin", icon: KeyIcon, benefitKeys: ["medecin.b1", "medecin.b2", "medecin.b3"] },
            ].map((item, i) => (
              <Reveal key={item.roleKey} delay={i * 0.1}>
                <motion.div
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 30 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-[#0A1628] border border-[#00D4AA]/20 rounded-card shadow-[0_4px_20px_rgba(0,212,170,0.1)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#00D4AA] hover:shadow-[0_8px_30px_rgba(0,212,170,0.25)]"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-3">{t(locale, item.roleKey)}</h3>
                  <ul className="space-y-2">
                    {item.benefitKeys.map((bk) => (
                      <li key={bk} className="text-sm text-[#E2E8F0] flex items-start gap-2">
                        <span className="text-[#00D4AA] mt-0.5">{"\u2713"}</span>
                        <span>{t(locale, bk)}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative py-24 bg-[#0A1628]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Témoignages</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3 text-white">Ils nous font confiance</h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <Reveal key={item.name} delay={i * 0.1}>
                <motion.div
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 30 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-[#020814] border border-[#00D4AA]/20 rounded-card p-6 transition-all duration-300 hover:border-[#00D4AA]/50 hover:shadow-[0_8px_30px_rgba(0,212,170,0.15)]"
                >
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: item.rating }).map((_, si) => <StarIcon key={si} />)}
                  </div>
                  <div className="opacity-30 mb-4"><QuoteIcon /></div>
                  <p className="text-sm text-[#E2E8F0] leading-relaxed mb-5">"{item.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00D4AA]/20 flex items-center justify-center text-xs font-bold text-[#00D4AA]">
                      {item.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-[#64748B]">{item.pharmacy}, {item.city}</div>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.4}>
            <div className="mt-16">
              <p className="text-center text-xs text-white/30 uppercase tracking-widest mb-8">Ce qu&apos;ils disent de nous</p>
              <TestimonialCarousel />
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHY PHARMAGO */}
      <section className="relative py-24 bg-[#020814]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Pourquoi PharmaGo</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3 text-white">Du chaos à la confiance</h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8">
            <Reveal>
              <motion.div
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -40 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="bg-[#0A1628]/50 border border-red-500/20 rounded-card p-8"
              >
                <div className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span>✕</span> Avant PharmaGo
                </div>
                <ul className="space-y-3">
                  {["Ordonnances perdues ou illisibles", "Livreurs non vérifiés, risqués", "Erreurs médicales parfois fatales", "Aucun suivi, zéro traçabilité", "Patients mécontents et inquiets"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[#E2E8F0]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Reveal>

            <Reveal>
              <motion.div
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: 40 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="bg-[#0A1628]/50 border border-[#00D4AA]/30 rounded-card p-8"
              >
                <div className="text-[#00D4AA] text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span>✓</span> Avec PharmaGo
                </div>
                <ul className="space-y-3">
                  {["Traçabilité complète de bout en bout", "Livreurs certifiés + OTP patient", "Zéro erreur médicale vérifiée", "Dashboard temps réel pharmacien", "Patients rassurés, pharmacies notées"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[#E2E8F0]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

{/* SECURITY */}
      <section className="relative py-24 bg-[#020814]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">{t(locale, "section.securite")}</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3 text-white">{t(locale, "section.securite.title")}</h2>
              <p className="text-sm text-[#64748B] mt-3 max-w-lg mx-auto">{t(locale, "section.securite.sub")}</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: LockIcon, titleKey: "security.fernet", descKey: "security.fernet.desc" },
              { icon: KeyIcon, titleKey: "security.hmac", descKey: "security.hmac.desc" },
              { icon: LayersIcon, titleKey: "security.bcrypt", descKey: "security.bcrypt.desc" },
              { icon: ClockIcon2, titleKey: "security.rate", descKey: "security.rate.desc" },
              { icon: EyeIcon, titleKey: "security.pii", descKey: "security.pii.desc" },
              { icon: FileIcon, titleKey: "security.audit", descKey: "security.audit.desc" },
            ].map((card, i) => (
              <motion.div
                key={card.titleKey}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                className="bg-[#0A1628] border border-[#00D4AA]/20 rounded-card shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-5 transition-all duration-300 group hover:border-[#00D4AA] hover:shadow-[0_0_30px_rgba(0,212,170,0.3)]">
                  <div className="w-10 h-10 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-115 group-hover:bg-[#00D4AA]/20">
                    {card.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{t(locale, card.titleKey)}</h3>
                  <p className="text-xs text-[#E2E8F0] leading-relaxed">{t(locale, card.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative py-24 bg-[#0D1E32]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">{t(locale, "section.tarifs")}</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3 text-white">{t(locale, "section.tarifs.title")}</h2>
            </div>
          </Reveal>

          <Reveal>
            <div className="flex items-center justify-center gap-3 mb-12">
              <span className="text-sm text-white/50">Mensuel</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-14 h-7 rounded-full bg-[#0A1628] border border-[#00D4AA]/30 transition-all"
              >
                <motion.span
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-[#00D4AA] flex items-center justify-center"
                  animate={{ left: isAnnual ? "calc(100% - 26px)" : "2px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </button>
              <span className="text-sm text-white/50">Annuel</span>
              <span className="text-xs px-2 py-1 rounded-full bg-[#00D4AA]/20 text-[#00D4AA] font-medium border border-[#00D4AA]/30">-2 mois</span>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { plan: "starter", popular: false },
              { plan: "pro", popular: true },
              { plan: "enterprise", popular: false },
            ].map((tier, i) => {
              const monthlyPrice = tier.plan === "starter" ? 200 : tier.plan === "pro" ? 450 : 900;
              const annualPrice = Math.round(monthlyPrice * 10);
              const displayPrice = isAnnual ? annualPrice : monthlyPrice;
              return (
                <Reveal key={tier.plan} delay={i * 0.1}>
                  <motion.div
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 30 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`relative bg-[#0A1628] border rounded-card p-6 transition-all duration-300 ${
                      tier.popular
                        ? "border-[#00D4AA] shadow-[0_8px_30px_rgba(0,212,170,0.25)] scale-105"
                        : "border-[#00D4AA]/20 shadow-[0_4px_20px_rgba(0,212,170,0.1)] hover:border-[#00D4AA]/50 hover:shadow-[0_8px_30px_rgba(0,212,170,0.2)]"
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-[#00D4AA] text-white text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                          {t(locale, "pricing.popular")}
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">{t(locale, `pricing.${tier.plan}.title`)}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <motion.span
                          key={displayPrice}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-4xl font-bold text-white"
                        >
                          {displayPrice}
                        </motion.span>
                        <span className="text-sm text-[#64748B]">TND</span>
                        <span className="text-xs text-[#64748B]">/{isAnnual ? "an" : t(locale, "pricing.period")}</span>
                      </div>
                      {isAnnual && <p className="text-xs text-[#00C9A7] mt-1">Économisez 2 mois</p>}
                    </div>
                    <ul className="space-y-3 mb-4">
                      {(tier.plan === "starter" ? [1, 2, 3] : tier.plan === "pro" ? [1, 2, 3, 4] : [1, 2, 3, 4, 5]).map((n) => (
                        <li key={n} className="flex items-center gap-2 text-sm text-[#E2E8F0]">
                          <span className="w-1 h-1 rounded-full bg-[#00D4AA]" />
                          {t(locale, `pricing.${tier.plan}.feature${n}`)}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-[#64748B] mb-4">
                      {tier.plan === "starter" ? "Idéal pour démarrer · 1 pharmacie" :
                       tier.plan === "pro" ? "Le plus populaire · Livraisons illimitées" :
                       "Pour les groupes · Multi-branches"}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-[#00D4AA] mb-4">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      14 jours gratuits
                    </div>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* DEMO REQUEST */}
      <section id="demo-form" className="relative py-24 bg-[#020814]">
        <div className="max-w-lg mx-auto px-6">
          <Reveal>
            <div className="bg-[#0A1628] border border-[#00D4AA]/20 rounded-card shadow-[0_4px_20px_rgba(0,212,170,0.1)] p-8 md:p-10">
              {!submitted ? (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">{t(locale, "demo.title")}</h2>
                    <p className="text-sm text-[#64748B] mt-2">{t(locale, "demo.sub")}</p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {(["name", "pharmacy", "city", "phone"] as const).map((field) => (
                      <div key={field} className="relative">
                        <input
                          id={`demo-${field}`}
                          type={field === "phone" ? "tel" : "text"}
                          value={form[field]}
                          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                          onFocus={() => setFocused(field)}
                          onBlur={() => setFocused(null)}
                          required
                          className="w-full px-4 pt-6 pb-2 rounded-btn bg-[#0D1E32] border border-[#00D4AA]/20 text-white text-sm placeholder-transparent text-start focus:outline-none focus:border-[#00D4AA] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] transition-all duration-200 peer"
                          placeholder={t(locale, `demo.${field}`)}
                        />
                        <label htmlFor={`demo-${field}`} className={`absolute start-4 transition-all duration-200 pointer-events-none ${
                          focused === field || form[field] ? "top-2 text-[10px] text-[#00D4AA]" : "top-3.5 text-sm text-[#64748B]"
                        }`}>
                          {t(locale, `demo.${field}`)}
                        </label>
                      </div>
                    ))}

                    <div className="relative">
                      <textarea id="demo-message" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                        onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                        className="w-full px-4 pt-6 pb-2 rounded-btn bg-[#0D1E32] border border-[#00D4AA]/20 text-white text-sm placeholder-transparent focus:outline-none focus:border-[#00D4AA] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] transition-all duration-200 peer resize-none"
                        placeholder={t(locale, "demo.message")} />
                      <label htmlFor="demo-message" className={`absolute start-4 transition-all duration-200 pointer-events-none ${
                        focused === "message" || form.message ? "top-2 text-[10px] text-[#00D4AA]" : "top-3.5 text-sm text-[#64748B]"
                      }`}>{t(locale, "demo.message")}</label>
                    </div>

                    <MagneticButton type="submit" disabled={submitting}
                      className="w-full py-3 rounded-btn text-sm font-semibold bg-[#00D4AA] text-white hover:bg-[#009B7D] transition-all duration-200 active:scale-[0.96] disabled:opacity-70 shadow-[0_4px_14px_rgba(0,212,170,0.3)]">
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          {t(locale, "demo.loading")}
                        </span>
                      ) : t(locale, "demo.submit")}
                    </MagneticButton>
                  </form>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <svg className="mx-auto mb-4" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path d="M20 6L9 17L4 12" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: "easeInOut" }} />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">{t(locale, "demo.success")}</h3>
                  <p className="text-sm text-[#E2E8F0]">{t(locale, "demo.success.sub")}</p>
                </motion.div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="relative py-24 bg-[#0A1628]">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3 text-white">Questions fréquentes</h2>
            </div>
          </Reveal>
          <Reveal>
            <FAQAccordion locale={locale} />
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 bg-[#020814]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Reveal>
            <div className="mb-6 flex items-center justify-center gap-2 text-[#00D4AA]">
              <PharmaciesIcon />
              <span className="text-sm font-medium">Pharmacies actives ce mois</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
              Rejoignez les pharmacies qui modernisent leurs livraisons
            </h2>
            <p className="text-base text-[#64748B] mb-10">
              Conçu pour le secteur médical tunisien — sécurité, confiance, traçabilité.
            </p>
            <div className="mb-8">
              <PharmacyCounter />
            </div>
            <MagneticButton
              onClick={() => window.location.href = "/register/pharmacy"}
              className="inline-flex px-10 py-4 rounded-btn text-base font-semibold bg-[#00D4AA] text-white hover:bg-[#059669] transition-all duration-200 active:scale-[0.96] shadow-[0_4px_20px_rgba(0,212,170,0.4)]"
            >
              Commencer gratuitement →
            </MagneticButton>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5"><ShieldCheckIcon /> Sans engagement</span>
              <span className="flex items-center gap-1.5"><ShieldCheckIcon /> 14 jours gratuits</span>
              <span className="flex items-center gap-1.5"><ShieldCheckIcon /> Support inclus</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#00D4AA]/10 py-12 bg-[#020814]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <Logo className="h-7 w-auto mb-3" />
              <p className="text-[11px] text-[#64748B] mb-4">{t(locale, "footer.tagline")}</p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-8 h-8 rounded-full bg-[#00D4AA]/10 flex items-center justify-center text-[#64748B] hover:text-[#00D4AA] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#00D4AA]/10 flex items-center justify-center text-[#64748B] hover:text-[#00D4AA] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#00D4AA]/10 flex items-center justify-center text-[#64748B] hover:text-[#00D4AA] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-3">Contact</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  +216 XX XXX XXX
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  contact@pharmago.tn
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Tunis, Tunisie
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-3">Restez informé</h4>
              <div className="flex items-center gap-6 text-xs text-[#64748B]">
                <a href="/cgu" className="hover:text-white transition-colors">CGU</a>
                <a href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</a>
                <a href="#" className="hover:text-white transition-colors">{t(locale, "footer.contact")}</a>
              </div>
              <div className="mt-4">
                <NewsletterForm />
              </div>
              <p className="mt-4 text-[11px] text-[#64748B]" dangerouslySetInnerHTML={{ __html: t(locale, "footer.made") }} />
            </div>
          </div>
          <div className="border-t border-[#00D4AA]/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-[#64748B]">© 2026 PharmaGo. Tous droits réservés.</span>
            <span className="text-[11px] text-[#64748B]">PharmaGo v0.1 — Delivery secured</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
