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
      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Encrypted Channel</span>
        </div>
        <div className="font-mono text-[10px] text-slate-400 break-all">
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
            <div key={name} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${i === 0 ? "bg-cyan-500" : i === 1 ? "bg-blue-500" : "bg-indigo-500"}`}>{name[0]}</div>
              <div className="flex-1">
                <div className="text-xs font-bold">{name}</div>
                <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full bg-cyan-400 rounded-full`} style={{ width: `${60 + i * 15}%` }} />
                </div>
              </div>
              <Volume2 className="w-3 h-3 text-slate-400" />
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
    <div className="min-h-screen bg-[#FAFBFE] text-[#0F0F1A] overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════
          SECTION 1: NAVBAR
          ═══════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F0F1A] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">NANDIX</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-medium">
            <a href="#about" className="hover:text-[#0F0F1A] transition-colors">About</a>
            <a href="#features" className="hover:text-[#0F0F1A] transition-colors">Features</a>
            <a href="#security" className="hover:text-[#0F0F1A] transition-colors">Security</a>
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
      </nav>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: HERO (Particle Background)
          ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-12 overflow-hidden">
        <ParticleHero />

        {/* Gradient overlays for depth */}
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
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: PRODUCT DEMO (Dark Container)
          ═══════════════════════════════════════════════════════ */}
      <section className="px-6 lg:px-12 -mt-20 relative z-20">
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
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4: TECH ICONS ROW
          ═══════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 lg:px-12 max-w-6xl mx-auto">
        <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-4">
          {techIcons.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex flex-col items-center gap-1.5 w-16"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 shadow-sm hover:shadow-md hover:text-[#0F0F1A] transition-all cursor-default">
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold text-slate-400">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5: MISSION STATEMENT
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 lg:px-12 bg-white border-y border-slate-100">
        <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center">
          <p className="text-3xl lg:text-[44px] font-bold tracking-tight leading-[1.2] text-[#0F0F1A]">
            <span className="font-extrabold">Nandix</span> is our sovereign development mesh —
            evolving communication into the <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">post-server era</span>.
            <span className="inline-block w-[3px] h-[36px] bg-emerald-500 ml-2 animate-pulse align-middle" />
          </p>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6: ABOUT US
          ═══════════════════════════════════════════════════════ */}
      <section id="about" className="py-24 lg:py-36 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-6">
              <Globe className="w-3.5 h-3.5" /> Who We Are
            </span>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-8">
              We Are the Architects of{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                Sovereign Technology.
              </span>
            </h2>
            <div className="space-y-5 text-lg text-slate-500 leading-relaxed">
              <p>
                Nandix was born from a single belief: <strong className="text-[#0F0F1A]">communication is a human right, not a SaaS subscription.</strong>
              </p>
              <p>
                Founded in 2024, we set out to build what Big Tech refuses to: a communication platform with zero central servers, zero data collection, and zero compromise.
              </p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div {...stagger} className="grid grid-cols-2 gap-4">
            {[
              { value: "0", label: "Central Servers", icon: <Server className="w-5 h-5" />, color: "text-emerald-600" },
              { value: "256", label: "Bit AES Encryption", icon: <Lock className="w-5 h-5" />, color: "text-blue-600" },
              { value: "60fps", label: "Binary Protocol", icon: <Zap className="w-5 h-5" />, color: "text-amber-600" },
              { value: "∞", label: "Maximum Nodes", icon: <Globe className="w-5 h-5" />, color: "text-violet-600" },
            ].map((stat, i) => (
              <motion.div key={i} {...staggerChild} className="card-elevated p-6 text-center">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className={`text-3xl font-black tracking-tight mb-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 7: MARQUEE
          ═══════════════════════════════════════════════════════ */}
      <section className="py-5 bg-slate-50/80 border-y border-slate-100 overflow-hidden">
        <div className="marquee-track whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <React.Fragment key={setIdx}>
              {["100% Open Source", "Zero Central Servers", "End-to-End Encrypted", "P2P Mesh Architecture", "Sovereign Identity", "Local AI Processing", "No Phone Number Required", "256-bit AES-GCM", "Binary Protocol", "60fps Tick Rate"].map((item, i) => (
                <span key={`${setIdx}-${i}`} className="text-sm text-slate-400 font-medium tracking-wide mx-8 inline-flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {item}
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 8: FEATURE BENTO GRID (with mockups)
          ═══════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 lg:py-36 px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6">
            Built for the{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              Sovereign Individual.
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Every feature exists to put power back in your hands. No compromises. No fine print.
          </p>
        </motion.div>

        <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              {...staggerChild}
              className={`card-elevated p-8 group cursor-default overflow-hidden ${feat.span}`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-white mb-6 shadow-lg`}>
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{feat.desc}</p>
              {feat.mockup}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 9: SECURITY (Dark Inversion)
          ═══════════════════════════════════════════════════════ */}
      <section id="security" className="section-dark py-24 lg:py-36 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        {/* Grid pattern */}
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
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 10: HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 px-6 lg:px-12 max-w-7xl mx-auto">
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
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 11: USE CASES
          ═══════════════════════════════════════════════════════ */}
      <section id="use-cases" className="py-24 lg:py-36 px-6 lg:px-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6">
              Built For Everyone Who Values Freedom.
            </h2>
          </motion.div>

          <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc, i) => (
              <motion.div key={i} {...staggerChild} className="group">
                <div className={`h-40 rounded-t-3xl bg-gradient-to-br ${uc.gradient} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative text-white">{React.cloneElement(uc.icon, { className: "w-12 h-12" })}</div>
                </div>
                <div className="p-6 border border-t-0 border-slate-200/60 rounded-b-3xl bg-white group-hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-lg mb-2">{uc.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{uc.desc}</p>
                  <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 12: COMPARISON TABLE
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 px-6 lg:px-12 max-w-5xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6">Why Nandix?</h2>
          <p className="text-lg text-slate-500">See how we compare to the platforms you already know.</p>
        </motion.div>

        <motion.div {...fadeUp} className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-4 px-6 font-semibold text-slate-500">Feature</th>
                <th className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/50">Nandix</th>
                <th className="py-4 px-6 font-semibold text-slate-500">WhatsApp</th>
                <th className="py-4 px-6 font-semibold text-slate-500">Signal</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                  <td className="py-4 px-6 font-medium text-slate-700">{row.feature}</td>
                  <td className="py-4 px-6 text-center bg-emerald-50/30">
                    {row.nandix ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {row.whatsapp ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {row.signal ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 13: MANIFESTO PULLQUOTE
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 px-6 lg:px-12 bg-slate-50/50 border-y border-slate-100 relative">
        <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center relative">
          <span className="text-[180px] font-black text-slate-100 absolute -top-20 left-1/2 -translate-x-1/2 select-none pointer-events-none leading-none">&ldquo;</span>
          <p className="text-2xl lg:text-4xl font-bold text-slate-600 italic leading-snug relative z-10">
            We believe communication is a human right,<br />
            not a SaaS subscription.
          </p>
          <div className="mt-8 text-sm text-slate-400 font-semibold uppercase tracking-wider">
            — The Nandix Manifesto
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 14: THE VISION
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 px-6 lg:px-12">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-10">
            We&apos;re Not Building an App.{" "}
            <span className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              We&apos;re Building a Protocol for Human Freedom.
            </span>
          </h2>
          <div className="space-y-6 text-lg text-slate-500 leading-relaxed">
            <p>
              In a world where every message is surveilled, every file is scanned, and every identity is owned by a corporation — we chose to build differently.
            </p>
            <p className="text-[#0F0F1A] font-semibold text-xl">
              Nandix is the protocol. You are the network. Together, we are unstoppable.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 15: FINAL CTA (Dark)
          ═══════════════════════════════════════════════════════ */}
      <section className="mx-6 lg:mx-12 mb-24">
        <div className="rounded-[32px] bg-[#0F0F1A] py-20 lg:py-28 px-8 text-center relative overflow-hidden">
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23fff'/%3E%3C/svg%3E\")" }} />
          <div className="absolute top-10 right-20 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-10 left-20 w-[250px] h-[250px] bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

          <motion.div {...fadeUp} className="relative z-10">
            <h2 className="text-4xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] mb-8">
              Your Data.<br />
              Your Mesh.<br />
              Your Rules.
            </h2>
            <p className="text-lg text-slate-400 mb-12 max-w-xl mx-auto">
              Join the sovereign mesh. Free, open source, and yours forever.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="px-12 py-5 bg-white text-[#0F0F1A] rounded-2xl text-lg font-bold hover:bg-slate-100 transition-colors flex items-center gap-3 shadow-xl">
                <Sparkles className="w-5 h-5" /> Forge Your Identity
              </Link>
              <Link href="/manifesto" className="px-10 py-5 border border-white/20 text-white rounded-2xl text-lg font-semibold hover:bg-white/5 transition-colors flex items-center gap-3">
                Read Manifesto <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="py-16 px-6 lg:px-12 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto">
          {/* Big Typography */}
          <div className="mb-16 overflow-hidden">
            <div className="text-[80px] lg:text-[160px] font-black tracking-tighter text-slate-100 leading-none select-none">
              NANDIX
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-between gap-12">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0F0F1A] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-400">Sovereign Mesh OS</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-4 text-sm">
              {[
                { label: "Product", items: ["Features", "Security", "Pricing", "Changelog"] },
                { label: "Resources", items: ["Documentation", "GitHub", "Manifesto", "Blog"] },
                { label: "Legal", items: ["Privacy", "Terms", "Open Source"] },
              ].map((col) => (
                <div key={col.label}>
                  <div className="font-bold text-slate-900 mb-3">{col.label}</div>
                  {col.items.map((item) => (
                    <Link key={item} href="#" className="block text-slate-400 hover:text-slate-700 transition-colors py-1">
                      {item}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-16 pt-8 border-t border-slate-100">
            <span className="text-xs text-slate-400">© 2024 Nandix Protocol. All rights reserved.</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
