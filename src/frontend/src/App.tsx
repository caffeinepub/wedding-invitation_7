import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronDown, Heart, Loader2, MapPin, Send } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { RSVPStatus } from "./backend.d";
import { useSubmitRSVP, useWeddingDetails } from "./hooks/useQueries";

// ── Countdown Hook ──────────────────────────────────────────────────────────
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculate = () => {
      const now = Date.now();
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

// ── Format date helper ───────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return {
    dayOfWeek: d.toLocaleDateString("en-US", { weekday: "long" }),
    month: d.toLocaleDateString("en-US", { month: "long" }),
    day: d.getDate(),
    year: d.getFullYear(),
  };
}

// ── Section Wrapper ──────────────────────────────────────────────────────────
function RevealSection({
  children,
  className = "",
  id,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section
      ref={ref}
      id={id}
      style={style}
      className={`snap-section min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${className}`}
    >
      <motion.div
        className="w-full h-full flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </section>
  );
}

// ── Floral Corner Decoration ─────────────────────────────────────────────────
function FloralCorner({
  position,
  size = 160,
  delay = 0,
}: {
  position: "tl" | "tr" | "bl" | "br";
  size?: number;
  delay?: number;
}) {
  const posClasses = {
    tl: "top-0 left-0",
    tr: "top-0 right-0 scale-x-[-1]",
    bl: "bottom-0 left-0 scale-y-[-1]",
    br: "bottom-0 right-0 scale-[-1]",
  };

  return (
    <motion.div
      className={`absolute ${posClasses[position]} pointer-events-none`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.65, scale: 1 }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
    >
      <img
        src="/assets/generated/floral-corner-transparent.dim_300x300.png"
        alt=""
        width={size}
        height={size}
        className="animate-float"
        style={{ animationDelay: `${delay}s` }}
      />
    </motion.div>
  );
}

// ── Enhanced Ornament Divider ─────────────────────────────────────────────────
function OrnamentDivider({ symbol = "✦" }: { symbol?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="ornament-line w-full max-w-xs my-4">
      <motion.span
        className="text-gold text-lg flex-shrink-0"
        animate={isInView ? { rotate: 360 } : { rotate: 0 }}
        initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
        transition={
          isInView
            ? {
                rotate: {
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                },
                scale: { duration: 0.6, type: "spring", stiffness: 200 },
                opacity: { duration: 0.4 },
              }
            : {}
        }
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        style={{ display: "inline-block" }}
      >
        {symbol}
      </motion.span>
    </div>
  );
}

// ── Sparkle Trail ────────────────────────────────────────────────────────────
const SPARKLE_SHAPES = ["✦", "✧", "★", "◆", "✸"];

function SparkleTrail({ trigger }: { trigger: boolean }) {
  const [sparks, setSparks] = useState<
    {
      id: number;
      x: number;
      y: number;
      shape: string;
      size: number;
      delay: number;
    }[]
  >([]);

  useEffect(() => {
    if (!trigger) return;
    const newSparks = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 120,
      y: -(Math.random() * 80 + 20),
      shape: SPARKLE_SHAPES[i % SPARKLE_SHAPES.length],
      size: Math.random() * 7 + 6,
      delay: i * 0.06,
    }));
    setSparks(newSparks);
    const t = setTimeout(() => setSparks([]), 1200);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      <AnimatePresence>
        {sparks.map((s) => (
          <motion.span
            key={s.id}
            className="absolute left-1/2 top-1/2"
            style={
              {
                fontSize: s.size,
                color: "oklch(0.72 0.12 78)",
                "--sx": `${s.x}px`,
                "--sy": `${s.y}px`,
              } as React.CSSProperties
            }
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: s.x, y: s.y, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: s.delay, ease: "easeOut" }}
          >
            {s.shape}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Floating Petals ───────────────────────────────────────────────────────────
const PETAL_COLORS = [
  "oklch(0.93 0.055 10)",
  "oklch(0.89 0.06 15)",
  "oklch(0.85 0.05 355)",
  "oklch(0.91 0.045 25)",
  "oklch(0.88 0.04 340)",
  "oklch(0.96 0.03 20)",
];

const petals = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 95 + 2}%`,
  size: Math.random() * 14 + 8,
  color: PETAL_COLORS[i % PETAL_COLORS.length],
  duration: `${Math.random() * 7 + 7}s`,
  delay: `${Math.random() * 6}s`,
  drift: `${(Math.random() - 0.5) * 80}px`,
  borderRadius: `${Math.random() * 40 + 30}% ${Math.random() * 40 + 50}% ${Math.random() * 40 + 40}% ${Math.random() * 40 + 50}%`,
}));

function FloatingPetals() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-0 animate-rise"
          style={
            {
              left: p.left,
              width: p.size,
              height: p.size * 1.25,
              backgroundColor: p.color,
              borderRadius: p.borderRadius,
              opacity: 0,
              "--duration": p.duration,
              "--delay": p.delay,
              "--drift": p.drift,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// ── Scratch Card ─────────────────────────────────────────────────────────────
function ScratchCard({
  day,
  month,
  year,
}: {
  day: number;
  month: string;
  year: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const isDrawing = useRef(false);
  const revealedRef = useRef(false);

  const CARD_W = 280;
  const CARD_H = 160;

  // Paint the gold scratch layer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CARD_W;
    canvas.height = CARD_H;

    // Gold base gradient
    const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    grad.addColorStop(0, "#c9a84c");
    grad.addColorStop(0.25, "#e8c96a");
    grad.addColorStop(0.5, "#f5dc8a");
    grad.addColorStop(0.75, "#d4a843");
    grad.addColorStop(1, "#c89a30");
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, CARD_W, CARD_H, 12);
    ctx.fill();

    // Sparkle dots
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * CARD_W;
      const y = Math.random() * CARD_H;
      const r = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.15})`;
      ctx.fill();
    }

    // Label text
    ctx.fillStyle = "rgba(90, 55, 10, 0.9)";
    ctx.font = "bold 11px 'Georgia', serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "2px";
    ctx.fillText("✦  RUB TO REVEAL THE DATE  ✦", CARD_W / 2, CARD_H / 2 - 6);
    ctx.font = "10px 'Georgia', serif";
    ctx.fillStyle = "rgba(90,55,10,0.65)";
    ctx.fillText("Scratch away the gold...", CARD_W / 2, CARD_H / 2 + 14);

    setCanvasReady(true);
  }, []);

  // Measure revealed area
  const checkRevealPercent = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const data = ctx.getImageData(0, 0, CARD_W, CARD_H).data;
    let transparent = 0;
    const total = CARD_W * CARD_H;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 30) transparent++;
    }
    return transparent / total;
  }, []);

  // Scratch erase at point
  const scratch = useCallback(
    (x: number, y: number) => {
      if (revealedRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      const pct = checkRevealPercent();
      if (pct > 0.6 && !revealedRef.current) {
        revealedRef.current = true;
        // Fade out canvas
        canvas.style.transition = "opacity 0.8s ease";
        canvas.style.opacity = "0";
        setTimeout(() => {
          setRevealed(true);
          setShowHearts(true);
        }, 800);
      }
    },
    [checkRevealPercent],
  );

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = CARD_W / rect.width;
    const scaleY = CARD_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = CARD_W / rect.width;
    const scaleY = CARD_H / rect.height;
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const hearts = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    hx: `${(Math.random() - 0.5) * 160}px`,
    hy: `${-(Math.random() * 80 + 20)}px`,
    hr: `${(Math.random() - 0.5) * 45}deg`,
    delay: `${i * 0.07}s`,
    size: Math.random() * 10 + 10,
  }));

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ minWidth: CARD_W }}
    >
      {/* Date beneath the scratch card */}
      <div className="flex items-baseline gap-4 md:gap-6 mb-0 select-none">
        <span className="font-display text-7xl md:text-9xl font-bold text-gold leading-none">
          {day}
        </span>
        <div className="flex flex-col items-start gap-1">
          <span
            className="font-display text-2xl md:text-3xl font-semibold"
            style={{ color: "oklch(0.35 0.04 25)" }}
          >
            {month}
          </span>
          <span
            className="font-display text-2xl md:text-3xl font-semibold"
            style={{ color: "oklch(0.35 0.04 25)" }}
          >
            {year}
          </span>
        </div>
      </div>

      {/* Canvas scratch overlay — only shown before full reveal */}
      {!revealed && canvasReady && (
        <canvas
          ref={canvasRef}
          className="scratch-canvas absolute inset-0 w-full h-full"
          style={{
            width: "100%",
            height: "100%",
            zIndex: 10,
            borderRadius: "12px",
          }}
          onMouseDown={(e) => {
            isDrawing.current = true;
            scratch(...(Object.values(getPos(e)) as [number, number]));
          }}
          onMouseMove={(e) => {
            if (isDrawing.current)
              scratch(...(Object.values(getPos(e)) as [number, number]));
          }}
          onMouseUp={() => {
            isDrawing.current = false;
          }}
          onMouseLeave={() => {
            isDrawing.current = false;
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            isDrawing.current = true;
            scratch(...(Object.values(getTouchPos(e)) as [number, number]));
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            if (isDrawing.current)
              scratch(...(Object.values(getTouchPos(e)) as [number, number]));
          }}
          onTouchEnd={() => {
            isDrawing.current = false;
          }}
        />
      )}
      {/* Hidden canvas for measurements after reveal */}
      {!revealed && !canvasReady && (
        <canvas ref={canvasRef} style={{ display: "none" }} />
      )}

      {/* Heart burst after reveal */}
      <AnimatePresence>
        {showHearts && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {hearts.map((h) => (
              <motion.span
                key={h.id}
                className="absolute animate-heart-burst"
                style={
                  {
                    fontSize: h.size,
                    color: "oklch(0.62 0.1 78)",
                    "--hx": h.hx,
                    "--hy": h.hy,
                    "--hr": h.hr,
                    animationDelay: h.delay,
                  } as React.CSSProperties
                }
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{
                  duration: 1.2,
                  delay: Number.parseFloat(h.delay) + 0.8,
                }}
              >
                ♥
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Countdown Unit ───────────────────────────────────────────────────────────
function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-unit">
      <div
        className="glass-card rounded-xl px-4 py-3 min-w-[72px] text-center shadow-rose"
        style={{ border: "1px solid oklch(0.78 0.09 78 / 0.35)" }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            className="font-display text-3xl md:text-4xl font-bold text-gold block leading-none"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1 font-body">
        {label}
      </span>
    </div>
  );
}

// ── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({
  coupleNames,
  scrollToDate,
}: {
  coupleNames: string;
  scrollToDate: () => void;
}) {
  const names = coupleNames.split("&").map((n) => n.trim());
  const groom = names[0] ?? "Faraz";
  const bride = names[1] ?? "Ayesha";

  return (
    <section
      id="hero"
      className="snap-section min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url(/assets/generated/wedding-hero-bg.dim_1920x1080.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Overlay tint */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.975 0.012 75 / 0.35) 0%, oklch(0.975 0.012 75 / 0.55) 50%, oklch(0.975 0.012 75 / 0.72) 100%)",
        }}
      />

      {/* Floating petals in hero */}
      <FloatingPetals />

      {/* Floral corners */}
      <FloralCorner position="tl" size={180} delay={0.3} />
      <FloralCorner position="tr" size={180} delay={0.5} />
      <FloralCorner position="bl" size={140} delay={0.7} />
      <FloralCorner position="br" size={140} delay={0.9} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-16 max-w-3xl mx-auto">
        {/* Floral banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-4 w-full max-w-[480px]"
        >
          <img
            src="/assets/uploads/pngtree-luxury-gold-vintage-title-frame-png-transparent-background-png-image_4488806-1.png"
            alt="Floral decoration"
            className="w-full h-auto opacity-90"
          />
        </motion.div>

        {/* "The Wedding Of" */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-6 font-body"
        >
          The Wedding of
        </motion.p>

        {/* Names — with letter-spacing bloom on entrance */}
        <div className="flex items-center gap-4 md:gap-8 flex-wrap justify-center mb-6">
          <motion.h1
            initial={{ opacity: 0, x: -60, letterSpacing: "0em" }}
            animate={{ opacity: 1, x: 0, letterSpacing: "0.02em" }}
            transition={{
              duration: 0.9,
              delay: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="font-display text-5xl md:text-7xl font-bold"
            style={{ color: "oklch(0.28 0.04 25)" }}
          >
            {groom}
          </motion.h1>

          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 1.0,
              type: "spring",
              stiffness: 200,
            }}
            className="font-display text-4xl md:text-6xl animate-shimmer"
          >
            &amp;
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, x: 60, letterSpacing: "0em" }}
            animate={{ opacity: 1, x: 0, letterSpacing: "0.02em" }}
            transition={{
              duration: 0.9,
              delay: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="font-display text-5xl md:text-7xl font-bold"
            style={{ color: "oklch(0.28 0.04 25)" }}
          >
            {bride}
          </motion.h1>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="w-full"
        >
          <OrnamentDivider symbol="♥" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="font-body text-lg md:text-xl text-foreground/75 max-w-md leading-relaxed mt-2"
        >
          Together with their families, invite you to celebrate their wedding
        </motion.p>

        {/* Scroll CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.7 }}
          className="mt-10"
        >
          <button
            type="button"
            onClick={scrollToDate}
            className="flex flex-col items-center gap-2 group cursor-pointer"
            aria-label="View wedding details"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground group-hover:text-gold transition-colors duration-300">
              View Details
            </span>
            <motion.div
              className="w-8 h-8 rounded-full border border-gold/50 flex items-center justify-center group-hover:border-gold transition-colors duration-300"
              animate={{ y: [0, 5, 0] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <ChevronDown className="w-4 h-4 text-gold" />
            </motion.div>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ── Date Section ─────────────────────────────────────────────────────────────
function DateSection({ weddingDate }: { weddingDate: string }) {
  const countdown = useCountdown(weddingDate);
  const formatted = formatDate(weddingDate);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [sparkTrigger, setSparkTrigger] = useState(false);

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => setSparkTrigger(true), 600);
      return () => clearTimeout(t);
    }
  }, [isInView]);

  useEffect(() => {
    if (sparkTrigger) {
      const t = setTimeout(() => setSparkTrigger(false), 1500);
      return () => clearTimeout(t);
    }
  }, [sparkTrigger]);

  return (
    <RevealSection
      id="date"
      className={
        isInView
          ? "date-shimmer-wash"
          : "bg-gradient-to-b from-ivory to-blush-light"
      }
    >
      <FloralCorner position="tr" size={150} delay={0.2} />
      <FloralCorner position="bl" size={130} delay={0.4} />

      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center text-center px-6 py-16 max-w-2xl mx-auto w-full"
      >
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-6"
        >
          Save the Date
        </motion.p>

        {/* Day of week */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-body text-xl text-muted-foreground italic mb-2"
        >
          {formatted.dayOfWeek}
        </motion.p>

        {/* Scratch card wrapping the date */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.9,
            delay: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="relative mb-2"
          style={{ minHeight: 120 }}
        >
          <SparkleTrail trigger={sparkTrigger} />
          <ScratchCard
            day={formatted.day}
            month={formatted.month}
            year={formatted.year}
          />
        </motion.div>

        <OrnamentDivider symbol="✦" />

        {/* Countdown label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-5"
        >
          Counting down to forever
        </motion.p>

        {/* Countdown timer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex gap-4 md:gap-6 flex-wrap justify-center"
        >
          <CountdownUnit value={countdown.days} label="Days" />
          <CountdownUnit value={countdown.hours} label="Hours" />
          <CountdownUnit value={countdown.minutes} label="Minutes" />
          <CountdownUnit value={countdown.seconds} label="Seconds" />
        </motion.div>
      </div>
    </RevealSection>
  );
}

// ── Location Section ─────────────────────────────────────────────────────────
function LocationSection({
  venueName,
  venueAddress,
  note,
}: {
  venueName: string;
  venueAddress: string;
  note?: string;
}) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`;

  return (
    <RevealSection
      id="location"
      className=""
      style={
        {
          background:
            "linear-gradient(135deg, oklch(0.965 0.018 60) 0%, oklch(0.975 0.012 75) 50%, oklch(0.96 0.022 30) 100%)",
        } as React.CSSProperties
      }
    >
      <FloralCorner position="tl" size={160} delay={0.1} />
      <FloralCorner position="br" size={160} delay={0.3} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 py-16 max-w-xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-8"
        >
          Venue
        </motion.p>

        {/* 3D tilt slide-in card */}
        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.9,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ transformPerspective: 800 }}
          className="glass-card rounded-2xl p-8 md:p-12 shadow-petal w-full"
        >
          {/* Map pin icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.92 0.045 20)" }}
            >
              <MapPin
                className="w-6 h-6"
                style={{ color: "oklch(0.52 0.09 10)" }}
              />
            </div>
          </div>

          <h2
            className="font-display text-3xl md:text-4xl font-bold mb-3"
            style={{ color: "oklch(0.28 0.04 25)" }}
          >
            {venueName}
          </h2>

          <p className="font-body text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
            {venueAddress}
          </p>

          {note && (
            <>
              <OrnamentDivider symbol="♥" />
              <p className="font-body text-lg italic text-foreground/70 mt-2 leading-relaxed">
                "{note}"
              </p>
            </>
          )}

          <motion.div
            className="mt-8"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-body text-sm uppercase tracking-widest transition-all duration-300"
              style={{
                background: "oklch(0.52 0.09 10)",
                color: "oklch(0.975 0.012 75)",
              }}
            >
              <MapPin className="w-4 h-4" />
              Get Directions
            </a>
          </motion.div>
        </motion.div>
      </div>
    </RevealSection>
  );
}

// ── RSVP Section ─────────────────────────────────────────────────────────────
function RSVPSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<RSVPStatus>(RSVPStatus.attending);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { mutate, isPending } = useSubmitRSVP();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }
    mutate(
      { name, email, status, message },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast.success("RSVP submitted! We can't wait to celebrate with you.");
        },
        onError: () => {
          toast.error("Something went wrong. Please try again.");
        },
      },
    );
  };

  const formFields = [
    { key: "name", delay: 0.15 },
    { key: "email", delay: 0.25 },
    { key: "attendance", delay: 0.35 },
    { key: "message", delay: 0.45 },
    { key: "submit", delay: 0.55 },
  ];

  return (
    <RevealSection id="rsvp" className="bg-blush-light">
      <FloralCorner position="tr" size={140} delay={0.2} />
      <FloralCorner position="bl" size={120} delay={0.4} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 py-16 max-w-lg mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3"
        >
          Kindly Reply by May 15, 2026
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl md:text-5xl font-bold mb-2"
          style={{ color: "oklch(0.28 0.04 25)" }}
        >
          Will You Join Us?
        </motion.h2>

        <OrnamentDivider symbol="✦" />

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="glass-card rounded-2xl p-10 shadow-petal w-full mt-4 flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.52 0.09 10)" }}
              >
                <Check
                  className="w-8 h-8"
                  style={{ color: "oklch(0.975 0.012 75)" }}
                />
              </motion.div>
              <h3
                className="font-display text-2xl font-bold"
                style={{ color: "oklch(0.28 0.04 25)" }}
              >
                Thank You, {name}!
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Your RSVP has been received. We're so thrilled to share this
                special day with you.
              </p>
              <Heart
                className="w-6 h-6 animate-pulse-soft"
                style={{ color: "oklch(0.62 0.1 78)" }}
              />
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="glass-card rounded-2xl p-8 shadow-petal w-full mt-4 text-left"
            >
              {/* Guest Name — staggered */}
              <motion.div
                className="mb-5"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: formFields[0].delay }}
              >
                <Label
                  htmlFor="rsvp-name"
                  className="font-body text-sm uppercase tracking-widest text-muted-foreground mb-2 block"
                >
                  Your Name
                </Label>
                <Input
                  id="rsvp-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sophie Williams"
                  required
                  className="font-body text-base bg-ivory/80 border-border focus:border-gold focus-visible:ring-gold/30"
                />
              </motion.div>

              {/* Email — staggered */}
              <motion.div
                className="mb-5"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: formFields[1].delay }}
              >
                <Label
                  htmlFor="rsvp-email"
                  className="font-body text-sm uppercase tracking-widest text-muted-foreground mb-2 block"
                >
                  Email Address
                </Label>
                <Input
                  id="rsvp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sophie@example.com"
                  required
                  className="font-body text-base bg-ivory/80 border-border focus:border-gold focus-visible:ring-gold/30"
                />
              </motion.div>

              {/* Attendance — staggered */}
              <motion.div
                className="mb-5"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: formFields[2].delay }}
              >
                <Label className="font-body text-sm uppercase tracking-widest text-muted-foreground mb-3 block">
                  Attendance
                </Label>
                <RadioGroup
                  value={status}
                  onValueChange={(v) => setStatus(v as RSVPStatus)}
                  className="flex flex-col gap-2"
                >
                  {[
                    { value: RSVPStatus.attending, label: "Joyfully Accepts" },
                    {
                      value: RSVPStatus.notAttending,
                      label: "Regretfully Declines",
                    },
                    {
                      value: RSVPStatus.maybe,
                      label: "Maybe — I'll Let You Know",
                    },
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-3">
                      <RadioGroupItem
                        value={value}
                        id={`rsvp-${value}`}
                        className="border-gold/60 text-gold focus-visible:ring-gold/30"
                      />
                      <Label
                        htmlFor={`rsvp-${value}`}
                        className="font-body text-base cursor-pointer"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </motion.div>

              {/* Message — staggered */}
              <motion.div
                className="mb-7"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: formFields[3].delay }}
              >
                <Label
                  htmlFor="rsvp-message"
                  className="font-body text-sm uppercase tracking-widest text-muted-foreground mb-2 block"
                >
                  Message to the Couple{" "}
                  <span className="normal-case tracking-normal text-xs">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="rsvp-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your wishes or a special message..."
                  rows={3}
                  className="font-body text-base bg-ivory/80 border-border focus:border-gold focus-visible:ring-gold/30 resize-none"
                />
              </motion.div>

              {/* Submit — staggered */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: formFields[4].delay }}
              >
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full font-body text-sm uppercase tracking-widest py-6 rounded-full transition-all duration-300"
                  style={{
                    background: isPending
                      ? "oklch(0.72 0.06 20)"
                      : "oklch(0.52 0.09 10)",
                    color: "oklch(0.975 0.012 75)",
                  }}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending your reply…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send RSVP
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </RevealSection>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer({
  coupleNames,
  weddingDate,
}: { coupleNames: string; weddingDate: string }) {
  const formatted = formatDate(weddingDate);
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer
      className="snap-section min-h-[40vh] flex flex-col items-center justify-center py-16 relative overflow-hidden"
      style={{ background: "oklch(0.96 0.022 30)" }}
    >
      <FloralCorner position="tl" size={100} delay={0.1} />
      <FloralCorner position="br" size={100} delay={0.3} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-4">
        <Heart
          className="w-6 h-6 animate-pulse-soft"
          style={{ color: "oklch(0.62 0.1 78)" }}
        />

        <h2
          className="font-display text-3xl md:text-4xl font-bold"
          style={{ color: "oklch(0.28 0.04 25)" }}
        >
          {coupleNames}
        </h2>

        <p className="font-body text-muted-foreground text-sm uppercase tracking-[0.3em]">
          {formatted.month} {formatted.day}, {formatted.year}
        </p>

        <OrnamentDivider symbol="✦" />

        <p className="font-body text-xs text-muted-foreground mt-2">
          © {year}. Built with{" "}
          <Heart
            className="inline w-3 h-3 mx-0.5"
            style={{ color: "oklch(0.62 0.1 78)" }}
          />{" "}
          using{" "}
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gold transition-colors duration-200"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { data: wedding, isLoading } = useWeddingDetails();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const details = wedding ?? {
    coupleNames: "Faraz & Ayesha",
    weddingDate: "2026-04-25",
    venueName: "The Grand Rosewood Estate",
    venueAddress: "123 Garden Lane, Rosewood, CA 90210",
    note: "Join us for an evening of love, laughter, and happily ever after.",
  };

  return (
    <>
      <Toaster position="top-center" richColors />

      {isLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "oklch(0.975 0.012 75)" }}
        >
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
            <p className="font-body text-muted-foreground text-sm uppercase tracking-widest">
              Preparing your invitation…
            </p>
          </div>
        </div>
      )}

      {/* Scroll-snap container */}
      <div
        ref={scrollContainerRef}
        className="snap-container"
        style={{ height: "100dvh" }}
      >
        <HeroSection
          coupleNames={details.coupleNames}
          scrollToDate={() => scrollToSection("date")}
        />
        <DateSection weddingDate={details.weddingDate} />
        <LocationSection
          venueName={details.venueName}
          venueAddress={details.venueAddress}
          note={details.note}
        />
        <RSVPSection />
        <Footer
          coupleNames={details.coupleNames}
          weddingDate={details.weddingDate}
        />
      </div>
    </>
  );
}
