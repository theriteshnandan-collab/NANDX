"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Eye, EyeOff, Lock, Fingerprint, Shield } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   LOGIN PAGE — Aurora Brutalism
   Biome: Chalk left / Obsidian right (reversed from landing)
══════════════════════════════════════════════════════════ */

export default function LoginPage() {
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => { window.location.href = "/nandix"; }, 1200);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

            {/* LEFT — Form Panel (Chalk) */}
            <div className="relative section-chalk flex flex-col justify-center px-8 md:px-16 py-12 overflow-hidden">
                <div className="absolute inset-0 mesh-bg opacity-40 pointer-events-none" />

                {/* Nav */}
                <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group">
                    <div className="w-7 h-7 rounded-lg bg-[#080808] flex items-center justify-center">
                        <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="font-black text-[#080808] text-[15px]">NANDIX</span>
                </Link>

                <div className="relative z-10 mt-12 max-w-sm mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Heading */}
                        <div className="label-mono text-zinc-400 mb-3">Returning Node</div>
                        <h1 className="text-[2.4rem] font-black text-[#080808] leading-none tracking-tight mb-2">
                            Re-enter<br />the mesh.
                        </h1>
                        <p className="text-zinc-500 text-sm mb-10">Your identity. Your keys. Your sovereignty.</p>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="label-mono text-zinc-500 mb-2 block">Identifier</label>
                                <input
                                    type="text"
                                    className="input-chalk"
                                    placeholder="@handle or peer ID"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label-mono text-zinc-500 mb-2 block">Passphrase</label>
                                <div className="relative">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        className="input-chalk pr-12"
                                        placeholder="Your sovereign passphrase"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPass(s => !s)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                whileTap={{ scale: 0.97 }}
                                disabled={loading}
                                className="btn-primary justify-center mt-2 disabled:opacity-60"
                            >
                                {loading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                                        <Zap className="w-4 h-4" />
                                    </motion.div>
                                ) : (
                                    <>Enter Mesh <ArrowRight className="w-4 h-4" /></>
                                )}
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-black/8" />
                            <span className="label-mono text-zinc-400">or</span>
                            <div className="flex-1 h-px bg-black/8" />
                        </div>

                        {/* Generate new identity */}
                        <Link href="/signup">
                            <button className="btn-ghost w-full justify-center">
                                Generate New Identity <Fingerprint className="w-4 h-4" />
                            </button>
                        </Link>

                        <p className="text-center label-mono text-zinc-400 mt-8">
                            No data leaves your browser. Ever.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT — Branding Panel (Obsidian) */}
            <div className="hidden lg:flex relative section-void flex-col justify-center px-16 overflow-hidden">
                {/* Glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, x: 32 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10"
                >
                    <div className="label-mono text-emerald-400/50 mb-8">The Protocol</div>

                    {[
                        { icon: Fingerprint, label: "Keypair Identity", body: "Generated fresh in your browser. Never transmitted." },
                        { icon: Lock, label: "Encrypted by Default", body: "Every message sealed before it leaves your device." },
                        { icon: Shield, label: "Zero Server Trust", body: "Nothing relayed. Nothing stored. Pure P2P." },
                    ].map((item, i) => (
                        <motion.div key={item.label}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex gap-5 mb-8 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-400/8 border border-emerald-400/15 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-400/12 transition-all">
                                <item.icon className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <div className="font-black text-white text-sm mb-1">{item.label}</div>
                                <div className="text-zinc-600 text-sm leading-relaxed">{item.body}</div>
                            </div>
                        </motion.div>
                    ))}

                    <div className="mt-12 pt-8 border-t border-white/[0.04]">
                        <div className="text-[2.5rem] font-black font-mono text-white leading-none">∞</div>
                        <div className="label-mono text-zinc-600 mt-2">Sovereign Nodes on the Mesh</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
