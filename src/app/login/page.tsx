"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Fingerprint, Shield, Zap, Eye, EyeOff } from "lucide-react";
import { identity } from "@/lib/crypto/Identity";

/* ══════════════════════════════════════════════════════════
   LOGIN — Billion Dollar Brand
   Void black · Electric teal · Space Grotesk
══════════════════════════════════════════════════════════ */

export default function LoginPage() {
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    // === AUTH GUARD ===
    // Instantly eject users who already have an identity to prevent amnesia
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const force = urlParams.get("force");
        if (identity.hasIdentity() && force !== "true") {
            window.location.href = "/nandix";
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => { window.location.href = "/nandix"; }, 1000);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2"
            style={{ background: "var(--bg-base)" }}>

            {/* LEFT — Form */}
            <div className="flex flex-col justify-center px-8 md:px-16 py-12 relative">
                <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all bg-blue-500/10 border border-blue-500/20">
                        <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-display font-bold text-slate-900 text-[15px]">NANDIX</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-[360px] mx-auto w-full mt-12"
                >
                    <div className="eyebrow mb-3 text-blue-600">Returning Node</div>
                    <h1 className="font-display font-bold text-slate-900 leading-tight tracking-tight mb-2"
                        style={{ fontSize: "clamp(2rem,4vw,2.8rem)" }}>
                        Re-enter<br />the mesh.
                    </h1>
                    <p className="mb-10 text-[14px]" style={{ color: "var(--text-secondary)" }}>
                        Your identity. Your keys. Your sovereignty.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="label-data block mb-2">Identifier</label>
                            <input type="text" className="input-void" placeholder="@handle or peer ID" required />
                        </div>
                        <div>
                            <label className="label-data block mb-2">Passphrase</label>
                            <div className="relative">
                                <input type={showPass ? "text" : "password"} className="input-void pr-12"
                                    placeholder="Your sovereign passphrase" required />
                                <button type="button" onClick={() => setShowPass(s => !s)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: "var(--text-muted)" }}>
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <motion.button type="submit" whileTap={{ scale: 0.97 }}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 justify-center mt-2 rounded-xl py-3 font-bold text-[14px] shadow-lg shadow-blue-500/20 disabled:opacity-60 transition-all">
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                                    <Zap className="w-4 h-4" />
                                </motion.div>
                            ) : (
                                <>Enter Mesh <ArrowRight className="w-4 h-4" /></>
                            )}
                        </motion.button>
                    </form>

                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
                        <span className="label-data">or</span>
                        <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
                    </div>

                    <Link href="/signup">
                        <button className="btn-outline w-full justify-center rounded-xl py-3">
                            Generate New Identity <Fingerprint className="w-4 h-4" />
                        </button>
                    </Link>

                    <p className="text-center label-data mt-8">No data leaves your browser. Ever.</p>
                </motion.div>
            </div>

            {/* RIGHT — Trust panel */}
            <div className="hidden lg:flex flex-col justify-center px-16 relative"
                style={{ background: "var(--bg-elevated)", borderLeft: "1px solid var(--bg-border)" }}>

                <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}>
                    <div className="eyebrow mb-8 text-blue-600">The Protocol</div>

                    {[
                        { icon: Fingerprint, label: "Keypair Identity", body: "Generated in your browser via WebCrypto. Never transmitted." },
                        { icon: Lock, label: "Encrypted by Default", body: "Every message sealed before it leaves your device." },
                        { icon: Shield, label: "Zero Server Trust", body: "Nothing relayed. Nothing stored. Pure P2P." },
                    ].map((item, i) => (
                        <motion.div key={item.label}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex gap-5 mb-8"
                        >
                            <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                                <item.icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-800 text-[14px] mb-1">{item.label}</div>
                                <div className="text-[13px] leading-relaxed text-slate-500">{item.body}</div>
                            </div>
                        </motion.div>
                    ))}

                    <div className="mt-12 pt-8 border-t border-black/[0.03]">
                        <div className="font-display font-bold text-[3rem] leading-none text-blue-600">∞</div>
                        <div className="label-data mt-2 text-slate-400">Sovereign Nodes on the Mesh</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
