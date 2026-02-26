"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Radio, Globe, Sparkles, Key } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   SIGNUP PAGE — Aurora Brutalism
   Biome: Obsidian left / Chalk right (generation ceremony)
══════════════════════════════════════════════════════════ */

export default function SignupPage() {
    const [handle, setHandle] = useState("");
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            setGenerated(true);
        }, 1800);
        setTimeout(() => { window.location.href = "/nandix"; }, 3200);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

            {/* LEFT — Branding Panel (Obsidian) */}
            <div className="hidden lg:flex relative section-void flex-col justify-center px-16 py-16 overflow-hidden">
                {/* Glow orbs */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/6 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-emerald-500/6 rounded-full blur-[80px] pointer-events-none" />

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 mb-16">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="font-black text-white text-[15px]">NANDIX</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10"
                >
                    <div className="label-mono text-violet-400/50 mb-6">New Node Ceremony</div>
                    <h2 className="text-[3rem] font-black text-white leading-tight tracking-tight mb-6">
                        Your identity<br />
                        <span style={{ WebkitTextStroke: "1.5px white", color: "transparent" }}>
                            is your keys.
                        </span>
                    </h2>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-10 max-w-sm">
                        We generate a cryptographic keypair in your browser. No email. No password reset.
                        No backdoor. You own your node.
                    </p>

                    {/* Steps */}
                    <div className="space-y-5">
                        {[
                            { icon: Key, step: "01", label: "Keys Generated", body: "Ed25519 keypair in WebCrypto" },
                            { icon: Radio, step: "02", label: "Mesh Joined", body: "PeerJS broadcasts your node" },
                            { icon: Globe, step: "03", label: "Signal Live", body: "Post, vibe, reply — P2P" },
                        ].map((s, i) => (
                            <motion.div key={s.step}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                                    <s.icon className="w-4 h-4 text-zinc-500" />
                                </div>
                                <div>
                                    <div className="font-black text-zinc-300 text-[13px]">{s.label}</div>
                                    <div className="label-mono text-zinc-700">{s.body}</div>
                                </div>
                                <div className="ml-auto label-mono text-zinc-800">{s.step}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* RIGHT — Form Panel (Chalk) */}
            <div className="relative section-chalk flex flex-col justify-center px-8 md:px-16 py-12 overflow-hidden">
                <div className="absolute inset-0 mesh-bg opacity-40 pointer-events-none" />

                {/* Mobile logo */}
                <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
                    <div className="w-7 h-7 rounded-lg bg-[#080808] flex items-center justify-center">
                        <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="font-black text-[#080808] text-[15px]">NANDIX</span>
                </Link>

                <div className="relative z-10 max-w-sm mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="label-mono text-zinc-400 mb-3">Genesis Protocol</div>
                        <h1 className="text-[2.4rem] font-black text-[#080808] leading-none tracking-tight mb-2">
                            Become<br />a node.
                        </h1>
                        <p className="text-zinc-500 text-sm mb-10">
                            Pick a handle. We generate everything else.
                        </p>

                        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                            <div>
                                <label className="label-mono text-zinc-500 mb-2 block">Your Handle</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-sm">@</span>
                                    <input
                                        type="text"
                                        className="input-chalk pl-8"
                                        placeholder="sovereign_signal"
                                        value={handle}
                                        onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                                        required
                                    />
                                </div>
                                <p className="label-mono text-zinc-400 mt-2">Letters, numbers, underscores only</p>
                            </div>

                            <motion.button
                                type="submit"
                                whileTap={{ scale: 0.97 }}
                                disabled={generating || generated || !handle}
                                className={`btn-verdant justify-center mt-2 disabled:opacity-60 ${generated ? "opacity-80" : ""}`}
                            >
                                {generated ? (
                                    <><Sparkles className="w-4 h-4" /> Identity Generated!</>
                                ) : generating ? (
                                    <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                                        <Key className="w-4 h-4" />
                                    </motion.div> Generating Keys…</>
                                ) : (
                                    <>Generate Identity <ArrowRight className="w-4 h-4" /></>
                                )}
                            </motion.button>
                        </form>

                        {/* Key generation progress */}
                        {generating && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-6 overflow-hidden"
                            >
                                <div className="p-4 rounded-2xl bg-[#080808] border border-white/5">
                                    {["Seeding WebCrypto RNG…", "Generating Ed25519 keypair…", "Binding identity to handle…"].map((step, i) => (
                                        <motion.div key={step}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.4 }}
                                            className="flex items-center gap-2 mb-2 last:mb-0"
                                        >
                                            <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
                                            <span className="label-mono text-emerald-400/70">{step}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-black/8" />
                            <span className="label-mono text-zinc-400">already a node?</span>
                            <div className="flex-1 h-px bg-black/8" />
                        </div>

                        <Link href="/login">
                            <button className="btn-ghost w-full justify-center">Return to Mesh</button>
                        </Link>

                        <p className="text-center label-mono text-zinc-400 mt-8">
                            No email. No password. Zero tracking.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
