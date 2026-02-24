"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield, Lock, Cpu, Globe, ArrowRight, Fingerprint,
  Wifi, Volume2, FileUp, Smartphone, Brain, Eye,
  Check, X, MessageCircle, Zap, Activity, Terminal,
  GitBranch, Share2, Layers, Sparkles, Radio, Server,
  Users, ChevronRight
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   🏛️ NANDIX — SUPREME LANDING PAGE V2
   Particle Hero · Visual Density · Filled Sections
   ──────────────────────────────────────────────────────────── */

/* ─── ANIMATION VARIANTS ─────────────────────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true },
};

const staggerChild = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

/* ─── PARTICLE CANVAS COMPONENT ──────────────────────────── */
function ParticleHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; opacity: number }[] = [];
    const colors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const init = () => {
      resize();
      const count = Math.min(80, Math.floor(canvas.offsetWidth / 15));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -Math.random() * 0.6 - 0.2,
          size: Math.random() * 3 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.5 + 0.15,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.offsetHeight + 10; p.x = Math.random() * canvas.offsetWidth; }
        if (p.x < -10) p.x = canvas.offsetWidth + 10;
        if (p.x > canvas.offsetWidth + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

/* ─── FEATURES DATA ──────────────────────────────────────── */
const features = [
  {
    icon: <Fingerprint className="w-7 h-7" />,
    title: "Sovereign Identity",
    desc: "Your keys generate your identity. No email, no phone number, no central authority. BIP-39 mnemonic seeds give you total ownership.",
    gradient: "from-emerald-500 to-teal-600",
    span: "md:col-span-2",
    mockup: (
      <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-green-400 font-mono text-xs leading-relaxed">
        <div className="text-slate-500 mb-1">$ nandix identity --forge</div>
        <div className="text-emerald-400">✓ Generating 128-bit entropy...</div>
        <div className="text-emerald-400">✓ BIP-39 Mnemonic: <span className="text-white">abandon ability able about above absent ...</span></div>
        <div className="text-emerald-400">✓ Peer ID: <span className="text-cyan-400">nandix-8f2a3b7c9d1e-0000</span></div>
        <div className="text-emerald-400">✓ ED25519 keys generated</div>
        <div className="animate-pulse text-white mt-1">█</div>
      </div>
    ),
  },
  {
    icon: <Brain className="w-7 h-7" />,
    title: "Ghost AI",
    desc: "On-device intelligence. Summarize conversations, search your data, automate tasks — all without sending a single byte to any cloud.",
    gradient: "from-violet-500 to-purple-600",
    span: "",
    mockup: (
      <div className="mt-4 space-y-2">
        <div className="flex gap-2 items-start">
          <div className="w-6 h-6 rounded-full bg-violet-500 shrink-0 flex items-center justify-center"><Sparkles className="w-3 h-3 text-white" /></div>
          <div className="p-3 rounded-2xl bg-violet-50 text-xs text-violet-800 leading-relaxed">Summarizing last 24hrs of messages...</div>
        </div>
        <div className="flex gap-2 items-start justify-end">
          <div className="p-3 rounded-2xl bg-slate-100 text-xs text-slate-700 leading-relaxed">3 key topics: Project deadline, meeting notes, code review</div>
        </div>
      </div>
    ),
  },
  {
    icon: <Lock className="w-7 h-7" />,
    title: "E2E Encryption",
    desc: "AES-256-GCM on every message, file, and call. The encryption happens before data leaves your device.",
    gradient: "from-rose-500 to-red-600",
    span: "",
    mockup: (
      <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Encrypted Channel</span>
        </div>
        <div className="font-mono text-[10px] text-zinc-500 break-all">
          U2FsdGVkX1+vupppZk...xNzQwMjE=
        </div>
      </div>
    ),
  },
  {
    icon: <Wifi className="w-7 h-7" />,
    title: "P2P Mesh Network",
    desc: "WebRTC direct connections. Every message hops device-to-device — no server in the middle, ever.",
    gradient: "from-blue-500 to-indigo-600",
    span: "",
    mockup: null,
  },
  {
    icon: <Smartphone className="w-7 h-7" />,
    title: "The Sceptre",
    desc: "Remote control your desktop from your phone. Execute Ghost AI commands, manage file transfers, check kernel status.",
    gradient: "from-amber-500 to-orange-600",
    span: "",
    mockup: null,
  },
  {
    icon: <Volume2 className="w-7 h-7" />,
    title: "Spatial Audio & Transfers",
    desc: "HRTF 3D positional audio on group calls. 1GB+ file transfers with real-time pause, resume, and OPFS storage.",
    gradient: "from-cyan-500 to-blue-600",
    span: "md:col-span-2",
    mockup: (
      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1 space-y-2">
          {["Alice", "Bob", "Charlie"].map((name, i) => (
            <div key={name} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${i === 0 ? "bg-cyan-500" : i === 1 ? "bg-blue-500" : "bg-indigo-500"}`}>{name[0]}</div>
              <div className="flex-1">
                <div className="text-xs font-bold text-zinc-300">{name}</div>
                <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className={`h-full bg-cyan-400 rounded-full`} style={{ width: `${60 + i * 15}%` }} />
                </div>
              </div>
              <Volume2 className="w-3 h-3 text-zinc-600" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

/* ─── COMPARISON DATA ────────────────────────────────────── */
const comparison = [
  { feature: "End-to-End Encryption", nandix: true, whatsapp: true, signal: true },
  { feature: "No Central Server", nandix: true, whatsapp: false, signal: false },
  { feature: "No Phone # Required", nandix: true, whatsapp: false, signal: false },
  { feature: "Local AI Processing", nandix: true, whatsapp: false, signal: false },
  { feature: "Fully Open Source", nandix: true, whatsapp: false, signal: true },
  { feature: "File Pause/Resume", nandix: true, whatsapp: false, signal: false },
  { feature: "Spatial Audio Calls", nandix: true, whatsapp: false, signal: false },
  { feature: "P2P Mesh Architecture", nandix: true, whatsapp: false, signal: false },
];

/* ─── TECH ICONS ROW ─────────────────────────────────────── */
const techIcons = [
  { icon: <Shield className="w-5 h-5" />, label: "Identity" },
  { icon: <Lock className="w-5 h-5" />, label: "Encryption" },
  { icon: <Wifi className="w-5 h-5" />, label: "WebRTC" },
  { icon: <Brain className="w-5 h-5" />, label: "Ghost AI" },
  { icon: <Terminal className="w-5 h-5" />, label: "Binary" },
  { icon: <GitBranch className="w-5 h-5" />, label: "Mesh" },
  { icon: <Share2 className="w-5 h-5" />, label: "P2P" },
  { icon: <Layers className="w-5 h-5" />, label: "OPFS" },
  { icon: <Radio className="w-5 h-5" />, label: "Spatial" },
  { icon: <Sparkles className="w-5 h-5" />, label: "RAG" },
  { icon: <Cpu className="w-5 h-5" />, label: "Kernel" },
  { icon: <Server className="w-5 h-5" />, label: "Relay" },
];

/* ─── STEPS DATA ─────────────────────────────────────────── */
const steps = [
  {
    num: "01",
    icon: <Fingerprint className="w-8 h-8" />,
    title: "Create Identity",
    desc: "Generate a 12-word mnemonic seed. No email. No phone. Pure sovereignty.",
    color: "bg-emerald-500",
  },
  {
    num: "02",
    icon: <Globe className="w-8 h-8" />,
    title: "Join the Mesh",
    desc: "Your device becomes a node. Connect directly to peers anywhere on Earth.",
    color: "bg-blue-500",
  },
  {
    num: "03",
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Communicate Freely",
    desc: "Chat, call, share files — all encrypted end-to-end, all peer-to-peer.",
    color: "bg-violet-500",
  },
];

/* ─── USE CASE CARDS ─────────────────────────────────────── */
const useCases = [
  {
    title: "Privacy Advocates",
    desc: "For people who believe their conversations should stay theirs. No metadata collection, no logging, no compromise.",
    icon: <Eye className="w-6 h-6" />,
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    title: "Remote Teams",
    desc: "Encrypted group channels, spatial audio calls, and 1GB+ file sharing. All the tools without the surveillance.",
    icon: <Users className="w-6 h-6" />,
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    title: "Journalists & Activists",
    desc: "When communication security isn't optional. Sovereign identity means no government can demand your data from us.",
    icon: <Shield className="w-6 h-6" />,
    gradient: "from-violet-400 to-purple-500",
  },
  {
    title: "Developers",
    desc: "Open source, extensible agents, binary protocol at 60fps. Build on top of the mesh with our agent SDK.",
    icon: <Terminal className="w-6 h-6" />,
    gradient: "from-amber-400 to-orange-500",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-300 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden relative">
      {/* 🏛️ VOID AMBIENCE — Visual Density Injection */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Physical Noise Layer */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* Dot Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* AMBIENT ORBS */}
        <motion.div
          animate={{ x: [0, 40, -30, 0], y: [0, -60, 40, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, -50, 40, 0], y: [0, 30, -50, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[15%] right-[5%] w-[450px] h-[450px] rounded-full bg-violet-500/[0.04] blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[50%] right-[25%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.03] blur-[110px]"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 1: NAVBAR
          ═══════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-20 backdrop-blur-xl border-b border-white/[0.03]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-[0.2em] text-white">NANDIX</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <a href="#about" className="hover:text-emerald-400 transition-colors">About</a>
          <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
          <a href="#security" className="hover:text-emerald-400 transition-colors">Security</a>
          <a href="#use-cases" className="hover:text-[#0F0F1A] transition-colors">Use Cases</a>
          <Link href="/manifesto" className="hover:text-[#0F0F1A] transition-colors">Manifesto</Link>
        </div>

        <Link
          href="/signup"
          className="btn-primary !px-5 !py-2.5 text-sm font-semibold rounded-full flex items-center gap-2"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
    </div>
      </nav >

  {/* ═══════════════════════════════════════════════════════
          SECTION 2: HERO (Particle Background)
          ═══════════════════════════════════════════════════════ */}
    < section className = "relative min-h-screen flex items-center justify-center px-6 lg:px-12 overflow-hidden" >
      <ParticleHero />

  {/* Gradient overlays for depth */ }
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFBFE] via-transparent to-[#FAFBFE] pointer-events-none z-[1]" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-100/30 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo */}
          <motion.div {...fadeUp} className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#0F0F1A] flex items-center justify-center shadow-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <span className="font-black text-3xl tracking-tight">NANDIX</span>
          </motion.div>

          {/* Badge */}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-slate-600">Kernel v2.5 Stable · Trident Turbo Active</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-[80px] font-black tracking-tight leading-[0.95] mb-8"
          >
            Communication{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 bg-clip-text text-transparent">Without</span>{" "}
            Compromise.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.3 }}
            className="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto mb-12"
          >
            The world&apos;s first sovereign peer-to-peer mesh OS.
            No servers. No tracking. No compromise. Just pure, encrypted freedom — powered by local AI.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup" className="btn-primary !px-10 !py-5 text-base font-bold rounded-2xl flex items-center gap-3 shadow-xl shadow-slate-900/10">
              <Sparkles className="w-5 h-5" /> Forge Your Identity
            </Link>
            <Link href="/manifesto" className="btn-ghost flex items-center gap-2 text-base font-semibold !px-8 !py-4 border border-slate-200 rounded-2xl bg-white/60 backdrop-blur-sm">
              Read the Manifesto <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 3: PRODUCT DEMO (Dark Container)
          ═══════════════════════════════════════════════════════ */}
    < section className = "px-6 lg:px-12 -mt-20 relative z-20" >
      <motion.div {...fadeUp} className="max-w-6xl mx-auto">
        <div className="rounded-[32px] bg-[#0F0F1A] p-2 shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-800/50">
          <div className="rounded-[28px] bg-gradient-to-br from-slate-900 to-slate-950 p-6 lg:p-8 relative overflow-hidden">
            {/* Faint grid pattern */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40V0h1v40zm40 0V0h1' stroke='%23fff' stroke-width='0.5'/%3E%3Cpath d='M0 0h40v1H0zm0 40h40v1' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />

            {/* Mock IDE / Dashboard */}
            <div className="flex gap-4 relative z-10">
              {/* Left Panel */}
              <div className="hidden lg:block w-48 shrink-0">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Channels</div>
                {["# general", "# engineering", "# random", "# direct-msg"].map((ch, i) => (
                  <div key={ch} className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-xs font-medium ${i === 0 ? "bg-white/5 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                    <span>{ch}</span>
                    {i === 0 && <div className="ml-auto w-4 h-4 rounded-full bg-emerald-500 text-[8px] text-white flex items-center justify-center font-bold">3</div>}
                  </div>
                ))}
                <div className="mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Peers Online</div>
                {[{ name: "Alice", color: "bg-emerald-500" }, { name: "Bob", color: "bg-blue-500" }, { name: "Charlie", color: "bg-violet-500" }].map((p) => (
                  <div key={p.name} className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400">
                    <div className={`w-2 h-2 rounded-full ${p.color}`} />
                    {p.name}
                  </div>
                ))}
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 min-h-[300px] lg:min-h-[400px] flex flex-col">
                <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-4">
                  <span className="text-sm font-bold text-white"># general</span>
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] text-emerald-500 font-medium">E2E Encrypted</span>
                </div>
                <div className="flex-1 space-y-4">
                  {[
                    { user: "Alice", color: "bg-emerald-500", msg: "The mesh is growing! Just connected 3 new nodes from Berlin 🇩🇪", time: "2:14 PM" },
                    { user: "Bob", color: "bg-blue-500", msg: "Ghost AI just summarized 200 messages in 0.3s — all local inference 🧠", time: "2:15 PM" },
                    { user: "Charlie", color: "bg-violet-500", msg: "File transfer hitting 12MB/s over direct WebRTC. Zero relay needed.", time: "2:16 PM" },
                  ].map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      viewport={{ once: true }}
                      className="flex gap-3"
                    >
                      <div className={`w-8 h-8 rounded-full ${m.color} shrink-0 flex items-center justify-center text-white text-xs font-bold`}>{m.user[0]}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{m.user}</span>
                          <span className="text-[10px] text-slate-600">{m.time}</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">{m.msg}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                  <input type="text" placeholder="Type into the sovereign mesh..." className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none" readOnly />
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500"><Sparkles className="w-4 h-4" /></div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white"><ArrowRight className="w-4 h-4" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 4: TECH ICONS ROW
          ═══════════════════════════════════════════════════════ */}
    < section className = "py-16 px-6 lg:px-12 max-w-6xl mx-auto relative z-10" >
      <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-4">
        {techIcons.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.1, y: -2 }}
            className="flex flex-col items-center gap-1.5 w-16"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-zinc-500 shadow-sm hover:shadow-lg hover:text-white hover:border-white/[0.1] transition-all cursor-default backdrop-blur-3xl">
              {item.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{item.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 5: MISSION STATEMENT
          ═══════════════════════════════════════════════════════ */}
    < section className = "py-24 px-6 lg:px-12 relative overflow-hidden z-10" >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center relative z-10">
        <p className="text-3xl lg:text-[52px] font-black tracking-tight leading-[1.1] text-white">
          <span className="text-emerald-500">Nandix</span> is the sovereign mesh —
          evolving communication into the <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">post-server era</span>.
          <span className="inline-block w-[4px] h-[40px] bg-emerald-500 ml-3 animate-pulse align-middle" />
        </p>
      </motion.div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
    </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 6: ABOUT US
          ═══════════════════════════════════════════════════════ */}
    < section id = "about" className = "py-24 lg:py-36 px-6 lg:px-12 max-w-7xl mx-auto relative z-10" >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div {...fadeUp}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-6">
            <Globe className="w-3 h-3" /> Genesis Protocol
          </span>
          <h2 className="text-4xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-8 text-white">
            We Are the Architects of{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
              Sovereign Tech.
            </span>
          </h2>
          <div className="space-y-5 text-lg text-zinc-500 leading-relaxed">
            <p>
              Nandix was born from a single belief: <strong className="text-white">communication is a human right, not a SaaS subscription.</strong>
            </p>
            <p>
              Founded in 2024, we set out to build what Big Tech refuses to: a communication platform with zero central servers, zero data collection, and zero compromise.
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div {...stagger} className="grid grid-cols-2 gap-4">
          {[
            { value: "0", label: "Central Servers", icon: <Server className="w-5 h-5" />, color: "text-emerald-500" },
            { value: "256", label: "Bit AES Encryption", icon: <Lock className="w-5 h-5" />, color: "text-blue-500" },
            { value: "60fps", label: "Binary Protocol", icon: <Zap className="w-5 h-5" />, color: "text-amber-500" },
            { value: "∞", label: "Maximum Nodes", icon: <Globe className="w-5 h-5" />, color: "text-violet-500" },
          ].map((stat, i) => (
            <motion.div key={i} {...staggerChild} className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.04] text-center hover:border-white/[0.08] transition-all group backdrop-blur-3xl">
              <div className={`w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center mx-auto mb-4 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className={`text-4xl font-black tracking-tight mb-1 text-white tabular-nums`}>{stat.value}</div>
              <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 7: MARQUEE
          ═══════════════════════════════════════════════════════ */}
    < section className = "py-8 bg-white/[0.02] border-y border-white/[0.04] overflow-hidden relative z-10" >
      <div className="marquee-track whitespace-nowrap">
        {[...Array(2)].map((_, setIdx) => (
          <React.Fragment key={setIdx}>
            {["100% Open Source", "Zero Central Servers", "End-to-End Encrypted", "P2P Mesh Architecture", "Sovereign Identity", "Local AI Processing", "No Phone Number Required", "256-bit AES-GCM", "Binary Protocol", "60fps Tick Rate"].map((item, i) => (
              <span key={`${setIdx}-${i}`} className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] mx-12 inline-flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                {item}
              </span>
            ))}
          </React.Fragment>
        ))}
      </div>
      </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 8: FEATURE BENTO GRID (with mockups)
          ═══════════════════════════════════════════════════════ */}
    < section id = "features" className = "py-24 lg:py-36 px-6 lg:px-12 max-w-7xl mx-auto relative z-10" >
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-4xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-white">
            Built for the{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              Sovereign User.
            </span>
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            Every feature exists to put power back in your hands. No compromises. No fine print.
          </p>
        </motion.div>

        <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              {...staggerChild}
              className={`p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.04] backdrop-blur-3xl group cursor-default overflow-hidden relative ${feat.span} hover:border-white/[0.08] transition-all`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-white mb-8 shadow-xl relative z-10`}>
                {feat.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-white relative z-10">{feat.title}</h3>
              <p className="text-zinc-500 leading-relaxed text-sm relative z-10">{feat.desc}</p>
              <div className="relative z-10 mt-2">
                {feat.mockup}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 9: SECURITY (Dark Inversion)
          ═══════════════════════════════════════════════════════ */}
    < section id = "security" className = "section-dark py-24 lg:py-36 px-6 lg:px-12 relative overflow-hidden" >
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
  {/* Grid pattern */ }
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Ccircle cx='30' cy='30' r='1' fill='%23fff'/%3E%3C/svg%3E\")" }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div {...fadeUp} className="text-center mb-20">
            <h2 className="text-4xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              Your Data Never Touches<br />
              Our Servers.{" "}
              <span className="text-slate-600">Because We Don&apos;t Have Any.</span>
            </h2>
          </motion.div>

          <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { value: "0 B", label: "of user data stored on our servers", icon: <Eye className="w-6 h-6" /> },
              { value: "256-bit", label: "AES-GCM end-to-end encryption", icon: <Lock className="w-6 h-6" /> },
              { value: "BIP-39", label: "deterministic key derivation", icon: <Fingerprint className="w-6 h-6" /> },
            ].map((stat, i) => (
              <motion.div key={i} {...staggerChild} className="text-center p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-emerald-400">
                  {stat.icon}
                </div>
                <div className="text-4xl font-black text-white tracking-tight mb-3">{stat.value}</div>
                <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 10: HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
    < section className = "py-24 lg:py-36 px-6 lg:px-12 max-w-7xl mx-auto" >
        <motion.div {...fadeUp} className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6">
            Three Steps to Sovereignty.
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Getting started takes less than 60 seconds.
          </p>
        </motion.div>

        <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-20 left-[16%] right-[16%] h-px bg-slate-200 z-0" />
          {steps.map((step, i) => (
            <motion.div key={i} {...staggerChild} className="text-center relative z-10">
              <div className={`w-16 h-16 rounded-full ${step.color} text-white font-black text-xl flex items-center justify-center mx-auto mb-8 shadow-lg`}>
                {step.num}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-500">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed max-w-xs mx-auto text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 11: USE CASES
          ═══════════════════════════════════════════════════════ */}
    < section id = "use-cases" className = "py-24 lg:py-36 px-6 lg:px-12 bg-black/20 border-y border-white/[0.03] relative z-10" >
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-4xl lg:text-7xl font-black tracking-tight mb-6 text-white text-center">
            Built For Everyone Who Values <span className="text-emerald-500 animate-pulse">Freedom.</span>
          </h2>
        </motion.div>

        <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((uc, i) => (
            <motion.div key={i} {...staggerChild} className="group">
              <div className={`h-48 rounded-t-[2.5rem] bg-gradient-to-br ${uc.gradient} flex items-center justify-center relative overflow-hidden transition-all group-hover:scale-[1.02]`}>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                <div className="relative text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{React.cloneElement(uc.icon, { className: "w-16 h-16" })}</div>
              </div>
              <div className="p-8 border border-t-0 border-white/[0.04] rounded-b-[2.5rem] bg-white/[0.01] backdrop-blur-3xl group-hover:bg-white/[0.03] transition-all group-hover:border-white/[0.08]">
                <h3 className="font-black text-xl mb-3 text-white">{uc.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-6 h-20">{uc.desc}</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">
                  Protocol Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 12: COMPARISON TABLE
          ═══════════════════════════════════════════════════════ */}
    < section className = "py-24 lg:py-36 px-6 lg:px-12 max-w-5xl mx-auto relative z-10" >
      <motion.div {...fadeUp} className="text-center mb-20">
        <h2 className="text-4xl lg:text-7xl font-black tracking-tight mb-6 text-white">Why Nandix?</h2>
        <p className="text-lg text-zinc-500">See how we compare to the platforms of the old era.</p>
      </motion.div>

      <motion.div {...fadeUp} className="overflow-hidden rounded-[2.5rem] border border-white/[0.04] bg-white/[0.01] backdrop-blur-3xl shadow-2xl">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/[0.03] border-b border-white/[0.04]">
              <th className="text-left py-6 px-8 font-black uppercase tracking-widest text-zinc-600">Sovereign Feature</th>
              <th className="py-6 px-8 font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/5">Nandix</th>
              <th className="py-6 px-8 font-black uppercase tracking-widest text-zinc-600">WhatsApp</th>
              <th className="py-6 px-8 font-black uppercase tracking-widest text-zinc-600">Signal</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row, i) => (
              <tr key={i} className={`border-b border-white/[0.02] ${i % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"} hover:bg-white/[0.03] transition-colors`}>
                <td className="py-5 px-8 font-bold text-zinc-300">{row.feature}</td>
                <td className="py-5 px-8 text-center bg-emerald-500/5">
                  {row.nandix ? <Check className="w-5 h-5 text-emerald-400 mx-auto drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" /> : <X className="w-5 h-5 text-zinc-800 mx-auto" />}
                </td>
                <td className="py-5 px-8 text-center">
                  {row.whatsapp ? <Check className="w-5 h-5 text-emerald-400/60 mx-auto" /> : <X className="w-5 h-5 text-zinc-800 mx-auto" />}
                </td>
                <td className="py-5 px-8 text-center">
                  {row.signal ? <Check className="w-5 h-5 text-emerald-400/60 mx-auto" /> : <X className="w-5 h-5 text-zinc-800 mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 13: MANIFESTO PULLQUOTE
          ═══════════════════════════════════════════════════════ */}
    < section className = "py-32 lg:py-48 px-6 lg:px-12 bg-black/40 border-y border-white/[0.03] relative z-10 overflow-hidden" >
      <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center relative z-10">
        <span className="text-[200px] font-black text-white/[0.02] absolute -top-32 left-1/2 -translate-x-1/2 select-none pointer-events-none leading-none">&ldquo;</span>
        <p className="text-2xl lg:text-5xl font-black text-white italic leading-[1.2] relative z-10 drop-shadow-lg">
          We believe communication is a human right,<br />
          not a <span className="text-emerald-500 animate-pulse">SaaS subscription.</span>
        </p>
        <div className="mt-12 text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">
          — The Nandix Manifesto
        </div>
      </motion.div>
    </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 14: THE VISION
          ═══════════════════════════════════════════════════════ */}
    < section className = "py-24 lg:py-48 px-6 lg:px-12 relative z-10" >
      <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl lg:text-8xl font-black tracking-tight leading-[1.0] mb-12 text-white">
          We&apos;re Not Building an App.{" "}
          <span className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
            We&apos;re Building a Protocol.
          </span>
        </h2>
        <div className="space-y-8 text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto">
          <p>
            In a world where every message is surveilled and every identity is owned by a corporation — we chose to build the opposite.
          </p>
          <p className="text-white font-black text-2xl tracking-tight">
            Nandix is the mesh. You are the node. Together, we are sovereign.
          </p>
        </div>
      </motion.div>
    </section >

  {/* ═══════════════════════════════════════════════════════
          SECTION 15: FINAL CTA (Dark)
          ═══════════════════════════════════════════════════════ */}
    < section className = "mx-6 lg:mx-12 mb-32 relative z-10" >
      <div className="rounded-[3rem] bg-zinc-950 border border-white/[0.05] py-24 lg:py-36 px-8 text-center relative overflow-hidden shadow-2xl">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23fff'/%3E%3C/svg%3E\")" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div {...fadeUp} className="relative z-10">
          <h2 className="text-5xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] mb-12">
            YOUR PRIVACY.<br />
            YOUR MESH.<br />
            YOUR REVOLUTION.
          </h2>
          <p className="text-lg text-zinc-500 mb-16 max-w-xl mx-auto font-medium">
            Join the sovereign movement. 100% open source. 0% compromise.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup" className="px-14 py-6 bg-white text-black rounded-2xl text-xl font-black hover:scale-[1.02] transition-all flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              <Sparkles className="w-6 h-6" /> START FORGING
            </Link>
            <Link href="/manifesto" className="px-12 py-6 border border-white/10 text-white rounded-2xl text-xl font-black hover:bg-white/5 transition-all flex items-center gap-3">
              MANIFESTO <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section >

  {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
    < footer className = "py-24 px-6 lg:px-12 border-t border-white/[0.03] bg-black/40 relative z-10" >
      <div className="max-w-7xl mx-auto">
        {/* Big Typography */}
        <div className="mb-24 overflow-hidden">
          <div className="text-[100px] lg:text-[220px] font-black tracking-tighter text-white/[0.01] leading-none select-none text-center">
            NANDIX
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between gap-16">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-widest text-white uppercase">NANDIX</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
              The first truly sovereign communication protocol. No servers. No masters. Just code.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-20 gap-y-10 text-sm">
            {[
              { label: "Protocol", items: ["Features", "Security", "Whitepaper", "Mesh Map"] },
              { label: "Forge", items: ["GitHub", "Agent SDK", "Kernel Docs", "Bounties"] },
              { label: "Community", items: ["Manifesto", "Blog", "Nose-to-Tail Privacy", "Operational Status"] },
            ].map((col) => (
              <div key={col.label}>
                <div className="font-black text-white uppercase tracking-widest text-[10px] mb-6">{col.label}</div>
                <div className="space-y-3">
                  {col.items.map((item) => (
                    <Link key={item} href="#" className="block text-zinc-600 hover:text-emerald-400 transition-colors text-[13px] font-medium">
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-24 pt-10 border-t border-white/[0.03]">
          <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">© 2024 NANDIX PROTOCOL — POST-SERVER ERA</span>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Mesh Network Operational</span>
          </div>
        </div>
      </div>
    </footer > 鼓
    </div >
  );
}
