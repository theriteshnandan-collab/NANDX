"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Shield, Lock, Globe, ArrowRight, Zap, Radio,
  Users, MessageSquare, Share2, Cpu, Fingerprint,
  ChevronRight, Sparkles, Wifi, Eye, GitBranch
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   NANDIX LANDING PAGE — AURORA BRUTALISM
   Chalk zones crash against Obsidian voids. Always both.
══════════════════════════════════════════════════════════════ */

/* ── Animated Mesh Nodes (Canvas) ─────────────────────────── */
function MeshCanvas({ light = false }: { light?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const NC = light ? "rgba(8,8,8,0.15)" : "rgba(16,185,129,0.3)";
  const LC = light ? "rgba(8,8,8,0.05)" : "rgba(16,185,129,0.08)";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const nodeColor = NC;
    const lineColor = LC;
    const nodes: { x: number; y: number; vx: number; vy: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    const init = () => {
      resize();
      const count = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
        });
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
      });
      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    init();
    draw();
    const onResize = () => { resize(); nodes.length = 0; init(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

/* ── Floating Signal Beacon ────────────────────────────────── */
function SignalBeacon() {
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-emerald-400/20"
          style={{ width: i * 40, height: i * 40 }}
          animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
          transition={{ duration: 2.5, delay: i * 0.6, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      <div className="w-10 h-10 rounded-full bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.6)] flex items-center justify-center">
        <Wifi className="w-5 h-5 text-black" />
      </div>
    </div>
  );
}

/* ── Feature Card (Bento) ──────────────────────────────────── */
function FeatureCard({ icon: Icon, title, body, accent, delay = 0 }: {
  icon: any; title: string; body: string; accent: string; delay?: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card-void group cursor-default relative overflow-hidden"
    >
      {/* Biome glow on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.4 }}
        className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-[48px] pointer-events-none"
        style={{ background: accent }}
      />
      <div className="relative z-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        <h3 className="font-black text-white text-[15px] mb-2 tracking-tight">{title}</h3>
        <p className="text-zinc-500 text-[13px] leading-relaxed font-medium">{body}</p>
      </div>
    </motion.div>
  );
}

/* ── How it Works Step ─────────────────────────────────────── */
function HowStep({ step, title, body, icon: Icon, accent, delay = 0 }: {
  step: string; title: string; body: string; icon: any; accent: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center px-6"
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 relative"
        style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}
      >
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black font-mono"
          style={{ background: accent, color: "#080808" }}>
          {step}
        </div>
        <Icon className="w-8 h-8" style={{ color: accent }} />
      </div>
      <h3 className="font-black text-[18px] text-[#080808] mb-3 tracking-tight">{title}</h3>
      <p className="text-zinc-500 text-[13px] leading-relaxed max-w-[220px] font-medium">{body}</p>
    </motion.div>
  );
}

/* ── Mock Post Card (Feed Preview) ────────────────────────── */
function MockPost({ author, text, vibes, delay = 0 }: { author: string; text: string; vibes: number; delay?: number }) {
  const [count, setCount] = useState(vibes);
  const [vibed, setVibed] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setCount(c => c + Math.floor(Math.random() * 2)), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 400, damping: 30 }}
      className="card-void p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center font-black text-sm text-emerald-400">{author[0]}</div>
        <div>
          <div className="font-bold text-[13px] text-white">@{author}</div>
          <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Sovereign Node</div>
        </div>
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
      </div>
      <p className="text-zinc-300 text-[13px] leading-relaxed mb-4">{text}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setVibed(v => !v); setCount(c => vibed ? c - 1 : c + 1); }}
          className="flex items-center gap-1.5 text-zinc-600 hover:text-emerald-400 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          <motion.span key={count} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className={`text-[11px] font-black font-mono ${vibed ? "text-emerald-400" : ""}`}>
            {count}
          </motion.span>
        </button>
        <MessageSquare className="w-3.5 h-3.5 text-zinc-700" />
        <span className="text-[11px] font-mono text-zinc-700">P2P · End-to-End</span>
        <div className="ml-auto px-2 py-0.5 rounded bg-white/[0.03] text-[8px] font-mono text-zinc-600 border border-white/[0.04] uppercase tracking-widest">Verified</div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);

  const features = [
    { icon: Radio, title: "Sovereign Mesh", body: "No signaling server. Pure WebRTC P2P, browser to browser. Your node, your rules.", accent: "#10B981", delay: 0 },
    { icon: Lock, title: "End-to-End Encrypted", body: "Every message sealed with your cryptographic keypair. Zero-knowledge by design.", accent: "#22D3EE", delay: 0.08 },
    { icon: Sparkles, title: "Sovereign AI", body: "Transformers.js runs inside your browser tab. AI that never phones home.", accent: "#A855F7", delay: 0.16 },
    { icon: Share2, title: "Drop Transfer", body: "Peer-to-peer file drops over the mesh. No cloud, no storage, no limits.", accent: "#F97316", delay: 0.24 },
    { icon: Globe, title: "Decentralized Feed", body: "Your signal propagates peer to peer. No algorithm. No server. Just signal.", accent: "#F43F5E", delay: 0.32 },
    { icon: Shield, title: "Trust Protocol", body: "Cryptographic vouch chains. Build reputation on the mesh, not a platform.", accent: "#F59E0B", delay: 0.40 },
  ];

  return (
    <div className="section-chalk overflow-hidden">

      {/* ── NAV ───────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl border-b border-black/[0.04]"
        style={{ background: "rgba(245,240,232,0.85)" }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#080808] flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-black text-[#080808] tracking-tight text-[17px]">NANDIX</span>
          <span className="hidden md:flex label-mono text-zinc-400 ml-1">Sovereign Mesh</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {["Manifesto", "Signal Feed", "Trust"].map((item) => (
            <a key={item} href={`/${item.toLowerCase().replace(" ", "")}`}
              className="label-mono text-zinc-500 hover:text-[#080808] transition-colors">{item}</a>
          ))}
        </div>
        <Link href="/nandix">
          <button className="btn-verdant px-5 py-2.5 text-xs rounded-xl">
            Enter Mesh <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </nav>

      {/* ══ HERO — SPLIT SCREEN ══════════════════════════════ */}
      <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">

        {/* LEFT — Light / Chalk Zone */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }}
          className="relative flex flex-col justify-center px-8 md:px-16 pt-32 pb-20 lg:pb-32 split-light overflow-hidden z-10">
          {/* Subtle dot grid */}
          <div className="absolute inset-0 mesh-bg opacity-60 pointer-events-none" />

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-8 self-start px-4 py-2 rounded-full border border-black/10 bg-white/60 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="label-mono text-zinc-600">Zero Servers · Open Mesh · Sovereign</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="display-1 text-[#080808] mb-6">
            No algorithm.<br />
            <span style={{ WebkitTextStroke: "2px #080808", color: "transparent" }}>No server.</span><br />
            Just signal.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="text-zinc-500 text-[17px] leading-relaxed max-w-md mb-10 font-medium">
            NANDIX is a peer-to-peer social mesh. Your identity is a cryptographic keypair.
            Your data lives in your browser. Your AI runs locally. No one else's rules.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-4">
            <Link href="/nandix">
              <button className="btn-primary">
                Enter the Mesh <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/manifesto">
              <button className="btn-ghost">
                Read Manifesto
              </button>
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex items-center gap-8 mt-14 pt-8 border-t border-black/[0.06]">
            {[
              { val: "0", label: "Servers" },
              { val: "∞", label: "Sovereignty" },
              { val: "E2E", label: "Encrypted" },
              { val: "P2P", label: "Direct" },
            ].map(s => (
              <div key={s.label} className="flex flex-col">
                <span className="font-black text-[20px] text-[#080808] font-mono">{s.val}</span>
                <span className="label-mono text-zinc-400">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — Dark / Void Zone */}
        <div className="relative split-dark flex flex-col items-center justify-center px-8 py-20 lg:py-0 min-h-[50vh] lg:min-h-screen overflow-hidden">
          <MeshCanvas />
          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] bg-violet-500/8 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-10">
            <SignalBeacon />

            {/* Live peer count mock */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 25 }}
              className="flex flex-col items-center"
            >
              <div className="text-[64px] font-black font-mono text-white leading-none">
                <AnimatedCounter from={0} to={2847} />
              </div>
              <div className="label-mono text-zinc-600 mt-2">Sovereign Nodes Online</div>
            </motion.div>

            {/* Tech stack badges */}
            <div className="flex flex-wrap gap-2 justify-center max-w-xs">
              {["WebRTC P2P", "IndexedDB", "Transformers.js", "Framer Motion", "WebCrypto API", "PeerJS Mesh"].map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className="px-3 py-1.5 rounded-full text-[9px] font-black font-mono uppercase tracking-widest border"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)", color: "#71717a" }}
                >
                  {t}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE STRIP ════════════════════════════════════ */}
      <div className="section-void py-4 overflow-hidden border-y border-white/[0.04]">
        <div className="marquee-track whitespace-nowrap">
          {Array(3).fill(["SOVEREIGN MESH", "ZERO SERVERS", "P2P ENCRYPTED", "BROWSER AI", "DECENTRALIZED FEED", "TRUST PROTOCOL", "OPEN MESH"]).flat().map((t, i) => (
            <span key={i} className="label-mono text-zinc-700 flex-shrink-0">{t} <span className="mx-6 text-emerald-500/40">◆</span></span>
          ))}
        </div>
      </div>

      {/* ══ FEATURES BENTO GRID ══════════════════════════════ */}
      <section className="section-void py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-16 max-w-2xl">
            <div className="label-mono text-emerald-400 mb-4">The Architecture</div>
            <h2 className="heading-1 text-white mb-4">Built different.<br />By design.</h2>
            <p className="text-zinc-500 text-[15px] leading-relaxed">
              Every feature is there because server-based alternatives don't respect your sovereignty.
            </p>
          </motion.div>
          <div className="bento-grid">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════ */}
      <section className="section-chalk py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg opacity-40 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20">
            <div className="label-mono text-zinc-400 mb-4">The Protocol</div>
            <h2 className="heading-1 text-[#080808] mb-4">Three steps to sovereignty.</h2>
          </motion.div>

          {/* Connector line */}
          <div className="hidden md:flex items-center justify-center mb-8 -mt-4">
            <div className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <HowStep step="01" icon={Fingerprint} accent="#10B981"
              title="Generate Identity"
              body="Your keypair is generated in-browser using WebCrypto. Never stored anywhere else. You are your keys."
              delay={0} />
            <HowStep step="02" icon={Radio} accent="#22D3EE"
              title="Connect to Mesh"
              body="PeerJS connects you directly to other sovereign nodes. No relay server handles your data."
              delay={0.12} />
            <HowStep step="03" icon={Zap} accent="#A855F7"
              title="Broadcast Signal"
              body="Post, vibe, reply, drop files — everything propagates peer-to-peer. Pure signal."
              delay={0.24} />
          </div>
        </div>
      </section>

      {/* ══ LIVE FEED PREVIEW ════════════════════════════════ */}
      <section className="section-void py-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <div className="label-mono text-emerald-400 mb-4">The Signal Feed</div>
            <h2 className="heading-1 text-white mb-6">
              Social media<br />
              <span className="text-zinc-500">without the middleman.</span>
            </h2>
            <p className="text-zinc-500 text-[15px] leading-relaxed mb-8">
              Posts propagate through your connected peers. The feed you see is owned by your browser, not a datacenter.
              Vibe a post — your react broadcasts to the mesh instantly.
            </p>
            <Link href="/nandix">
              <button className="btn-verdant">
                Open Signal Feed <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>

          <div className="flex flex-col gap-4">
            <MockPost author="sovereign_node" text="The network is the computer. The mesh is the platform. We are the nodes. 🔮" vibes={142} delay={0} />
            <MockPost author="cryptid_signal" text="Just dropped 400MB to a peer in 8 seconds. No cloud. No upload. Just WebRTC." vibes={89} delay={0.1} />
            <MockPost author="mesh_phantom" text="Vouch system is live. Trust is earned on-chain, visible on the radar. This is it." vibes={231} delay={0.2} />
          </div>
        </div>
      </section>

      {/* ══ MANIFESTO PULL QUOTE ═════════════════════════════ */}
      <section className="section-chalk py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <div className="label-mono text-zinc-400 mb-8">The Philosophy</div>
            <blockquote className="display-2 text-[#080808] leading-tight mb-8">
              "Sovereignty is not a feature.<br />
              <span style={{ WebkitTextStroke: "1.5px #080808", color: "transparent" }}>
                It is the architecture."
              </span>
            </blockquote>
            <cite className="label-mono text-zinc-400 not-italic">— The NANDIX Manifesto</cite>
            <div className="mt-10">
              <Link href="/manifesto">
                <button className="btn-primary">
                  Read Full Manifesto <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════ */}
      <section className="section-void py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="heading-1 text-white mb-6">You are the node.<br />The mesh awaits.</h2>
            <p className="text-zinc-500 mb-10 text-[15px]">
              No account. No verification. Generate your keys and enter the mesh instantly.
            </p>
            <Link href="/nandix">
              <button className="btn-verdant text-base px-10 py-5 rounded-2xl">
                Enter NANDIX <Zap className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <footer className="section-void py-10 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-black text-white">NANDIX</span>
            <span className="label-mono text-zinc-700">Sovereign Mesh · 2026</span>
          </div>
          <div className="flex items-center gap-6">
            {["Manifesto", "Feed", "Radar", "Trust"].map(l => (
              <a key={l} href={`/${l.toLowerCase()}`} className="label-mono text-zinc-600 hover:text-zinc-300 transition-colors">{l}</a>
            ))}
          </div>
          <div className="label-mono text-zinc-700">No cookies. No tracking. Zero servers.</div>
        </div>
      </footer>
    </div>
  );
}

/* Animated number counter */
function AnimatedCounter({ from, to }: { from: number; to: number }) {
  const [val, setVal] = useState(from);
  useEffect(() => {
    const start = Date.now();
    const dur = 2000;
    const frame = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (to - from) * ease));
      if (p < 1) requestAnimationFrame(frame);
    };
    const timeout = setTimeout(() => requestAnimationFrame(frame), 600);
    return () => clearTimeout(timeout);
  }, [from, to]);
  return <>{val.toLocaleString()}</>;
}
