import { useState, useEffect, useRef } from "react";

// ─── FIREBASE STUB ───────────────────────────────────────────────────────────
// Replace this section with real Firebase imports when deploying:
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
// const firebaseConfig = { ... your config ... };
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// MOCK Firebase for demo — swaps out cleanly
const mockDB = { responses: [] };
const db = {
  _submit: async (data) => {
    mockDB.responses.push({ ...data, id: Date.now(), ts: new Date().toISOString() });
    return { id: Date.now() };
  },
  _getAll: async () => mockDB.responses,
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Syne:wght@400;700;800&family=Space+Mono&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow-x: hidden; }
body { font-family: 'Syne', sans-serif; }

:root {
  --pink-1: #ff6eb4;
  --pink-2: #ffb3d9;
  --pink-3: #ffe0f0;
  --pink-4: #fff0f7;
  --dark-1: #0a0a0f;
  --dark-2: #12121a;
  --dark-3: #1e1e2e;
  --neon: #00f5c8;
  --neon2: #7c3aed;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }

/* Slider */
input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; outline: none; cursor: pointer; }
input[type=range].pink-slider { background: linear-gradient(to right, var(--pink-1), var(--pink-3)); }
input[type=range].pink-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: var(--pink-1); border: 3px solid white; box-shadow: 0 0 10px rgba(255,110,180,0.8); }
input[type=range].dark-slider { background: linear-gradient(to right, var(--neon), #1e1e2e); }
input[type=range].dark-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: var(--neon); border: 3px solid var(--dark-1); box-shadow: 0 0 12px rgba(0,245,200,0.8); }

/* Animations */
@keyframes fadeSlideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeSlideIn { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
@keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
@keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
@keyframes glitch { 0%,100% { clip-path:inset(0 0 98% 0); transform:translateX(-2px); } 50% { clip-path:inset(50% 0 0 0); transform:translateX(2px); } }
@keyframes sparkle { 0%,100% { opacity:0; transform:scale(0) rotate(0deg); } 50% { opacity:1; transform:scale(1) rotate(180deg); } }
@keyframes neonPulse { 0%,100% { text-shadow: 0 0 5px var(--neon), 0 0 10px var(--neon); } 50% { text-shadow: 0 0 20px var(--neon), 0 0 40px var(--neon); } }
@keyframes bgFlow { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
`;

// ─── SPARKLE COMPONENT ───────────────────────────────────────────────────────
function Sparkles({ count = 12 }) {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${4 + Math.random() * 8}px`,
          height: `${4 + Math.random() * 8}px`,
          background: `hsl(${300 + Math.random() * 60}, 100%, 80%)`,
          borderRadius: "50%",
          animation: `sparkle ${2 + Math.random() * 3}s ${Math.random() * 2}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── FLOATING EMOJIS ─────────────────────────────────────────────────────────
function FloatingEmojis({ emojis }) {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {emojis.map((e, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${10 + (i * 17) % 80}%`,
          top: `${5 + (i * 23) % 80}%`,
          fontSize: `${1.2 + Math.random()}rem`,
          animation: `float ${3 + Math.random() * 2}s ${Math.random() * 2}s ease-in-out infinite`,
          opacity: 0.25,
        }}>{e}</div>
      ))}
    </div>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
function ProgressBar({ pct, gender }) {
  const isPink = gender === "girl";
  const labels = isPink
    ? ["Just started ☕", "Getting spicy 🌶️", "Halfway there 💅", "Almost done ✨", "Spilling it all 🫗"]
    : ["Just in ⚡", "Warming up 🔥", "Halfway W 💀", "Almost done 🎯", "Full send 🚀"];
  const labelIdx = Math.min(4, Math.floor(pct / 21));

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "12px 20px" }}>
      <div style={{
        background: isPink ? "rgba(255,240,247,0.9)" : "rgba(10,10,15,0.9)",
        borderRadius: "12px",
        padding: "8px 16px",
        backdropFilter: "blur(12px)",
        border: isPink ? "1px solid rgba(255,110,180,0.3)" : "1px solid rgba(0,245,200,0.2)",
        maxWidth: 600,
        margin: "0 auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            color: isPink ? "var(--pink-1)" : "var(--neon)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>{labels[labelIdx]}</span>
          <span style={{ fontSize: "0.7rem", color: isPink ? "#e879a0" : "rgba(255,255,255,0.5)" }}>{Math.round(pct)}%</span>
        </div>
        <div style={{
          height: 6,
          background: isPink ? "rgba(255,110,180,0.2)" : "rgba(0,245,200,0.15)",
          borderRadius: 3,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: isPink
              ? "linear-gradient(90deg, var(--pink-1), #ff9dcf)"
              : "linear-gradient(90deg, var(--neon), #a855f7)",
            borderRadius: 3,
            transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: isPink ? "0 0 8px rgba(255,110,180,0.6)" : "0 0 8px rgba(0,245,200,0.6)",
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── QUESTION WRAPPER ────────────────────────────────────────────────────────
function QuestionScreen({ children, gender, step, totalSteps, onNext, canNext = true, customBtn }) {
  const isPink = gender === "girl";
  const pct = totalSteps > 0 ? ((step / totalSteps) * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 20px 100px",
      position: "relative",
    }}>
      <ProgressBar pct={pct} gender={gender} />
      <div style={{
        width: "100%",
        maxWidth: 560,
        animation: "fadeSlideUp 0.5s ease forwards",
        position: "relative",
        zIndex: 10,
      }}>
        {children}
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
          {customBtn || (
            <button
              onClick={canNext ? onNext : undefined}
              style={{
                padding: "14px 40px",
                borderRadius: 50,
                border: "none",
                cursor: canNext ? "pointer" : "not-allowed",
                opacity: canNext ? 1 : 0.4,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "0.05em",
                transition: "all 0.2s",
                background: isPink
                  ? "linear-gradient(135deg, var(--pink-1), #ff9dcf)"
                  : "linear-gradient(135deg, var(--neon), #06b6d4)",
                color: isPink ? "white" : "var(--dark-1)",
                boxShadow: isPink
                  ? "0 4px 20px rgba(255,110,180,0.4)"
                  : "0 4px 20px rgba(0,245,200,0.3)",
                transform: canNext ? "translateY(0)" : "none",
              }}
              onMouseEnter={e => canNext && (e.target.style.transform = "translateY(-2px) scale(1.02)")}
              onMouseLeave={e => (e.target.style.transform = "translateY(0) scale(1)")}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({ gender, children, style = {} }) {
  const isPink = gender === "girl";
  return (
    <div style={{
      background: isPink
        ? "rgba(255,255,255,0.85)"
        : "rgba(18,18,26,0.9)",
      backdropFilter: "blur(20px)",
      borderRadius: 24,
      padding: "32px 28px",
      border: isPink
        ? "1.5px solid rgba(255,110,180,0.3)"
        : "1.5px solid rgba(0,245,200,0.15)",
      boxShadow: isPink
        ? "0 20px 60px rgba(255,110,180,0.15)"
        : "0 20px 60px rgba(0,0,0,0.5)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── QUESTION LABEL ───────────────────────────────────────────────────────────
function QLabel({ gender, children }) {
  const isPink = gender === "girl";
  return (
    <h2 style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: "clamp(1.2rem, 4vw, 1.6rem)",
      fontWeight: 700,
      color: isPink ? "#c2185b" : "white",
      marginBottom: 20,
      lineHeight: 1.35,
    }}>{children}</h2>
  );
}

// ─── SLIDER QUESTION ─────────────────────────────────────────────────────────
function SliderQ({ gender, label, value, onChange, emojis = ["💀", "😐", "✨", "🔥", "👑"] }) {
  const isPink = gender === "girl";
  const idx = Math.round((value - 1) / 9 * (emojis.length - 1));
  return (
    <Card gender={gender}>
      <QLabel gender={gender}>{label}</QLabel>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{ fontSize: "2.5rem" }}>{emojis[idx]}</span>
        <div style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: isPink ? "var(--pink-1)" : "var(--neon)",
          fontFamily: "'Space Mono', monospace",
        }}>{value}<span style={{ fontSize: "1rem", opacity: 0.5 }}>/10</span></div>
      </div>
      <input
        type="range"
        min={1} max={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={isPink ? "pink-slider" : "dark-slider"}
      />
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 8,
        fontSize: "0.7rem",
        color: isPink ? "rgba(194,24,91,0.6)" : "rgba(255,255,255,0.4)",
      }}>
        <span>Not at all</span><span>Absolutely 🔥</span>
      </div>
    </Card>
  );
}

// ─── CHOICE QUESTION ─────────────────────────────────────────────────────────
function ChoiceQ({ gender, label, options, value, onChange }) {
  const isPink = gender === "girl";
  return (
    <Card gender={gender}>
      <QLabel gender={gender}>{label}</QLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map(opt => {
          const sel = value === opt.value;
          return (
            <button key={opt.value} onClick={() => onChange(opt.value)} style={{
              padding: "12px 18px",
              borderRadius: 14,
              border: `2px solid ${sel
                ? (isPink ? "var(--pink-1)" : "var(--neon)")
                : (isPink ? "rgba(255,110,180,0.25)" : "rgba(255,255,255,0.1)")}`,
              background: sel
                ? (isPink ? "rgba(255,110,180,0.15)" : "rgba(0,245,200,0.1)")
                : "transparent",
              color: isPink ? (sel ? "#c2185b" : "#888") : (sel ? "var(--neon)" : "rgba(255,255,255,0.7)"),
              fontFamily: "'Syne', sans-serif",
              fontWeight: sel ? 700 : 400,
              fontSize: "0.95rem",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              transform: sel ? "translateX(6px)" : "none",
            }}>{opt.label}</button>
          );
        })}
      </div>
    </Card>
  );
}

// ─── TEXTAREA ─────────────────────────────────────────────────────────────────
function TextQ({ gender, label, value, onChange, placeholder = "Type here...", optional = false }) {
  const isPink = gender === "girl";
  return (
    <Card gender={gender}>
      <QLabel gender={gender}>{label}</QLabel>
      {optional && <p style={{ fontSize: "0.75rem", color: isPink ? "rgba(194,24,91,0.5)" : "rgba(255,255,255,0.35)", marginBottom: 12 }}>Optional — but we'd love it</p>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          minHeight: 100,
          background: isPink ? "rgba(255,110,180,0.06)" : "rgba(0,245,200,0.05)",
          border: `1.5px solid ${isPink ? "rgba(255,110,180,0.3)" : "rgba(0,245,200,0.2)"}`,
          borderRadius: 12,
          padding: "12px 16px",
          color: isPink ? "#c2185b" : "white",
          fontFamily: "'Syne', sans-serif",
          fontSize: "0.95rem",
          resize: "vertical",
          outline: "none",
          lineHeight: 1.5,
        }}
      />
    </Card>
  );
}

// ─── COMBO: SLIDER + TEXT ─────────────────────────────────────────────────────
function SliderTextQ({ gender, label, sliderVal, onSlider, textVal, onText, placeholder, emojis }) {
  return (
    <Card gender={gender}>
      <SliderQ gender={gender} label={label} value={sliderVal} onChange={onSlider} emojis={emojis} />
      <div style={{ marginTop: -20, paddingTop: 20 }}>
        <textarea
          value={textVal}
          onChange={e => onText(e.target.value)}
          placeholder={placeholder || "Care to elaborate? (optional)"}
          style={{
            width: "100%",
            minHeight: 70,
            background: gender === "girl" ? "rgba(255,110,180,0.06)" : "rgba(0,245,200,0.05)",
            border: `1.5px solid ${gender === "girl" ? "rgba(255,110,180,0.25)" : "rgba(0,245,200,0.15)"}`,
            borderRadius: 12,
            padding: "10px 14px",
            color: gender === "girl" ? "#c2185b" : "white",
            fontFamily: "'Syne', sans-serif",
            fontSize: "0.9rem",
            resize: "none",
            outline: "none",
            marginTop: 16,
          }}
        />
      </div>
    </Card>
  );
}

// ─── AADI SECTION ────────────────────────────────────────────────────────────
function AadiSection({ gender, data, onChange }) {
  const isPink = gender === "girl";
  const accent = isPink ? "var(--pink-1)" : "var(--neon)";

  return (
    <Card gender={gender}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🎯</div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.3rem, 4vw, 1.7rem)",
          color: isPink ? "#c2185b" : "white",
          marginBottom: 6,
        }}>Now… be brutally honest about the Chief Advisor (Aadi)</h2>
        <p style={{
          fontSize: "0.8rem",
          color: isPink ? "rgba(194,24,91,0.6)" : "rgba(255,255,255,0.4)",
          fontStyle: "italic",
        }}>He asked for this. Don't hold back. 🙏</p>
      </div>

      {[
        { key: "helpful", label: "Was he actually helpful or just vibes?", opts: [
          { value: "very_helpful", label: isPink ? "Super helpful bestie 💖" : "Genuinely W, carried hard 🏆" },
          { value: "somewhat", label: isPink ? "Kinda helpful ngl" : "Had moments, not consistent" },
          { value: "vibes_only", label: isPink ? "More vibe than substance tbh 👀" : "Pure vibes, low substance" },
          { value: "mia", label: isPink ? "He was… present? 💀" : "Basically a ghost 👻" },
        ]},
        { key: "guided", label: "Did he actually guide you or just exist?", opts: [
          { value: "guided", label: isPink ? "Yes, actually guided us!" : "Yes, real guidance delivered" },
          { value: "half", label: isPink ? "Sometimes, not always 🤷" : "Hit or miss tbh" },
          { value: "existed", label: isPink ? "He existed, I guess 😶" : "Just existed bro" },
        ]},
      ].map(({ key, label, opts }) => (
        <div key={key} style={{ marginBottom: 18 }}>
          <p style={{ fontSize: "0.95rem", fontWeight: 700, color: isPink ? "#c2185b" : "white", marginBottom: 10 }}>{label}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {opts.map(opt => {
              const sel = data[key] === opt.value;
              return (
                <button key={opt.value} onClick={() => onChange(key, opt.value)} style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${sel ? accent : (isPink ? "rgba(255,110,180,0.2)" : "rgba(255,255,255,0.1)")}`,
                  background: sel ? (isPink ? "rgba(255,110,180,0.12)" : "rgba(0,245,200,0.08)") : "transparent",
                  color: isPink ? (sel ? "#c2185b" : "#999") : (sel ? "var(--neon)" : "rgba(255,255,255,0.65)"),
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  fontWeight: sel ? 700 : 400,
                }}>{opt.label}</button>
              );
            })}
          </div>
        </div>
      ))}

      {[
        { key: "word", label: "One word for him:", placeholder: isPink ? "E.g. 'legend', 'mid', 'trying' 💅" : "E.g. 'W', 'L', 'mixed bag'" },
        { key: "improve", label: "What should he improve?", placeholder: isPink ? "Be honest babe, no sugarcoating 🍬" : "Real talk, what's the actual fix?" },
        { key: "well", label: "What did he do well?", placeholder: isPink ? "Give credit where it's due ✨" : "Credit where it's due" },
      ].map(({ key, label, placeholder }) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: isPink ? "#c2185b" : "white", marginBottom: 8 }}>{label}</p>
          <textarea
            value={data[key] || ""}
            onChange={e => onChange(key, e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              minHeight: key === "word" ? 48 : 80,
              background: isPink ? "rgba(255,110,180,0.06)" : "rgba(0,245,200,0.05)",
              border: `1.5px solid ${isPink ? "rgba(255,110,180,0.25)" : "rgba(0,245,200,0.15)"}`,
              borderRadius: 10,
              padding: "10px 14px",
              color: isPink ? "#c2185b" : "white",
              fontFamily: "'Syne', sans-serif",
              fontSize: "0.9rem",
              resize: "none",
              outline: "none",
            }}
          />
        </div>
      ))}
    </Card>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function Landing({ onStart }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 40%, #0a1a0a 100%)",
      backgroundSize: "400% 400%",
      animation: "bgFlow 8s ease infinite",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      textAlign: "center",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      <FloatingEmojis emojis={["☕", "🔥", "💀", "✨", "🎯", "🌶️", "⚡", "🏆", "🎭", "💬", "🗳️", "🎪"]} />

      {/* Glow orbs */}
      {[
        { x: "20%", y: "20%", c: "rgba(124,58,237,0.2)" },
        { x: "75%", y: "60%", c: "rgba(0,245,200,0.15)" },
        { x: "50%", y: "80%", c: "rgba(255,110,180,0.1)" },
      ].map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          left: o.x, top: o.y,
          width: 300, height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${o.c}, transparent)`,
          filter: "blur(40px)",
          pointerEvents: "none",
          animation: `float ${4 + i}s ease-in-out infinite`,
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 10, animation: "fadeSlideUp 0.8s ease forwards" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: 12, animation: "float 3s ease-in-out infinite" }}>☕</div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2rem, 8vw, 3.5rem)",
          background: "linear-gradient(135deg, #ff6eb4, var(--neon), #a855f7)",
          backgroundSize: "200%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmer 3s linear infinite",
          marginBottom: 12,
          lineHeight: 1.2,
        }}>Spill The Tea</h1>
        <div style={{
          fontSize: "clamp(1rem, 3vw, 1.3rem)",
          color: "rgba(255,255,255,0.7)",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}>MUN Feedback</div>
        <p style={{
          fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
          color: "rgba(255,255,255,0.5)",
          maxWidth: 440,
          margin: "0 auto 12px",
          lineHeight: 1.6,
        }}>Takes 5 minutes. Brutal honesty appreciated.</p>
        <div style={{
          display: "inline-block",
          background: "rgba(0,245,200,0.1)",
          border: "1px solid rgba(0,245,200,0.3)",
          borderRadius: 50,
          padding: "6px 16px",
          fontSize: "0.8rem",
          color: "var(--neon)",
          fontWeight: 700,
          marginBottom: 32,
          letterSpacing: "0.05em",
        }}>🔐 No names. No judgment. 100% anonymous.</div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {["Let's Go", "I Have Opinions", "Time to Judge Us"].map((txt, i) => (
            <button
              key={i}
              onClick={() => onStart()}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(false)}
              style={{
                padding: "16px 32px",
                borderRadius: 50,
                border: "2px solid",
                borderColor: i === 0 ? "var(--neon)" : i === 1 ? "var(--pink-1)" : "#a855f7",
                background: hovered === i
                  ? (i === 0 ? "var(--neon)" : i === 1 ? "var(--pink-1)" : "#a855f7")
                  : "transparent",
                color: hovered === i
                  ? (i === 0 ? "var(--dark-1)" : "white")
                  : (i === 0 ? "var(--neon)" : i === 1 ? "var(--pink-1)" : "#a855f7"),
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.25s",
                letterSpacing: "0.05em",
              }}
            >{txt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GENDER SELECT ────────────────────────────────────────────────────────────
function GenderSelect({ onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #2d0a1f 0%, #1a0a2e 50%, #0a1a2e 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      animation: "fadeSlideUp 0.5s ease forwards",
    }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
        color: "white",
        marginBottom: 8,
        textAlign: "center",
      }}>Before we begin…</h2>
      <p style={{
        color: "rgba(255,255,255,0.5)",
        marginBottom: 40,
        fontSize: "1.1rem",
        textAlign: "center",
      }}>your vibe?</p>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          {
            id: "girl",
            emoji: "👑",
            label: "Girly Pop",
            bg: "linear-gradient(135deg, #ff6eb4, #ff9dcf, #ffb3d9)",
            glow: "rgba(255,110,180,0.4)",
          },
          {
            id: "boy",
            emoji: "🕶️",
            label: "Bro Mode",
            bg: "linear-gradient(135deg, #0a0a0f, #1e1e2e, #12121a)",
            glow: "rgba(0,245,200,0.3)",
            border: "2px solid rgba(0,245,200,0.4)",
          },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            onMouseEnter={() => setHovered(opt.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: 200,
              height: 220,
              borderRadius: 28,
              border: opt.border || "none",
              background: opt.bg,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              boxShadow: hovered === opt.id
                ? `0 20px 60px ${opt.glow}`
                : `0 8px 30px ${opt.glow}`,
              transform: hovered === opt.id ? "translateY(-8px) scale(1.03)" : "none",
              transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <span style={{ fontSize: "3.5rem" }}>{opt.emoji}</span>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "1.3rem",
              color: opt.id === "girl" ? "white" : "var(--neon)",
              letterSpacing: "0.05em",
            }}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SUBMISSION SCREEN ────────────────────────────────────────────────────────
function Submitting({ gender }) {
  const isPink = gender === "girl";
  const msgs = isPink
    ? ["Analyzing your vibes...", "Counting the tea spilled...", "Sending with main character energy..."]
    : ["Processing your W takes...", "Compiling the data...", "Uploading the honest truth..."];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % msgs.length), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: isPink
        ? "linear-gradient(135deg, #ffe0f0, #fff0f7)"
        : "linear-gradient(135deg, #0a0a0f, #1e1e2e)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 20,
    }}>
      <div style={{
        width: 60, height: 60,
        border: `4px solid ${isPink ? "rgba(255,110,180,0.2)" : "rgba(0,245,200,0.2)"}`,
        borderTop: `4px solid ${isPink ? "var(--pink-1)" : "var(--neon)"}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }} />
      <p style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "1rem",
        color: isPink ? "var(--pink-1)" : "var(--neon)",
        fontWeight: 700,
        animation: "fadeSlideUp 0.4s ease forwards",
        key: msgIdx,
      }}>{msgs[msgIdx]}</p>
    </div>
  );
}

// ─── THANK YOU SCREEN ─────────────────────────────────────────────────────────
function ThankYou({ gender }) {
  const isPink = gender === "girl";

  return (
    <div style={{
      minHeight: "100vh",
      background: isPink
        ? "linear-gradient(135deg, #ffe0f0, #fff0f7, #fff8fc)"
        : "linear-gradient(135deg, #0a0a0f, #0f1a1a, #12121a)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      textAlign: "center",
      padding: 24,
      position: "relative",
      overflow: "hidden",
    }}>
      {isPink ? <Sparkles count={20} /> : <FloatingEmojis emojis={["🏆", "⚡", "🎯", "🔥", "💀"]} />}
      <div style={{ position: "relative", zIndex: 10, animation: "fadeSlideUp 0.7s ease forwards" }}>
        <div style={{ fontSize: "4rem", marginBottom: 16, animation: "float 2.5s ease-in-out infinite" }}>
          {isPink ? "🫶" : "🤝"}
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
          color: isPink ? "#c2185b" : "white",
          marginBottom: 12,
          lineHeight: 1.2,
        }}>Thanks for being honest.</h1>
        <p style={{
          fontSize: "1.1rem",
          color: isPink ? "rgba(194,24,91,0.7)" : "rgba(255,255,255,0.55)",
          maxWidth: 400,
          margin: "0 auto 8px",
          fontStyle: "italic",
        }}>
          {isPink
            ? "We can take it. Probably. 💅"
            : "We can take it. Probably. (L or W, respect either way)"}
        </p>
        <p style={{
          fontSize: "0.85rem",
          color: isPink ? "rgba(194,24,91,0.5)" : "rgba(255,255,255,0.3)",
          marginTop: 20,
        }}>Your feedback helps us level up. Fr.</p>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
const ADMIN_PASS = "mun2025admin";

function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);
  const [responses, setResponses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const login = () => {
    if (pass === ADMIN_PASS) { setAuthed(true); loadData(); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  };

  const loadData = async () => {
    setLoading(true);
    const data = await db._getAll();
    setResponses(data);
    setLoading(false);
  };

  const filtered = filter === "all" ? responses : responses.filter(r => r.gender === filter);
  const avgRating = (key) => {
    const vals = filtered.map(r => r[key]).filter(v => typeof v === "number");
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "N/A";
  };

  if (!authed) return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
    }}>
      <div style={{ fontSize: "2rem" }}>🔐</div>
      <h2 style={{ color: "var(--neon)", fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>Admin Access</h2>
      <input
        type="password"
        value={pass}
        onChange={e => setPass(e.target.value)}
        onKeyDown={e => e.key === "Enter" && login()}
        placeholder="Enter password"
        style={{
          background: "rgba(0,245,200,0.05)",
          border: `1.5px solid ${err ? "#ff4444" : "rgba(0,245,200,0.3)"}`,
          borderRadius: 10,
          padding: "12px 18px",
          color: "white",
          fontFamily: "'Syne', sans-serif",
          fontSize: "1rem",
          outline: "none",
          width: 260,
          textAlign: "center",
          transition: "border-color 0.2s",
        }}
      />
      {err && <p style={{ color: "#ff4444", fontSize: "0.85rem" }}>Wrong password 🚫</p>}
      <button onClick={login} style={{
        background: "var(--neon)",
        color: "var(--dark-1)",
        border: "none",
        borderRadius: 10,
        padding: "12px 32px",
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        cursor: "pointer",
      }}>Enter</button>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "white",
      fontFamily: "'Syne', sans-serif",
      padding: "24px 20px",
      overflowY: "auto",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--neon)" }}>📊 MUN Feedback Dashboard</h1>
          <div style={{ display: "flex", gap: 8 }}>
            {["all", "girl", "boy"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: `1.5px solid ${filter === f ? "var(--neon)" : "rgba(255,255,255,0.15)"}`,
                background: filter === f ? "rgba(0,245,200,0.1)" : "transparent",
                color: filter === f ? "var(--neon)" : "rgba(255,255,255,0.5)",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                textTransform: "capitalize",
              }}>{f === "all" ? "All" : f === "girl" ? "👑 Girls" : "🕶️ Boys"}</button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Responses", val: filtered.length },
            { label: "Girls", val: responses.filter(r => r.gender === "girl").length },
            { label: "Boys", val: responses.filter(r => r.gender === "boy").length },
            { label: "Avg Committee", val: avgRating("committeeRating") },
            { label: "Avg Chairs", val: avgRating("chairsRating") },
            { label: "Would Return", val: filtered.filter(r => r.wouldReturn === "yes").length },
          ].map(({ label, val }) => (
            <div key={label} style={{
              background: "rgba(0,245,200,0.06)",
              border: "1px solid rgba(0,245,200,0.15)",
              borderRadius: 14,
              padding: "16px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--neon)", fontFamily: "'Space Mono', monospace" }}>{val}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Responses */}
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
          Responses ({filtered.length})
        </h2>
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>No responses yet. Share that link!</p>
        ) : filtered.map((r, i) => (
          <div key={r.id || i} style={{
            background: r.gender === "girl" ? "rgba(255,110,180,0.06)" : "rgba(0,245,200,0.04)",
            border: `1px solid ${r.gender === "girl" ? "rgba(255,110,180,0.2)" : "rgba(0,245,200,0.12)"}`,
            borderRadius: 16,
            padding: "18px",
            marginBottom: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontWeight: 700, color: r.gender === "girl" ? "var(--pink-1)" : "var(--neon)", fontSize: "0.9rem" }}>
                {r.gender === "girl" ? "👑 Girly Pop" : "🕶️ Bro Mode"}
              </span>
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>{r.ts?.slice(0, 16)?.replace("T", " ")}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
              {[
                ["Committee", r.committeeRating],
                ["Chairs", r.chairsRating],
                ["Guides", r.guidesRating],
                ["Infra", r.infraRating],
                ["Debates", r.debatesRating],
                ["Heard", r.heardRating],
              ].filter(([, v]) => v !== undefined).map(([lbl, val]) => (
                <div key={lbl} style={{ fontSize: "0.8rem" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>{lbl}: </span>
                  <span style={{ fontWeight: 700, color: "white", fontFamily: "'Space Mono'" }}>{val}/10</span>
                </div>
              ))}
            </div>
            {r.savage && <p style={{ marginTop: 10, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>
              "{r.savage}"
            </p>}
            {r.aadi?.word && <p style={{ marginTop: 8, fontSize: "0.8rem", color: "rgba(255,200,0,0.8)" }}>
              🎯 Aadi word: <strong>{r.aadi.word}</strong>
            </p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [gender, setGender] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    committeeRating: 5, chairsRating: 5, guidesRating: 5,
    infraRating: 5, debatesRating: 5, heardRating: 5,
    chairsChoice: "", chairsComment: "", guidesComment: "",
    infraComment: "", heardComment: "", bestMoment: "", biggestMess: "",
    wouldReturn: "", wouldReturnWhy: "", recommend: 5, savage: "",
    aadi: { helpful: "", guided: "", word: "", improve: "", well: "" },
  });

  const isAdmin = typeof window !== "undefined" && window.location.hash === "#admin";
  if (isAdmin) return (
    <>
      <style>{globalStyles}</style>
      <AdminPanel />
    </>
  );

  const set = (key, val) => setAnswers(a => ({ ...a, [key]: val }));
  const setAadi = (key, val) => setAnswers(a => ({ ...a, aadi: { ...a.aadi, [key]: val } }));

  const isPink = gender === "girl";
  const submitForm = async () => {
  setScreen("submitting");
  await db._submit({ gender, ...answers, ts: new Date().toISOString() });
  setTimeout(() => setScreen("thankyou"), 2800);
};
  // Girl questions
  const girlSteps = [
    <QuestionScreen key="g0" gender="girl" step={1} totalSteps={12} onNext={() => setStep(1)}>
      <SliderQ gender="girl" label="How slay was the committee overall? 💅"
        value={answers.committeeRating} onChange={v => set("committeeRating", v)}
        emojis={["💀", "😬", "😐", "✨", "🔥", "👑"]} />
    </QuestionScreen>,
    <QuestionScreen key="g1" gender="girl" step={2} totalSteps={12} onNext={() => setStep(2)}
      canNext={!!answers.chairsChoice}>
      <ChoiceQ gender="girl"
        label="Did the chairs give main character energy or NPC vibes? 🎭"
        options={[
          { value: "main", label: "Main character ALL the way 🌟" },
          { value: "side", label: "Strong supporting cast" },
          { value: "npc", label: "NPC coded honestly 💀" },
          { value: "chaotic", label: "Chaotic neutral — no notes" },
        ]}
        value={answers.chairsChoice} onChange={v => set("chairsChoice", v)}
      />
    </QuestionScreen>,
    <QuestionScreen key="g2" gender="girl" step={3} totalSteps={12} onNext={() => setStep(3)}>
      <SliderQ gender="girl" label="Were the guides actually helpful or just ✨aesthetic✨?"
        value={answers.guidesRating} onChange={v => set("guidesRating", v)}
        emojis={["💀", "😐", "🤷", "✨", "🔥"]} />
    </QuestionScreen>,
    <QuestionScreen key="g3" gender="girl" step={4} totalSteps={12} onNext={() => setStep(4)}>
      <SliderQ gender="girl" label="Infra check 💖 — was the venue giving premium or school assembly?"
        value={answers.infraRating} onChange={v => set("infraRating", v)}
        emojis={["🏚️", "🏫", "🏢", "✨", "🏰"]} />
    </QuestionScreen>,
    <QuestionScreen key="g4" gender="girl" step={5} totalSteps={12} onNext={() => setStep(5)}>
      <SliderQ gender="girl" label="Did you feel heard or just… there? 👁️"
        value={answers.heardRating} onChange={v => set("heardRating", v)}
        emojis={["👻", "😶", "🤔", "🎤", "💫"]} />
    </QuestionScreen>,
    <QuestionScreen key="g5" gender="girl" step={6} totalSteps={12} onNext={() => setStep(6)}>
      <TextQ gender="girl" label="One thing that made you go 'okay this ate' 🍽️"
        value={answers.bestMoment} onChange={v => set("bestMoment", v)}
        placeholder="Spill it bestie..." optional />
    </QuestionScreen>,
    <QuestionScreen key="g6" gender="girl" step={7} totalSteps={12} onNext={() => setStep(7)}>
      <TextQ gender="girl" label="One thing that made you go 'this ain't it' 🚩"
        value={answers.biggestMess} onChange={v => set("biggestMess", v)}
        placeholder="No holding back..." optional />
    </QuestionScreen>,
    <QuestionScreen key="g7" gender="girl" step={8} totalSteps={12} onNext={() => setStep(8)} canNext={!!answers.wouldReturn}>
      <ChoiceQ gender="girl"
        label="Would you come again? 👀"
        options={[
          { value: "yes", label: "Yes bestie, absolutely 💖" },
          { value: "no", label: "No, and here's why..." },
          { value: "depends", label: "Depends... (girl math 🧮)" },
        ]}
        value={answers.wouldReturn} onChange={v => set("wouldReturn", v)}
      />
    </QuestionScreen>,
    <QuestionScreen key="g8" gender="girl" step={9} totalSteps={12} onNext={() => setStep(9)}>
      <SliderQ gender="girl" label="Would you recommend this MUN to your friends? 💬"
        value={answers.recommend} onChange={v => set("recommend", v)}
        emojis={["🚫", "🤨", "🤷", "✨", "🔥"]} />
    </QuestionScreen>,
    <QuestionScreen key="g9" gender="girl" step={10} totalSteps={12} onNext={() => setStep(10)}>
      <TextQ gender="girl" label="Describe this MUN in ONE savage sentence 👑"
        value={answers.savage} onChange={v => set("savage", v)}
        placeholder="No filter. Go off." optional />
    </QuestionScreen>,
    <QuestionScreen key="g10" gender="girl" step={11} totalSteps={12} onNext={() => setStep(11)}>
      <AadiSection gender="girl" data={answers.aadi} onChange={setAadi} />
    </QuestionScreen>,
    <QuestionScreen key="g11" gender="girl" step={12} totalSteps={12}
      customBtn={
        <button onClick={submitForm} style={{
          padding: "14px 44px",
          borderRadius: 50,
          border: "none",
          cursor: "pointer",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: "1rem",
          background: "linear-gradient(135deg, var(--pink-1), #ff9dcf)",
          color: "white",
          boxShadow: "0 4px 20px rgba(255,110,180,0.5)",
          animation: "pulse 2s ease-in-out infinite",
          letterSpacing: "0.05em",
        }}>Submit 💅 Done!</button>
      }>
      <Card gender="girl">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🫗</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#c2185b", marginBottom: 8 }}>
            That's all the tea!
          </h2>
          <p style={{ color: "rgba(194,24,91,0.6)", fontSize: "0.9rem" }}>
            Review your answers and hit submit. Remember — it's completely anonymous 🔐
          </p>
          <div style={{ marginTop: 20, textAlign: "left", background: "rgba(255,110,180,0.06)", borderRadius: 12, padding: 14 }}>
            {[
              ["Committee", answers.committeeRating + "/10"],
              ["Chairs", answers.chairsChoice],
              ["Guides", answers.guidesRating + "/10"],
              ["Infrastructure", answers.infraRating + "/10"],
              ["Felt Heard", answers.heardRating + "/10"],
              ["Would Return", answers.wouldReturn],
            ].map(([k, v]) => v && (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "0.85rem" }}>
                <span style={{ color: "rgba(194,24,91,0.6)" }}>{k}</span>
                <span style={{ fontWeight: 700, color: "#c2185b" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </QuestionScreen>,
  ];

  // Boy questions
  const boySteps = [
    <QuestionScreen key="b0" gender="boy" step={1} totalSteps={12} onNext={() => setStep(1)}>
      <SliderQ gender="boy" label="Rate the committee. No diplomacy. 💀"
        value={answers.committeeRating} onChange={v => set("committeeRating", v)}
        emojis={["❌", "📉", "📊", "📈", "🏆"]} />
    </QuestionScreen>,
    <QuestionScreen key="b1" gender="boy" step={2} totalSteps={12} onNext={() => setStep(2)} canNext={!!answers.chairsChoice}>
      <ChoiceQ gender="boy"
        label="Chairs — W or L?"
        options={[
          { value: "big_w", label: "Big W, ran it clean 🏆" },
          { value: "w", label: "Decent W, no complaints" },
          { value: "mixed", label: "Mixed bag tbh" },
          { value: "l", label: "L. Full stop." },
        ]}
        value={answers.chairsChoice} onChange={v => set("chairsChoice", v)}
      />
    </QuestionScreen>,
    <QuestionScreen key="b2" gender="boy" step={3} totalSteps={12} onNext={() => setStep(3)}>
      <SliderQ gender="boy" label="Guides: actually useful or just formality?"
        value={answers.guidesRating} onChange={v => set("guidesRating", v)}
        emojis={["🗑️", "🤔", "📋", "✅", "🎯"]} />
    </QuestionScreen>,
    <QuestionScreen key="b3" gender="boy" step={4} totalSteps={12} onNext={() => setStep(4)}>
      <SliderQ gender="boy" label="Infrastructure — premium or budget?"
        value={answers.infraRating} onChange={v => set("infraRating", v)}
        emojis={["💀", "🏚️", "🏢", "🏙️", "🌆"]} />
    </QuestionScreen>,
    <QuestionScreen key="b4" gender="boy" step={5} totalSteps={12} onNext={() => setStep(5)}>
      <SliderQ gender="boy" label="Did debates feel competitive or dead?"
        value={answers.debatesRating} onChange={v => set("debatesRating", v)}
        emojis={["🪦", "😴", "🤝", "⚔️", "🔥"]} />
    </QuestionScreen>,
    <QuestionScreen key="b5" gender="boy" step={6} totalSteps={12} onNext={() => setStep(6)}>
      <TextQ gender="boy" label="Best moment?"
        value={answers.bestMoment} onChange={v => set("bestMoment", v)}
        placeholder="What actually slapped?" optional />
    </QuestionScreen>,
    <QuestionScreen key="b6" gender="boy" step={7} totalSteps={12} onNext={() => setStep(7)}>
      <TextQ gender="boy" label="Biggest mess-up?"
        value={answers.biggestMess} onChange={v => set("biggestMess", v)}
        placeholder="Don't sugarcoat it." optional />
    </QuestionScreen>,
    <QuestionScreen key="b7" gender="boy" step={8} totalSteps={12} onNext={() => setStep(8)} canNext={!!answers.wouldReturn}>
      <ChoiceQ gender="boy"
        label="Would you come again?"
        options={[
          { value: "yes", label: "Yes, would run it back ✅" },
          { value: "no", label: "No, I've seen enough" },
          { value: "depends", label: "Depends on the lineup" },
        ]}
        value={answers.wouldReturn} onChange={v => set("wouldReturn", v)}
      />
    </QuestionScreen>,
    <QuestionScreen key="b8" gender="boy" step={9} totalSteps={12} onNext={() => setStep(9)}>
      <SliderQ gender="boy" label="Would you recommend this MUN?"
        value={answers.recommend} onChange={v => set("recommend", v)}
        emojis={["🚫", "🤨", "🤷", "👍", "🔥"]} />
    </QuestionScreen>,
    <QuestionScreen key="b9" gender="boy" step={10} totalSteps={12} onNext={() => setStep(10)}>
      <TextQ gender="boy" label="Describe this MUN in ONE savage sentence."
        value={answers.savage} onChange={v => set("savage", v)}
        placeholder="Straight up, no cap." optional />
    </QuestionScreen>,
    <QuestionScreen key="b10" gender="boy" step={11} totalSteps={12} onNext={() => setStep(11)}>
      <AadiSection gender="boy" data={answers.aadi} onChange={setAadi} />
    </QuestionScreen>,
    <QuestionScreen key="b11" gender="boy" step={12} totalSteps={12}
      customBtn={
        <button onClick={submitForm} style={{
          padding: "14px 44px",
          borderRadius: 50,
          border: "none",
          cursor: "pointer",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: "1rem",
          background: "linear-gradient(135deg, var(--neon), #06b6d4)",
          color: "var(--dark-1)",
          boxShadow: "0 4px 20px rgba(0,245,200,0.4)",
          animation: "pulse 2s ease-in-out infinite",
          letterSpacing: "0.05em",
        }}>Submit → Ship it.</button>
      }>
      <Card gender="boy">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎯</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "white", marginBottom: 8 }}>
            Final check.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            Review your takes. Then ship it. Anonymous. Always.
          </p>
          <div style={{ marginTop: 20, textAlign: "left", background: "rgba(0,245,200,0.05)", borderRadius: 12, padding: 14 }}>
            {[
              ["Committee", answers.committeeRating + "/10"],
              ["Chairs", answers.chairsChoice],
              ["Guides", answers.guidesRating + "/10"],
              ["Infrastructure", answers.infraRating + "/10"],
              ["Debates", answers.debatesRating + "/10"],
              ["Would Return", answers.wouldReturn],
            ].map(([k, v]) => v && (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "0.85rem" }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>{k}</span>
                <span style={{ fontWeight: 700, color: "var(--neon)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </QuestionScreen>,
  ];

  const currentSteps = gender === "girl" ? girlSteps : boySteps;

  const bg = isPink
    ? "linear-gradient(135deg, #fff0f7 0%, #ffe0f0 50%, #fff8fc 100%)"
    : "linear-gradient(135deg, #0a0a0f 0%, #12121a 60%, #0f1a1a 100%)";

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{
        minHeight: "100vh",
        background: screen === "landing" || screen === "gender" || screen === "submitting" || screen === "thankyou"
          ? undefined
          : bg,
        overflowY: "auto",
        overflowX: "hidden",
      }}>
        {isPink && screen === "questions" && <Sparkles count={8} />}
        {!isPink && gender && screen === "questions" && <FloatingEmojis emojis={["⚡", "🔥", "💀", "🎯", "🏆"]} />}

        {screen === "landing" && <Landing onStart={() => setScreen("gender")} />}
        {screen === "gender" && <GenderSelect onSelect={g => { setGender(g); setScreen("questions"); setStep(0); }} />}
        {screen === "questions" && currentSteps[step]}
        {screen === "submitting" && <Submitting gender={gender} />}
        {screen === "thankyou" && <ThankYou gender={gender} />}
      </div>
    </>
  );
}
