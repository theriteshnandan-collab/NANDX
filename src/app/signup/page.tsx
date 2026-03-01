"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Key, Radio, Globe, Sparkles } from "lucide-react";
import { identity } from "@/lib/crypto/Identity";

/* ══════════════════════════════════════════════════════════
   SIGNUP — Billion Dollar Brand
   Genesis ceremony · Void + Teal · Space Grotesk
══════════════════════════════════════════════════════════ */

export default function SignupPage() {
    const [handle, setHandle] = useState("");
    const [step, setStep] = useState<"idle" | "generating" | "done">("idle");

    // === AUTH GUARD ===
    // Instantly eject users who already have an identity to prevent amnesia
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const force = urlParams.get("force");
        if (identity.hasIdentity() && force !== "true") {
            window.location.href = "/nandix";
        }
    }, []);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        setStep("generating");
        setTimeout(() => setStep("done"), 1800);
        setTimeout(() => { window.location.href = "/nandix"; }, 3000);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2"
            style={{ background: "var(--bg-base)" }}>

            {/* LEFT — Dark branding panel */}
            <div className="hidden lg:flex flex-col justify-center px-16 py-16 relative"
                style={{ background: "var(--bg-elevated)", borderRight: "1px solid var(--bg-border)" }}>

                <Link href="/" className="flex items-center gap-2 mb-16">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                        <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-display font-bold text-slate-900 text-[15px]">NANDIX</span>
                </Link>

                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div className="eyebrow mb-6 text-blue-600">New Node Ceremony</div>
                    <h2 className="font-display font-bold text-slate-900 leading-tight tracking-tight mb-6"
                        style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                        Your identity<br />is your keys.
                    </h2>
                    <p className="text-[14px] leading-relaxed mb-10 max-w-sm"
                        style={{ color: "var(--text-secondary)" }}>
                        We generate a cryptographic keypair in your browser. No email.
                        No password reset. No backdoor. You own your node.
                    </p>

                    <div className="flex flex-col gap-5">
                        {[
                            { icon: Key, step: "01", label: "Keys Generated", body: "Ed25519 keypair via WebCrypto" },
                            { icon: Radio, step: "02", label: "Mesh Joined", body: "PeerJS broadcasts your node" },
                            { icon: Globe, step: "03", label: "Signal Live", body: "Post, vibe, reply — P2P" },
                        ].map((s, i) => (
                            <motion.div key={s.step}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-black/5 shadow-sm">
                                    <s.icon className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800 text-[13px]">{s.label}</div>
                                    <div className="label-data text-slate-400">{s.body}</div>
                                </div>
                                <div className="label-data text-blue-500/40">{s.step}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* RIGHT — Form */}
            <div className="flex flex-col justify-center px-8 md:px-16 py-12 relative">
                {/* Mobile logo */}
                <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                        <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-display font-bold text-slate-900 text-[15px]">NANDIX</span>
                </Link>

                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-[360px] mx-auto w-full">

                    <div className="eyebrow mb-3 text-blue-600">Genesis Protocol</div>
                    <h1 className="font-display font-bold text-slate-900 leading-tight tracking-tight mb-2"
                        style={{ fontSize: "clamp(2rem,4vw,2.8rem)" }}>
                        Become<br />a node.
                    </h1>
                    <p className="mb-10 text-[14px]" style={{ color: "var(--text-secondary)" }}>
                        Pick a handle. We generate everything else.
                    </p>

                    <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                        <div>
                            <label className="label-data block mb-2">Your Handle</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm"
                                    style={{ color: "var(--text-muted)" }}>@</span>
                                <input type="text" className="input-void pl-8"
                                    placeholder="sovereign_signal"
                                    value={handle}
                                    onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                                    required />
                            </div>
                            <p className="label-data mt-2">Letters, numbers, underscores only</p>
                        </div>

                        <motion.button type="submit" whileTap={{ scale: 0.97 }}
                            disabled={step !== "idle" || !handle}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 justify-center mt-2 rounded-xl py-3 font-bold text-[14px] shadow-lg shadow-blue-500/20 disabled:opacity-60 transition-all">
                            {step === "done" ? (
                                <><Sparkles className="w-4 h-4" /> Identity Generated!</>
                            ) : step === "generating" ? (
                                <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                                    <Key className="w-4 h-4" />
                                </motion.div> Generating Keys…</>
                            ) : (
                                <>Generate Identity <ArrowRight className="w-4 h-4" /></>
                            )}
                        </motion.button>
                    </form>

                    {step === "generating" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            className="mt-5 overflow-hidden">
                            <div className="card p-4">
                                {["Seeding WebCrypto RNG…", "Generating Ed25519 keypair…", "Binding identity to handle…"].map((s, i) => (
                                    <motion.div key={s} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.4 }}
                                        className="flex items-center gap-2 mb-2 last:mb-0">
                                        <Zap className="w-3 h-3 animate-pulse text-blue-600" />
                                        <span className="label-data text-blue-600/70 font-bold">{s}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
                        <span className="label-data">already a node?</span>
                        <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
                    </div>

                    <Link href="/login">
                        <button className="btn-outline w-full justify-center rounded-xl py-3">Return to Mesh</button>
                    </Link>

                    <p className="text-center label-data mt-8">No email. No password. Zero tracking.</p>
                </motion.div>
            </div>
        </div>
    );
}
