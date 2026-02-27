"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Zap, Shield, Share2, Cpu,
  Radio, Fingerprint, ChevronRight, Lock,
  Globe, Check
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   NANDIX LANDING PAGE — Billion Dollar Brand
   #0A0A0F void · #00D9A5 teal · Space Grotesk · No cyberpunk.
══════════════════════════════════════════════════════════════ */

/* ── Particle Network Canvas ───────────────────────────────── */
function ParticleNet() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const NC = "rgba(37, 99, 235, 0.12)";
    const LC = "rgba(148, 163, 184, 0.08)";
    type Node = { x: number; y: number; vx: number; vy: number };
    const nodes: Node[] = [];

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };

    const init = () => {
      resize();
      nodes.length = 0;
      const count = Math.min(60, Math.floor(canvas.width / 20));
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = NC;
        ctx.fill();
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = LC;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    init();
    draw();
    const onR = () => init();
    window.addEventListener("resize", onR);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ── Feature Block ─────────────────────────────────────────── */
function FeatureBlock({ flip, icon: Icon, eyebrow, title, description, visual, delay = 0 }: {
  flip?: boolean; icon: any; eyebrow: string; title: string;
  description: string; visual: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${flip ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 py-20 border-b border-[var(--bg-border)]`}
    >
      <div className="flex-1 min-w-0">
        <div className="eyebrow mb-4 flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" style={{ color: "var(--teal)" }} />
          {eyebrow}
        </div>
        <h3 className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold text-slate-900 leading-tight tracking-tight mb-5">
          {title}
        </h3>
        <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed max-w-md">
          {description}
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-[200px]">
        {visual}
      </div>
    </motion.div>
  );
}

/* ── SVG Visuals ───────────────────────────────────────────── */
function VisualP2P() {
  return (
    <div className="relative w-full max-w-[340px] h-[180px]">
      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl card flex items-center justify-center">
        <Cpu className="w-7 h-7" style={{ color: "var(--teal)" }} />
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl card flex items-center justify-center">
        <Cpu className="w-7 h-7" style={{ color: "var(--teal)" }} />
      </div>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 340 180">
        <motion.path d="M88 90 L252 90" stroke="var(--teal)" strokeWidth="1.5"
          strokeDasharray="8 5" fill="none"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
          viewport={{ once: true }} transition={{ duration: 1.5, ease: "easeInOut" }} />
        <motion.circle cx="170" cy="90" r="4" fill="var(--teal)"
          animate={{ cx: [88, 252, 88] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
      </svg>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 card px-3 py-1.5">
        <span className="label-data" style={{ color: "var(--teal)" }}>Direct Sovereign Link</span>
      </div>
      <div className="absolute bottom-3 left-4 label-data">Device A</div>
      <div className="absolute bottom-3 right-4 label-data">Device B</div>
    </div>
  );
}

function VisualKey() {
  const chars = "0AD074E7".split("");
  return (
    <div className="card p-5 w-full max-w-[320px]">
      <div className="label-data mb-3">Keypair Generated</div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ background: "var(--teal)" }} />
        <span className="font-mono text-[11px]" style={{ color: "var(--teal)" }}>PUBLIC KEY</span>
      </div>
      <div className="font-mono text-[10px]" style={{ color: "var(--text-muted)", wordBreak: "break-all" }}>
        {chars.map((c, i) => (
          <motion.span key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
            {c}
          </motion.span>
        ))}
        ...
      </div>
      <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--bg-border)" }}>
        <div className="label-data flex items-center gap-2">
          <Check className="w-3 h-3" style={{ color: "var(--teal)" }} />
          Stored only on your device
        </div>
      </div>
    </div>
  );
}

function VisualTransfer() {
  return (
    <div className="relative flex flex-col items-center gap-3 w-full max-w-[280px]">
      <div className="card w-full p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg card-elevated flex items-center justify-center">
            <Share2 className="w-4 h-4" style={{ color: "var(--teal)" }} />
          </div>
          <div>
            <div className="text-white text-[13px] font-medium">design_v9.fig</div>
            <div className="label-data">128 MB</div>
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: "var(--bg-border)" }}>
          <motion.div className="h-1.5 rounded-full" style={{ background: "var(--teal)" }}
            initial={{ width: "0%" }} whileInView={{ width: "78%" }}
            viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut" }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="label-data">78%</span>
          <span className="label-data" style={{ color: "var(--teal)" }}>12.4 MB/s</span>
        </div>
      </div>
      <div className="label-data text-center">No cloud. Direct wormhole.</div>
    </div>
  );
}

function VisualGhost() {
  return (
    <div className="card w-full max-w-[300px] p-4">
      <div className="label-data mb-3 flex items-center gap-2">
        <div className="status-online" />
        GHOST CORE // LOCAL
      </div>
      {[
        { role: "user", text: "Summarize this signal thread" },
        { role: "ghost", text: "Running locally. Zero network calls." },
      ].map((m, i) => (
        <div key={i} className={`mb-2 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`px-3 py-2 rounded-xl text-[12px] max-w-[80%] ${m.role === "user"
            ? "text-[#0A0A0F] font-medium"
            : "text-[var(--text-secondary)]"
            }`}
            style={{ background: m.role === "user" ? "var(--teal)" : "var(--bg-border)" }}>
            {m.text}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-1.5 mt-2" style={{ color: "var(--teal)" }}>
        {[0, 0.15, 0.3].map(d => (
          <motion.div key={d} animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: d }}
            className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--teal)" }} />
        ))}
        <span className="label-data ml-1" style={{ color: "var(--teal)" }}>Thinking locally…</span>
      </div>
    </div>
  );
}

/* ─── HOW IT WORKS STEP ────────────────────────────────────── */
function HowStep({ n, icon: Icon, title, body }: { n: string; icon: any; title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="card p-6 flex flex-col gap-4 flex-1"
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--teal-glow)", border: "1px solid var(--teal-border)" }}>
          <Icon className="w-5 h-5" style={{ color: "var(--teal)" }} />
        </div>
        <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>{n}</span>
      </div>
      <div>
        <h4 className="font-display font-bold text-slate-900 text-[17px] mb-2 tracking-tight">{title}</h4>
        <p className="text-[13px] leading-relaxed text-slate-600">{body}</p>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const features = [
    { icon: Shield, eyebrow: "Zero-Server Architecture", title: "No Servers.\nNo Surveillance.", description: "Your messages never touch a data center. Direct peer-to-peer connections via WebRTC mean only you and your recipient can read your signals.", visual: <VisualP2P />, flip: false },
    { icon: Fingerprint, eyebrow: "Sovereign Identity", title: "Your Identity.\nYour Keys.", description: "Cryptographic keypairs generated locally using WebCrypto. No phone numbers. No emails. No tracking. Just pure, pseudonymous sovereignty.", visual: <VisualKey />, flip: true },
    { icon: Share2, eyebrow: "Wormhole Transfer", title: "Transfer Anything.\nInstantly.", description: "Drop files, images, or data directly between devices. No upload limits. No cloud storage. Peer-to-peer transfer through the mesh.", visual: <VisualTransfer />, flip: false },
    { icon: Cpu, eyebrow: "Ghost Core // Local AI", title: "AI That Works\nFor You. Locally.", description: "Transformers.js runs your AI models entirely inside your browser tab. Summarize, translate, create — privately. Zero API calls.", visual: <VisualGhost />, flip: true },
  ];

  return (
    <div style={{ background: "var(--bg-base)", color: "var(--text-primary)" }} className="overflow-hidden">

      {/* ── NAV ────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass flex items-center justify-between px-6 py-0 h-14">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--teal-glow)", border: "1px solid var(--teal-border)" }}>
            <Zap className="w-4 h-4" style={{ color: "var(--teal)" }} />
          </div>
          <span className="font-display font-bold text-slate-900 text-[15px] tracking-tight">NANDIX</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {[["Manifesto", "/manifesto"], ["Features", "#features"], ["Protocol", "#how"]].map(([l, h]) => (
            <a key={l} href={h} className="btn-ghost text-[13px]">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-[13px]">Sign in</Link>
          <Link href="/nandix" className="btn-teal py-2 px-5 text-[13px] rounded-lg">
            Enter Mesh <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ══ HERO ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-14">
        <ParticleNet />

        {/* Teal radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,217,165,0.06) 0%, transparent 70%)" }} />

        <motion.div style={{ opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">

          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)" }}>
            <div className="status-online" />
            <span className="eyebrow">The Sovereign Mesh Protocol</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="display-xl mb-4 text-slate-900">
            Own Your Signal.
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="display-xl mb-8 -webkit-text-stroke-slate-900 text-transparent opacity-20"
            style={{ WebkitTextStroke: "1px #0F172A" }}>
            Own Everything.
          </motion.div>

          {/* Sub */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
            className="text-[var(--text-secondary)] text-[17px] leading-relaxed max-w-xl mb-10">
            Zero-server messaging. End-to-end encrypted. Local AI.
            You are the node. You are the network.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link href="/nandix" className="btn-teal text-[15px] py-3.5 px-8 rounded-xl">
              Enter the Mesh <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/manifesto" className="btn-outline text-[15px] py-3.5 px-8 rounded-xl">
              Read the Manifesto
            </Link>
          </motion.div>

          {/* Trust badge */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex items-center gap-6 flex-wrap justify-center">
            {["Open Source", "Peer-to-Peer", "Zero Knowledge"].map((t, i) => (
              <span key={t} className="flex items-center gap-2 label-data">
                <Check className="w-3 h-3" style={{ color: "var(--teal)" }} />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
            style={{ border: "1.5px solid var(--bg-border)" }}>
            <motion.div className="w-1 h-1.5 rounded-full"
              style={{ background: "var(--teal)" }}
              animate={{ opacity: [1, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* ══ MARQUEE ════════════════════════════════════ */}
      <div className="overflow-hidden py-3 border-y" style={{ borderColor: "var(--bg-border)", background: "var(--bg-elevated)" }}>
        <div className="flex animate-marquee whitespace-nowrap">
          {Array(4).fill(["SOVEREIGN MESH", "ZERO SERVERS", "P2P ENCRYPTED", "BROWSER AI", "DECENTRALIZED FEED", "TRUST PROTOCOL", "OPEN MESH", "NO ALGORITHM"]).flat().map((t, i) => (
            <span key={i} className="label-data flex-shrink-0 mx-8">
              {t} <span className="mx-6" style={{ color: "var(--teal)", opacity: 0.4 }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══ FEATURES ═══════════════════════════════════ */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center pt-16 pb-4">
          <div className="eyebrow mb-4">Why NANDIX</div>
          <h2 className="display-md mb-4">Built for the sovereign<br />user of the future.</h2>
          <p className="text-[var(--text-secondary)] text-[15px] max-w-lg mx-auto leading-relaxed">
            Every feature exists because server-based alternatives don't respect your ownership.
          </p>
        </motion.div>
        {features.map((f, i) => (
          <FeatureBlock key={f.title} {...f} delay={i * 0.08} />
        ))}
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════ */}
      <section id="how" className="py-28 px-6" style={{ background: "var(--bg-elevated)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className="eyebrow mb-4">The Protocol</div>
            <h2 className="display-md">Three steps to sovereignty.</h2>
          </motion.div>
          <div className="flex flex-col md:flex-row gap-4">
            <HowStep n="01" icon={Fingerprint} title="Generate Your Keypair" body="Cryptographic identity created in-browser via WebCrypto. No registration. Never leaves your device." />
            <HowStep n="02" icon={Radio} title="Connect to the Mesh" body="PeerJS connects you directly to other sovereign nodes. No relay server touches your data." />
            <HowStep n="03" icon={Zap} title="Signal Freely" body="Message, share files, post to the feed, run local AI — all propagated peer-to-peer through the mesh." />
          </div>
        </div>
      </section>

      {/* ══ STATS ══════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: "0", label: "Servers" },
            { val: "∞", label: "Sovereignty" },
            { val: "E2E", label: "Encrypted" },
            { val: "0%", label: "Data Harvested" },
          ].map(s => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card p-6 text-center"
            >
              <div className="font-display font-bold text-[2.5rem] leading-none tracking-tight mb-2"
                style={{ color: "var(--teal)" }}>{s.val}</div>
              <div className="label-data">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════ */}
      <section className="py-28 px-6 relative overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,217,165,0.07) 0%, transparent 70%)" }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="eyebrow mb-6">Ready?</div>
            <h2 className="display-md mb-4">
              Reclaim your<br />digital sovereignty.
            </h2>
            <p className="text-[var(--text-secondary)] mb-10 text-[15px] max-w-md mx-auto leading-relaxed">
              Join nodes already broadcasting on the sovereign mesh. No account. No email. Just keys.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/nandix" className="btn-teal py-4 px-10 text-[15px] rounded-xl">
                Enter the Mesh — Free Forever <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="https://github.com" target="_blank" className="btn-outline py-4 px-8 text-[15px] rounded-xl">
                View on GitHub <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════ */}
      <footer className="py-16 px-6" style={{ background: "var(--bg-base)", borderTop: "1px solid var(--bg-border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { heading: "Product", links: ["Signal Feed", "Talk", "Wormhole", "Radar", "Ghost AI", "Sceptre"] },
              { heading: "Resources", links: ["Documentation", "GitHub", "Community", "Changelog"] },
              { heading: "Company", links: ["Manifesto", "Blog", "Contact", "Roadmap"] },
              { heading: "Legal", links: ["Privacy (ironic)", "Terms", "License (Open)"] },
            ].map(col => (
              <div key={col.heading}>
                <div className="label-data mb-4">{col.heading}</div>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-[13px] transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                      >{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
            style={{ borderTop: "1px solid var(--bg-border)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "var(--teal-glow)", border: "1px solid var(--teal-border)" }}>
                <Zap className="w-3.5 h-3.5" style={{ color: "var(--teal)" }} />
              </div>
              <span className="font-display font-bold text-slate-900 text-[14px]">NANDIX</span>
            </div>
            <p className="label-data text-center">
              © 2026 NANDIX Protocol. No Rights Reserved. Sovereign Mesh.
            </p>
            <div className="label-data">Zero servers. Zero tracking. Zero compromise.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
