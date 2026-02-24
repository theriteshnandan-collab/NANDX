"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, ArrowLeft, Key, Smartphone, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { identity } from "@/lib/crypto/Identity";

/* ────────────────────────────────────────────────────────────
   🔑 SOUL RECOVERY
   Two paths:
   1. Mnemonic Entry (12 words)
   2. Sovereign Bridge (Phone/Email)
   ──────────────────────────────────────────────────────────── */

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

type Mode = "CHOICE" | "MNEMONIC" | "BRIDGE";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("CHOICE");
    const [words, setWords] = useState<string[]>(Array(12).fill(""));
    const [bridgeType, setBridgeType] = useState<"PHONE" | "EMAIL">("EMAIL");
    const [bridgeValue, setBridgeValue] = useState("");
    const [isRestoring, setIsRestoring] = useState(false);

    /* ── MNEMONIC RECOVERY ────────────────────────────── */
    const handleMnemonicRecover = () => {
        const mnemonic = words.join(" ").trim().toLowerCase();

        if (words.some((w) => !w.trim())) {
            toast.error("Please fill in all 12 words.");
            return;
        }

        const profile = identity.recover(mnemonic);

        if (profile) {
            toast.success("Identity Restored.", {
                description: `Welcome back, ${profile.id.substring(0, 20)}...`,
            });
            router.push("/nandix");
        } else {
            toast.error("Invalid mnemonic.", {
                description: "Please check your words and try again.",
            });
        }
    };

    /* ── BRIDGE RECOVERY ──────────────────────────────── */
    const handleBridgeRecover = async () => {
        if (!bridgeValue.trim()) {
            toast.error("Please enter your contact.");
            return;
        }

        setIsRestoring(true);
        const success = await identity.restoreFromBridge(bridgeValue);

        setTimeout(() => {
            setIsRestoring(false);
            if (success) {
                toast.success("Identity Restored via Sovereign Bridge.");
                router.push("/nandix");
            } else {
                toast.error("Identity not found.", {
                    description: "No identity is linked to this contact on the mesh.",
                });
            }
        }, 2000);
    };

    /* ── UPDATE WORD ──────────────────────────────────── */
    const updateWord = (index: number, value: string) => {
        const newWords = [...words];
        newWords[index] = value.toLowerCase().trim();
        setWords(newWords);
    };

    return (
        <div className="min-h-screen bg-[#050508] text-zinc-300 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* 🏛️ VOID AMBIENCE */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                        backgroundSize: "32px 32px",
                    }}
                />
                <motion.div
                    animate={{ x: [0, 30, -20, 0], y: [0, -40, 30, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.03] blur-[120px]"
                />
                <motion.div
                    animate={{ x: [0, -30, 20, 0], y: [0, 40, -30, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-violet-500/[0.03] blur-[120px]"
                />
            </div>

            {/* Back to landing */}
            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-emerald-400 transition-all z-20 group"
            >
                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:border-emerald-500/30 transition-all">
                    <Shield className="w-4 h-4" />
                </div>
                NANDIX
            </Link>

            <div className="w-full max-w-lg relative z-10">
                <AnimatePresence mode="wait">
                    {/* ═══════════════════════════════════════════════════
              THE CHOICE
              ═══════════════════════════════════════════════════ */}
                    {mode === "CHOICE" && (
                        <motion.div key="choice" {...fadeUp} className="space-y-6">
                            <div className="text-center mb-10">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                                >
                                    <Key className="w-10 h-10 text-white" />
                                </motion.div>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 text-white">
                                    Restore Your Soul
                                </h1>
                                <p className="text-zinc-500 text-sm font-medium max-w-sm mx-auto">
                                    Your identity is anchored to your device. Choose your recovery protocol.
                                </p>
                            </div>

                            {/* Mnemonic Recovery */}
                            <button
                                onClick={() => setMode("MNEMONIC")}
                                className="w-full p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] text-left group transition-all hover:bg-white/[0.04] hover:border-white/[0.1] hover:scale-[1.01] active:scale-[0.99] flex items-center gap-6"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-emerald-500/20 group-hover:border-emerald-500/40 flex items-center justify-center text-emerald-400 transition-all shrink-0">
                                    <Key className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-xl mb-1 text-white uppercase tracking-tight">12 Magic Words</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">
                                        Enter the mnemonic seed phrase you saved during identity forging.
                                    </p>
                                </div>
                                <ArrowRight className="w-6 h-6 text-zinc-700 group-hover:text-emerald-400 transition-all" />
                            </button>

                            {/* Bridge Recovery */}
                            <button
                                onClick={() => setMode("BRIDGE")}
                                className="w-full p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] text-left group transition-all hover:bg-white/[0.04] hover:border-white/[0.1] hover:scale-[1.01] active:scale-[0.99] flex items-center gap-6"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-black/40 border-violet-500/20 group-hover:border-violet-500/40 flex items-center justify-center text-violet-400 transition-all shrink-0">
                                    <Lock className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-xl mb-1 text-white uppercase tracking-tight">Sovereign Bridge</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">
                                        Recover using a linked phone number or email address.
                                    </p>
                                </div>
                                <ArrowRight className="w-6 h-6 text-zinc-700 group-hover:text-violet-400 transition-all" />
                            </button>

                            {/* New Identity */}
                            <div className="text-center pt-8">
                                <p className="text-sm text-zinc-600 font-medium">
                                    New to the mesh?{" "}
                                    <Link href="/signup" className="text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest text-[11px] ml-2">
                                        Forge a New Identity →
                                    </Link>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════
              MNEMONIC ENTRY
              ═══════════════════════════════════════════════════ */}
                    {mode === "MNEMONIC" && (
                        <motion.div key="mnemonic" {...fadeUp} className="space-y-8">
                            <button
                                onClick={() => setMode("CHOICE")}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" /> Go Back
                            </button>

                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-black tracking-tighter mb-4 text-white">
                                    The 12 Words
                                </h1>
                                <p className="text-zinc-500 text-sm font-medium max-w-sm mx-auto">
                                    Type each word in order exactly as you wrote them down.
                                </p>
                            </div>

                            {/* Word Grid */}
                            <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] p-8 shadow-2xl backdrop-blur-3xl">
                                <div className="grid grid-cols-3 gap-4">
                                    {words.map((word, i) => (
                                        <div key={i} className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-700 group-focus-within:text-emerald-500 transition-all">
                                                {i + 1 < 10 ? `0${i + 1}` : i + 1}
                                            </span>
                                            <input
                                                type="text"
                                                value={word}
                                                onChange={(e) => updateWord(i, e.target.value)}
                                                className="w-full pl-10 pr-3 py-4 text-sm font-mono font-black bg-black/40 border border-white/[0.03] rounded-2xl text-white outline-none focus:border-emerald-500/30 focus:bg-emerald-500/[0.02] transition-all placeholder-zinc-800"
                                                placeholder="..."
                                                autoComplete="off"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recover Button */}
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleMnemonicRecover}
                                className="w-full py-6 rounded-[2rem] bg-white text-black text-xl font-black hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                            >
                                RESTORE IDENTITY <ArrowRight className="w-6 h-6" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════
              SOVEREIGN BRIDGE
              ═══════════════════════════════════════════════════ */}
                    {mode === "BRIDGE" && (
                        <motion.div key="bridge" {...fadeUp} className="space-y-8">
                            <button
                                onClick={() => setMode("CHOICE")}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" /> Go Back
                            </button>

                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-black tracking-tighter mb-4 text-white">
                                    Sovereign Bridge
                                </h1>
                                <p className="text-zinc-500 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                                    Blinded relay recovery. Your personal data is never stored outside your local mesh kernel.
                                </p>
                            </div>

                            {/* Bridge Type Toggle */}
                            <div className="flex gap-2 p-2 rounded-3xl bg-white/[0.02] border border-white/[0.04]">
                                <button
                                    onClick={() => setBridgeType("EMAIL")}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${bridgeType === "EMAIL"
                                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                        : "text-zinc-600 hover:text-zinc-300"
                                        }`}
                                >
                                    <Mail className="w-4 h-4" /> Email Relay
                                </button>
                                <button
                                    onClick={() => setBridgeType("PHONE")}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${bridgeType === "PHONE"
                                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                        : "text-zinc-600 hover:text-zinc-300"
                                        }`}
                                >
                                    <Smartphone className="w-4 h-4" /> SMS Tunnel
                                </button>
                            </div>

                            {/* Bridge Input */}
                            <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/[0.04] p-8 shadow-2xl backdrop-blur-3xl">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2">IDENTITY ENDPOINT</label>
                                    <input
                                        type={bridgeType === "EMAIL" ? "email" : "tel"}
                                        value={bridgeValue}
                                        onChange={(e) => setBridgeValue(e.target.value)}
                                        placeholder={
                                            bridgeType === "EMAIL"
                                                ? "your@identity.mesh"
                                                : "+1 555-000-0000"
                                        }
                                        className="w-full px-6 py-5 text-lg font-black bg-black/40 border border-white/[0.03] rounded-2xl text-white outline-none focus:border-emerald-500/30 transition-all placeholder-zinc-800"
                                    />
                                </div>
                                <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                                    <Shield className="w-5 h-5 text-emerald-500/50 shrink-0" />
                                    <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
                                        Your {bridgeType.toLowerCase()} is blinded using SHA-256 before leaving your device. Total sovereignty maintained.
                                    </p>
                                </div>
                            </div>

                            {/* Restore Button */}
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleBridgeRecover}
                                disabled={isRestoring || !bridgeValue.trim()}
                                className="w-full py-6 rounded-[2rem] bg-white text-black text-xl font-black hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                            >
                                {isRestoring ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
                                        BRIDGING ...
                                    </>
                                ) : (
                                    <>
                                        RESTORE VIA BRIDGE <ArrowRight className="w-6 h-6" />
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
