import { useState, useEffect, useRef } from "react";

// ─── CONFIGURATION ─────────────────────────────────────────────────────────────
// Set SHOW_COUNTDOWN to true and update LAUNCH_DATE when you have an opening date
const SHOW_COUNTDOWN = false;
const LAUNCH_DATE    = "2026-09-15T18:00:00"; // update this when ready
// ──────────────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  "🥟 Samosas Agneau",
  "🌭 Hot-Dog Épicé",
  "🥪 Sandwich Poulet Mariné",
  "🍟 Frites Maison",
  "🥙 Sandwich Falafel",
  "🤖 Assisté par l'IA",
  "🥟 Samosas Légumes",
  "🔔 Notification quand c'est prêt",
  "🌭 Hot-Dog Classique",
  "🍟 Frites Épicées",
  "📱 Commande par QR code",
  "🥪 Pain Maison",
];

function useCountdown(target) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(target) - new Date());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
}

export default function ComingSoon() {
  const { d, h, m, s } = useCountdown(LAUNCH_DATE);
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: 0, y: 0 });

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, particles = [], raf;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    class P {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x  = Math.random() * W;
        this.y  = init ? Math.random() * H : (Math.random() > 0.5 ? -10 : H + 10);
        this.r  = Math.random() * 1.2 + 0.2;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.a  = Math.random() * 0.35 + 0.05;
        this.c  = Math.random() > 0.6 ? "242,169,59" : Math.random() > 0.5 ? "200,67,42" : "232,223,211";
      }
      step() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < -5 || this.x > W + 5 || this.y < -5 || this.y > H + 5) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.c},${this.a})`;
        ctx.fill();
      }
    }

    const init = () => { resize(); particles = Array.from({ length: 100 }, () => new P()); };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      // ambient glow near mouse
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, 280);
      g.addColorStop(0, "rgba(242,169,59,0.06)");
      g.addColorStop(1, "rgba(27,20,17,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // center glow
      const cg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.min(W,H)*0.6);
      cg.addColorStop(0, "rgba(200,67,42,0.04)");
      cg.addColorStop(1, "rgba(27,20,17,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H);
      particles.forEach(p => { p.step(); p.draw(); });
      raf = requestAnimationFrame(animate);
    };

    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onTouch = (e) => {
      if (e.touches[0]) mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    window.addEventListener("resize", () => { resize(); particles.forEach(p => p.reset(true)); });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch);
    init();
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div
      style={{ background: "#1B1411", minHeight: "100vh", overflowX: "hidden" }}
      className="relative font-body text-cream"
    >
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      />

      {/* Grain overlay */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />

      {/* ── Ticker ── */}
      <div
        style={{
          position: "relative", zIndex: 2, borderBottom: "1px solid rgba(242,169,59,0.12)",
          background: "rgba(27,20,17,0.6)", backdropFilter: "blur(8px)",
          overflow: "hidden", padding: "10px 0",
        }}
      >
        <div
          style={{
            display: "flex", gap: "2.5rem", whiteSpace: "nowrap",
            animation: "ticker 28s linear infinite",
          }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(232,223,211,0.55)", flexShrink: 0 }}
            >
              {item}
              <span style={{ marginLeft: "2.5rem", color: "rgba(242,169,59,0.3)" }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        style={{ position: "relative", zIndex: 2 }}
        className="flex flex-col items-center justify-center min-h-[calc(100vh-44px)] text-center px-6 py-12"
      >

        {/* Top pill */}
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(242,169,59,0.07)", border: "1px solid rgba(242,169,59,0.2)",
            borderRadius: "999px", padding: "0.35rem 1rem",
            fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "rgba(242,169,59,0.85)",
            marginBottom: "2rem",
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#F2A93B",
            animation: "pulse 1.8s ease-in-out infinite",
            display: "inline-block",
          }} />
          Propulsé par l'Intelligence Artificielle
        </div>

        {/* Logo monogram */}
        <div style={{ marginBottom: "1.5rem", position: "relative" }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%",
            border: "1.5px solid rgba(242,169,59,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto", position: "relative",
            animation: "ringpulse 3.5s ease-in-out infinite",
          }}>
            <div style={{
              position: "absolute", inset: -10, borderRadius: "50%",
              border: "1px solid rgba(242,169,59,0.1)",
            }} />
            <div style={{
              position: "absolute", inset: -22, borderRadius: "50%",
              border: "1px solid rgba(242,169,59,0.05)",
            }} />
            <div style={{
              width: 76, height: 76, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(242,169,59,0.12), rgba(200,67,42,0.08))",
              border: "1px solid rgba(242,169,59,0.2)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 2,
            }}>
              {/* <span style={{
                fontFamily: "Fraunces, serif", fontSize: "1.9rem",
                fontWeight: 900, color: "#F2A93B", lineHeight: 1, letterSpacing: "-1px",
              }}>CF</span>
              <span style={{
                width: 4, height: 4, borderRadius: "50%", background: "#C8432A",
              }} /> */}
              <img src={`public/logo.png`} />
            </div>
          </div>
        </div>

        {/* Brand name */}
        <p style={{
          fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.22em",
          textTransform: "uppercase", color: "rgba(232,223,211,0.45)",
          marginBottom: "0.6rem",
        }}>
          Restauration Rapide
        </p>

        <h1 style={{ fontFamily: "Fraunces, serif", lineHeight: 0.92, marginBottom: "1.5rem" }}>
          <span style={{
            display: "block", fontSize: "clamp(3.2rem, 11vw, 6rem)",
            fontWeight: 900, color: "#FAF6F0", letterSpacing: "-0.03em",
          }}>
            Chez
          </span>
          <span style={{
            display: "block", fontSize: "clamp(3.5rem, 13vw, 7rem)",
            fontWeight: 900, color: "#F2A93B", letterSpacing: "-0.04em",
          }}>
            Farahi
          </span>
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
          color: "rgba(232,223,211,0.7)", lineHeight: 1.6,
          maxWidth: 480, marginBottom: "0.5rem",
        }}>
          Le premier fast-food piloté par l'IA —
          commandez, suivez, récupérez.{" "}
          <span style={{ color: "#FAF6F0", fontWeight: 600 }}>Zéro attente.</span>
        </p>

        <p style={{
          fontSize: "0.78rem", color: "rgba(232,223,211,0.35)",
          marginBottom: "2.5rem", letterSpacing: "0.04em",
        }}>
          Haguenau · Strasbourg · Alsace
        </p>

        {/* ── Countdown (togglable) ── */}
        {SHOW_COUNTDOWN && (
          <div style={{
            display: "flex", gap: "0.75rem", justifyContent: "center",
            marginBottom: "2.5rem", flexWrap: "wrap",
          }}>
            {[
              { val: pad(d), label: "Jours" },
              { val: pad(h), label: "Heures" },
              { val: pad(m), label: "Min" },
              { val: pad(s), label: "Sec" },
            ].map(({ val, label }, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 68, height: 68, borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Fraunces, serif", fontSize: "2.2rem",
                  fontWeight: 900, color: "#FAF6F0",
                }}>
                  {val}
                </div>
                <span style={{
                  fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "rgba(232,223,211,0.35)",
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Bientôt badge (shown when countdown is off) ── */}
        {!SHOW_COUNTDOWN && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.6rem",
            background: "rgba(200,67,42,0.07)", border: "1px solid rgba(200,67,42,0.25)",
            borderRadius: "999px", padding: "0.6rem 1.5rem",
            fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.06em",
            color: "#e8a07a", marginBottom: "2.5rem",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#C8432A",
              animation: "pulse 1.5s ease-in-out infinite", display: "inline-block",
            }} />
            Ouverture prochainement
          </div>
        )}

        {/* ── AI feature trio ── */}
        <div style={{
          display: "flex", gap: "0.75rem", justifyContent: "center",
          flexWrap: "wrap", maxWidth: 480, marginBottom: "2.5rem",
        }}>
          {[
            { icon: "🤖", text: "Assistant IA pour conseiller" },
            { icon: "📱", text: "Commande via QR code" },
            { icon: "🔔", text: "Notifié dès que c'est prêt" },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "999px", padding: "0.5rem 1rem",
              fontSize: "0.75rem", color: "rgba(232,223,211,0.6)",
            }}>
              <span style={{ fontSize: "0.9rem" }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>

        {/* ── Instagram ── */}
        <a
          href="https://instagram.com/chezfarahi"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.6rem",
            padding: "0.75rem 1.6rem", borderRadius: "999px",
            background: "linear-gradient(135deg, rgba(131,58,180,0.15), rgba(200,67,42,0.15))",
            border: "1px solid rgba(200,67,42,0.25)",
            color: "rgba(232,223,211,0.8)", textDecoration: "none",
            fontSize: "0.85rem", fontWeight: 600,
            transition: "all 0.2s",
            marginBottom: "3rem",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(200,67,42,0.5)";
            e.currentTarget.style.color = "#FAF6F0";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "rgba(200,67,42,0.25)";
            e.currentTarget.style.color = "rgba(232,223,211,0.8)";
          }}
        >
          {/* Instagram SVG */}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          @chezfarahi
        </a>

        {/* ── Bottom strip ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "1.5rem",
          flexWrap: "wrap", justifyContent: "center",
          fontSize: "0.7rem", color: "rgba(232,223,211,0.25)",
          letterSpacing: "0.08em",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Haguenau · Strasbourg
          </span>
          <span>·</span>
          <span>Alsace, France</span>
          <span>·</span>
          <span>© 2026 Chez Farahi</span>
        </div>

      </div>

      {/* ── CSS keyframes ── */}
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes ringpulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(242,169,59,0.12); }
          50%       { box-shadow: 0 0 32px 6px rgba(242,169,59,0.10); }
        }
      `}</style>
    </div>
  );
}