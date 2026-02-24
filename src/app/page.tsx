"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Zap, Globe, ArrowRight, Download, Share2,
  Smartphone, Mail, Activity, Cpu, Lock, ChevronRight,
  Search, Radar, Fingerprint
} from "lucide-react";
import { GhostRadar } from "@/components/AI/GhostRadar";
import { TACTILE_VARIANTS, TACTILE_SHADOWS } from "@/lib/ui/TactileJuice";
import { identity } from "@/lib/crypto/Identity";
import { kernel } from "@/lib/core/NandixKernel";

/**
 * 🏛️ THE GRAND LANDING (V3) — "NANDIX: THE CONQUEST"
 * 
 * 🎓 MISSION: A world-class visual entrance that communicates 
 * sovereignty, performance, and accessibility.
 */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [bridgeMode, setBridgeMode] = useState<"NONE" | "PHONE" | "EMAIL">("NONE");
  const [contactValue, setContactValue] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [uptime, setUptime] = useState(0);

  // Track scroll for navbar transparency
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Kernel Heartbeat sync
    const timer = setInterval(() => setUptime(kernel.getUptime()), 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(timer);
    };
  }, []);

  const handleBridgeRestore = async () => {
    setIsRestoring(true);
    // Simulate bridge restore
    const success = await identity.restoreFromBridge(contactValue);
    setTimeout(() => {
      setIsRestoring(false);
      if (success) window.location.href = "/nandix";
      else alert("Sovereign Bridge: Identity not found for this pointer.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F7] text-tactile-text selection:bg-tactile-sage/30 overflow-x-hidden">
      {/* 💡 Global Lighting Source */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/80 via-transparent to-slate-200/20 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-tactile-sage/10 via-transparent to-transparent pointer-events-none z-0" />

      {/* 🧭 Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "h-16 bg-white/40 backdrop-blur-2xl border-b border-white/50 shadow-sm" : "h-24 bg-transparent"}`}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <motion.div
              variants={TACTILE_VARIANTS.press}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="w-10 h-10 rounded-xl bg-white shadow-convex flex items-center justify-center border border-white"
            >
              <Shield className="w-6 h-6 text-tactile-text opacity-80" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter uppercase">Nandix.</span>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-tactile-leaf leading-none">Sovereign OS</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10 text-[10px] font-black text-tactile-leaf uppercase tracking-[0.3em]">
            <Link href="#reactor" className="hover:text-tactile-text transition-colors">Reactor</Link>
            <Link href="#radar" className="hover:text-tactile-text transition-colors">Mesh</Link>
            <Link href="/manifesto" className="hover:text-tactile-text transition-colors">Manifesto</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/nandix" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-tactile-leaf opacity-60 hover:opacity-100 transition-opacity">
              Direct Link
            </Link>
            <Link href="/signup" className="btn-tactile px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-white shadow-convex">
              Initialize
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* ☢️ HERO: THE REACTOR CORE */}
        <section id="reactor" className="pt-40 pb-32 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 text-left">
              <motion.div
                variants={TACTILE_VARIANTS.slideUp}
                initial="initial"
                animate="animate"
              >
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/50 border border-white shadow-sm text-[9px] font-black uppercase tracking-[0.3em] text-tactile-leaf mb-10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tactile-sage opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-tactile-sage"></span>
                  </span>
                  Kernel v2.5 Stable // Trident Turbo Active
                </div>

                <h1 className="text-7xl md:text-[140px] font-black tracking-tighter leading-[0.8] text-tactile-text mb-10">
                  CONQUER <br />
                  <span className="text-tactile-leaf/20">THE </span>
                  VOID.
                </h1>

                <p className="max-w-xl text-xl text-tactile-leaf font-medium mb-12 leading-tight">
                  The world's first **Sovereign Intelligence OS**.
                  A distributed peer-mesh that grows stronger with every node.
                  No servers. No tracking. Just pure power.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
                  <Link href="/signup" className="btn-tactile px-12 py-7 bg-tactile-sage text-lg uppercase font-black tracking-[0.2em] shadow-levitate flex items-center justify-center gap-3">
                    Begin Conquest <ChevronRight className="w-5 h-5" />
                  </Link>

                  <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/40 shadow-concave border border-white/50">
                    <button
                      onClick={() => setBridgeMode("PHONE")}
                      className={`p-4 rounded-xl transition-all ${bridgeMode === "PHONE" ? "bg-white shadow-convex text-tactile-text" : "text-tactile-leaf opacity-40 hover:opacity-100"}`}
                    >
                      <Smartphone className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setBridgeMode("EMAIL")}
                      className={`p-4 rounded-xl transition-all ${bridgeMode === "EMAIL" ? "bg-white shadow-convex text-tactile-text" : "text-tactile-leaf opacity-40 hover:opacity-100"}`}
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* 🛡️ SOVEREIGN BRIDGE ONBOARDING */}
                <AnimatePresence mode="wait">
                  {bridgeMode !== "NONE" && (
                    <motion.div
                      variants={TACTILE_VARIANTS.milled}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="mt-8 p-6 rounded-3xl bg-white/60 backdrop-blur-xl border border-white shadow-levitate max-w-md"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-tactile-leaf">
                          Sovereign Bridge // {bridgeMode}
                        </span>
                        <button onClick={() => setBridgeMode("NONE")} className="text-tactile-leaf opacity-40">
                          <Lock className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={bridgeMode === "PHONE" ? "+1 (555) 000-0000" : "sovereign@nandix.xyz"}
                          value={contactValue}
                          onChange={(e) => setContactValue(e.target.value)}
                          className="w-full bg-white/50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-concave focus:ring-2 ring-tactile-sage transition-all outline-none"
                        />
                        <button
                          onClick={handleBridgeRestore}
                          disabled={!contactValue || isRestoring}
                          className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-tactile-text text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                        >
                          {isRestoring ? "Checking..." : "Manifest"}
                        </button>
                      </div>
                      <p className="mt-4 text-[9px] font-medium text-tactile-leaf leading-relaxed opacity-60">
                        We'll use a **Blinded Relay** to verify your identity.
                        Your actual {bridgeMode.toLowerCase()} is never stored on the mesh.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* 🏢 THE REACTOR VISUALIZER */}
            <div className="flex-1 relative">
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 1, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-80 h-80 md:w-[500px] md:h-[500px] mx-auto"
              >
                <div className="absolute inset-0 bg-[#F3F4F7] rounded-[80px] shadow-levitate border border-white flex items-center justify-center p-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />

                  <div className="w-full h-full rounded-[60px] bg-[#F3F4F7] shadow-concave flex flex-col items-center justify-center relative">
                    {/* Core Pulse */}
                    <motion.div
                      variants={TACTILE_VARIANTS.pulse}
                      initial="initial"
                      animate="animate"
                      className="w-48 h-48 bg-tactile-sage/30 rounded-full blur-3xl absolute opacity-30"
                    />

                    <div className="text-center relative z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 border border-white shadow-sm mb-4">
                        <Activity className="w-3 h-3 text-tactile-sage animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-tactile-text">Reactor Online</span>
                      </div>
                      <div className="text-4xl md:text-6xl font-black text-tactile-text tracking-tighter">
                        {uptime}ms
                      </div>
                      <div className="text-[8px] font-black uppercase tracking-[0.4em] text-tactile-leaf mt-2">
                        Kernel Uptime
                      </div>
                    </div>

                    {/* Status Rings */}
                    <div className="absolute inset-6 rounded-[48px] border border-tactile-sage/10 pointer-events-none" />
                    <div className="absolute inset-12 rounded-[32px] border border-tactile-sage/5 pointer-events-none" />
                  </div>
                </div>

                {/* Floating Shards */}
                <motion.div
                  animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 w-24 h-24 bg-white rounded-3xl shadow-convex border border-white flex items-center justify-center"
                >
                  <Cpu className="w-10 h-10 text-tactile-leaf opacity-30" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-10 -left-10 w-28 h-28 bg-white rounded-[40px] shadow-convex border border-white flex items-center justify-center"
                >
                  <Fingerprint className="w-12 h-12 text-tactile-leaf opacity-30" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 🕸️ THE MESH: GHOST RADAR */}
        <section id="radar" className="py-48 bg-white/30 border-y border-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row gap-20 items-center">
              <div className="w-full md:w-[600px]">
                <GhostRadar />
              </div>
              <div className="flex-1 space-y-8 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-tactile-sage/20 text-[10px] font-black uppercase tracking-widest text-tactile-leaf">
                  Global Mesh Observer
                </div>
                <h2 className="text-6xl font-black tracking-tighter leading-[0.9]">
                  THE MESH <br />
                  <span className="text-tactile-leaf/40 italic">IS ALIVE.</span>
                </h2>
                <p className="text-xl text-tactile-leaf font-medium leading-relaxed">
                  Nandix isn't just an app on your phone; it's a node in a global,
                  living nervous system. Agents coordinate, verify, and move
                  at the speed of light across the Green Wire.
                </p>
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="space-y-2">
                    <div className="text-3xl font-black text-tactile-text tracking-tighter">100%</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-tactile-leaf opacity-50">Local Encryption</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-black text-tactile-text tracking-tighter">0.0B</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-tactile-leaf opacity-50">Central Server Data</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🛡️ SECURITY: THE ZERO-HOST STANDARD */}
        <section className="py-48 max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-20">
            THE SOVEREIGN <br />
            <span className="text-tactile-leaf/20">MANIFESTO.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Lock className="w-10 h-10" />,
                title: "Non-Custodial",
                desc: "We don't hold your keys. We can't see your data. You are the sole operator."
              },
              {
                icon: <Radar className="w-10 h-10" />,
                title: "Post-NAT Mesh",
                desc: "State-of-the-art STUN/TURN traversal ensures you're always connected, anywhere."
              },
              {
                icon: <Cpu className="w-10 h-10" />,
                title: "Ghost Logic",
                desc: "Autonomous local agents perform heavy lifting while you're offline."
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-16 rounded-[64px] bg-[#F3F4F7] shadow-levitate border border-white flex flex-col items-center gap-10"
              >
                <div className="w-20 h-20 rounded-3xl bg-white shadow-convex flex items-center justify-center text-tactile-leaf">
                  {card.icon}
                </div>
                <div className="space-y-6">
                  <h3 className="text-3xl font-black tracking-tighter uppercase">{card.title}</h3>
                  <p className="text-tactile-leaf font-medium leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 🏁 FINAL CTA */}
        <section className="pb-48 px-6">
          <div className="max-w-5xl mx-auto rounded-[80px] bg-[#F3F4F7] shadow-concave border border-white/40 p-24 text-center overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-tactile-sage/20 rounded-full blur-[100px] -mr-32 -mt-32" />

            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-12 relative z-10">
              INITIALIZE <br /> YOUR NODE.
            </h2>
            <Link href="/signup" className="btn-tactile inline-flex items-center gap-4 px-20 py-8 bg-tactile-text text-white text-2xl uppercase font-black tracking-[0.3em] shadow-convex hover:scale-105 transition-transform relative z-10">
              Get Started
            </Link>
          </div>
        </section>
      </main>

      {/* 🧭 FOOTER */}
      <footer className="py-20 bg-white/40 backdrop-blur-2xl border-t border-white/50 relative z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white shadow-convex flex items-center justify-center">
                <Shield className="w-4 h-4 text-tactile-text opacity-50" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-tactile-leaf opacity-40">
                Mission Nandix // Autonomous OS
              </span>
            </div>
            <div className="flex gap-12 text-[9px] font-black uppercase tracking-[0.4em] text-tactile-leaf/60">
              <Link href="#" className="hover:text-tactile-text transition-colors">Documentation</Link>
              <Link href="#" className="hover:text-tactile-text transition-colors">Network Map</Link>
              <Link href="#" className="hover:text-tactile-text transition-colors">Privacy</Link>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/50 border border-white shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-tactile-text">All Systems Nominal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
