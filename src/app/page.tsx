"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield, Lock, Cpu, Globe, ArrowRight, Fingerprint,
  Wifi, Volume2, FileUp, Smartphone, Brain, Eye,
  Check, X, MessageCircle, Zap, Activity
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   🏛️ NANDIX — SUPREME LANDING PAGE
   "Apple Store meets Linear.app"
   12 Sections · Lunar Glass Design · Full Story
   ──────────────────────────────────────────────────────────── */

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
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

/* ─── FEATURES DATA ──────────────────────────────────────── */
const features = [
  {
    icon: <Fingerprint className="w-7 h-7" />,
    title: "Sovereign Identity",
    desc: "Your keys generate your identity. No email, no phone number, no central authority. You own your digital self.",
    span: "md:col-span-2",
  },
  {
    icon: <Brain className="w-7 h-7" />,
    title: "Ghost AI",
    desc: "AI that runs on YOUR device. Summarize, search, and automate — without ever sharing your data with a cloud.",
    span: "",
  },
  {
    icon: <Lock className="w-7 h-7" />,
    title: "E2E Encryption",
    desc: "AES-256-GCM on every message, file, and call. We can't read your data even if we wanted to.",
    span: "",
  },
  {
    icon: <Wifi className="w-7 h-7" />,
    title: "P2P Mesh Network",
    desc: "Direct device-to-device connections via WebRTC. Your messages never touch a central server.",
    span: "",
  },
  {
    icon: <Smartphone className="w-7 h-7" />,
    title: "The Sceptre",
    desc: "Control your desktop from your phone. Run AI tasks, manage transfers, check kernel status — all remotely.",
    span: "",
  },
  {
    icon: <Volume2 className="w-7 h-7" />,
    title: "Spatial Audio",
    desc: "HRTF 3D positional audio on group calls. Each voice comes from a unique direction — like a real room.",
    span: "md:col-span-2",
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

/* ─── STEPS DATA ─────────────────────────────────────────── */
const steps = [
  {
    num: "01",
    icon: <Fingerprint className="w-8 h-8" />,
    title: "Create Identity",
    desc: "Generate your sovereign identity with a 12-word mnemonic seed. No email. No phone number.",
  },
  {
    num: "02",
    icon: <Globe className="w-8 h-8" />,
    title: "Join the Mesh",
    desc: "Your device becomes a node in the global mesh. Connect directly to any peer, anywhere.",
  },
  {
    num: "03",
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Communicate Freely",
    desc: "Chat, call, share files — everything encrypted end-to-end, everything peer-to-peer.",
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
            <Link href="/manifesto" className="hover:text-[#0F0F1A] transition-colors">Manifesto</Link>
          </div>

          <Link
            href="/signup"
            className="btn-primary !px-5 !py-2.5 text-sm font-semibold rounded-full flex items-center gap-2"
          >
            Launch App <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: HERO
          ═══════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-36 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Background Blobs */}
        <div className="blob-mint w-[500px] h-[500px] -top-20 -right-40" />
        <div className="blob-lavender w-[600px] h-[600px] top-40 -left-60" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left: Copy */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/50 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-emerald-700">Kernel v2.5 Stable</span>
              </div>
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-[80px] xl:text-[96px] font-black tracking-tight leading-[0.95] mb-8"
            >
              Communication{" "}
              <span className="text-slate-300">Without</span>{" "}
              Compromise.
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
              className="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10"
            >
              The world&apos;s first sovereign peer-to-peer mesh OS.
              No servers. No tracking. No compromise. Just pure, encrypted freedom.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link href="/signup" className="btn-primary !px-10 !py-5 text-base font-bold rounded-2xl">
                Get Started — It&apos;s Free
              </Link>
              <Link href="/manifesto" className="btn-ghost flex items-center gap-2 text-base font-semibold">
                Read the Manifesto <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right: Product Card */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.4 }}
            className="flex-1 w-full max-w-md"
          >
            <div className="card-elevated p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/40 rounded-full blur-[60px] -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Reactor Online</span>
                  </div>
                  <Activity className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-6">
                  {[
                    { label: "Central Servers", value: "0", accent: true },
                    { label: "Local Encryption", value: "256-bit AES" },
                    { label: "Data We Store", value: "0 Bytes", accent: true },
                    { label: "Protocol", value: "WebRTC P2P" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <span className="text-sm text-slate-400 font-medium">{stat.label}</span>
                      <span className={`text-sm font-bold ${stat.accent ? "text-emerald-600" : "text-[#0F0F1A]"}`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: MARQUEE TRUST STRIP
          ═══════════════════════════════════════════════════════ */}
      <section className="py-5 bg-slate-50/80 border-y border-slate-100 overflow-hidden">
        <div className="marquee-track whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <React.Fragment key={setIdx}>
              {["100% Open Source", "Zero Central Servers", "End-to-End Encrypted", "P2P Mesh Architecture", "Sovereign Identity", "Local AI Processing", "No Phone Number Required", "256-bit AES-GCM"].map((item, i) => (
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
          SECTION 4: ABOUT US
          ═══════════════════════════════════════════════════════ */}
      <section id="about" className="py-24 lg:py-36 px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-6">
            <Globe className="w-3.5 h-3.5" /> Who We Are
          </span>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-8">
            We Are the Architects of{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
              Sovereign Technology.
            </span>
          </h2>
          <div className="space-y-6 text-lg text-slate-500 leading-relaxed">
            <p>
              Nandix was born from a single belief: <strong className="text-[#0F0F1A]">communication is a human right, not a SaaS subscription.</strong> We are a team of engineers, cryptographers, and designers building the infrastructure for a world where your data belongs to you — and only you.
            </p>
            <p>
              Founded in 2024, we set out to build what Big Tech refuses to: a communication platform with zero central servers, zero data collection, and zero compromise. Every message you send on Nandix travels directly from your device to its destination — encrypted, verified, and untouchable.
            </p>
          </div>
        </motion.div>

        <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
          {[
            { value: "2024", label: "Founded" },
            { value: "0", label: "Central Servers" },
            { value: "100%", label: "End-to-End Encrypted" },
          ].map((stat, i) => (
            <motion.div key={i} {...staggerChild} className="card-elevated p-8 text-center">
              <div className="text-4xl font-black text-emerald-600 tracking-tight mb-2">{stat.value}</div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5: WHAT IS NANDIX
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 px-6 lg:px-12 max-w-7xl mx-auto bg-slate-50/50 -mx-6 lg:-mx-12 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200/50 text-xs font-semibold text-violet-700 uppercase tracking-wider mb-6">
              <Cpu className="w-3.5 h-3.5" /> The Technology
            </span>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              What Is Nandix?
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Nandix is a <strong className="text-[#0F0F1A]">Sovereign Intelligence OS</strong> — a complete operating system for private communication that runs entirely on your devices. Think WhatsApp + Dropbox + Local AI — but with zero servers in between.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Wifi className="w-5 h-5" />, label: "WebRTC P2P Mesh", detail: "Direct connections" },
              { icon: <Lock className="w-5 h-5" />, label: "256-bit AES-GCM", detail: "Military-grade encryption" },
              { icon: <Fingerprint className="w-5 h-5" />, label: "BIP-39 Identity", detail: "Sovereign key derivation" },
              { icon: <Brain className="w-5 h-5" />, label: "Local Ghost AI", detail: "On-device inference" },
              { icon: <FileUp className="w-5 h-5" />, label: "OPFS Storage", detail: "1GB+ file support" },
              { icon: <Volume2 className="w-5 h-5" />, label: "Spatial Audio", detail: "HRTF 3D sound" },
              { icon: <Zap className="w-5 h-5" />, label: "60fps Protocol", detail: "Binary Trident engine" },
              { icon: <Smartphone className="w-5 h-5" />, label: "The Sceptre", detail: "Mobile remote control" },
            ].map((tech, i) => (
              <motion.div key={i} {...staggerChild} className="card-elevated p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  {tech.icon}
                </div>
                <div>
                  <div className="text-sm font-bold">{tech.label}</div>
                  <div className="text-xs text-slate-400">{tech.detail}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6: FEATURE BENTO GRID
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
              className={`card-elevated p-8 group cursor-default ${feat.span}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 transition-colors mb-6">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 7: SECURITY (Dark Inversion)
          ═══════════════════════════════════════════════════════ */}
      <section id="security" className="section-dark py-24 lg:py-36 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

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
              <motion.div key={i} {...staggerChild} className="text-center">
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
          SECTION 8: MANIFESTO PULLQUOTE
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 px-6 lg:px-12 bg-slate-50/50 border-b border-slate-100 relative">
        <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center relative">
          <span className="text-[160px] font-black text-slate-100 absolute -top-16 left-1/2 -translate-x-1/2 select-none pointer-events-none leading-none">&ldquo;</span>
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
          SECTION 9: HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6">
            Three Steps to Sovereignty.
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Getting started takes less than 60 seconds. No email, no phone number, no personal data.
          </p>
        </motion.div>

        <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-slate-200 z-0" />

          {steps.map((step, i) => (
            <motion.div key={i} {...staggerChild} className="text-center relative z-10">
              <div className="w-14 h-14 rounded-full bg-[#0F0F1A] text-white font-black text-lg flex items-center justify-center mx-auto mb-8">
                {step.num}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-500">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 10: COMPARISON TABLE
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 px-6 lg:px-12 max-w-5xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6">
            Why Nandix?
          </h2>
          <p className="text-lg text-slate-500">
            See how we compare to the platforms you already know.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="overflow-hidden rounded-3xl border border-slate-200">
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
          SECTION 11: THE VISION
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 px-6 lg:px-12 bg-slate-50/50 border-y border-slate-100">
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
          SECTION 12: FINAL CTA + FOOTER
          ═══════════════════════════════════════════════════════ */}
      <section className="py-32 lg:py-44 px-6 lg:px-12 text-center relative">
        <div className="blob-mint w-[500px] h-[500px] top-0 left-1/4" />
        <div className="blob-lavender w-[400px] h-[400px] bottom-0 right-1/4" />

        <motion.div {...fadeUp} className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-8">
            Your Data.{" "}<br className="hidden sm:block" />
            Your Mesh.{" "}<br className="hidden sm:block" />
            Your Rules.
          </h2>
          <p className="text-lg text-slate-500 mb-12 max-w-xl mx-auto">
            Join thousands building the future of private communication. It&apos;s free, open source, and yours forever.
          </p>
          <Link href="/signup" className="btn-primary !px-14 !py-6 text-lg font-bold rounded-2xl inline-flex items-center gap-3">
            Launch Nandix — It&apos;s Free <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────── */}
      <footer className="py-12 px-6 lg:px-12 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F0F1A] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-400">Nandix · Sovereign Mesh OS</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-slate-400 font-medium">
            <Link href="#" className="hover:text-[#0F0F1A] transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-[#0F0F1A] transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-[#0F0F1A] transition-colors">Privacy</Link>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
