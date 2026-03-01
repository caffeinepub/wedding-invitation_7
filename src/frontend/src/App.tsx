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

// ── Ornament Divider ─────────────────────────────────────────────────────────
function OrnamentDivider({ symbol = "✦" }: { symbol?: string }) {
  return (
    <div className="ornament-line w-full max-w-xs my-4">
      <span className="text-gold text-lg flex-shrink-0">{symbol}</span>
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
  const groom = names[0] ?? "James";
  const bride = names[1] ?? "Emily";

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
            src="/assets/generated/floral-banner.dim_1200x400.png"
            alt="Floral decoration"
            className="w-full h-auto opacity-85"
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

        {/* Names */}
        <div className="flex items-center gap-4 md:gap-8 flex-wrap justify-center mb-6">
          <motion.h1
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
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
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
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

  return (
    <RevealSection
      id="date"
      className="bg-gradient-to-b from-ivory to-blush-light"
    >
      <FloralCorner position="tr" size={150} delay={0.2} />
      <FloralCorner position="bl" size={130} delay={0.4} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 py-16 max-w-2xl mx-auto w-full">
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

        {/* Big date display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.9,
            delay: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="flex items-baseline gap-4 md:gap-6 mb-2"
        >
          <span className="font-display text-7xl md:text-9xl font-bold text-gold leading-none">
            {formatted.day}
          </span>
          <div className="flex flex-col items-start gap-1">
            <span
              className="font-display text-2xl md:text-3xl font-semibold"
              style={{ color: "oklch(0.35 0.04 25)" }}
            >
              {formatted.month}
            </span>
            <span
              className="font-display text-2xl md:text-3xl font-semibold"
              style={{ color: "oklch(0.35 0.04 25)" }}
            >
              {formatted.year}
            </span>
          </div>
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
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
              {/* Guest Name */}
              <div className="mb-5">
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
              </div>

              {/* Email */}
              <div className="mb-5">
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
              </div>

              {/* Attendance */}
              <div className="mb-5">
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
              </div>

              {/* Message */}
              <div className="mb-7">
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
              </div>

              {/* Submit */}
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
    coupleNames: "James & Emily",
    weddingDate: "2026-06-15",
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
