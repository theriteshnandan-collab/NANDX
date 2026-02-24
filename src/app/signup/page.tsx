"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, Copy, Check, Eye, EyeOff, Fingerprint, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { identity } from "@/lib/crypto/Identity";

/* ────────────────────────────────────────────────────────────
   🕯️ IDENTITY FORGING RITUAL
   3-Step Sovereign Onboarding
   Step 1: The Choice (New or Restore)
   Step 2: The Forge (Mnemonic Generation)
   Step 3: The Seal (Identity Card + Enter Mesh)
   ──────────────────────────────────────────────────────────── */

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

const staggerChild = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
};

type Step = "CHOICE" | "FORGING" | "SEALED";

export default function SignUpPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("CHOICE");
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [peerId, setPeerId] = useState("");
    const [copied, setCopied] = useState(false);
    const [wordsRevealed, setWordsRevealed] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [isForging, setIsForging] = useState(false);

    /* ── FORGE: Generate identity ─────────────────────── */
    const handleForge = useCallback(async () => {
        setIsForging(true);

        // Simulate entropy gathering delay for dramatic effect
        await new Promise((r) => setTimeout(r, 1800));

        const profile = await identity.generate();
        setMnemonic(profile.mnemonic.split(" "));
        setPeerId(profile.id);
        setIsForging(false);
        setStep("FORGING");
    }, []);

    /* ── COPY mnemonic ────────────────────────────────── */
    const handleCopy = () => {
        navigator.clipboard.writeText(mnemonic.join(" "));
        setCopied(true);
        toast.success("Mnemonic copied to clipboard.");
        setTimeout(() => setCopied(false), 2000);
    };

    /* ── SEAL: Enter the mesh ─────────────────────────── */
    const handleSeal = () => {
        toast.success("Identity Forged.", {
            description: `Peer ID: ${peerId.substring(0, 20)}...`,
        });
        router.push("/nandix");
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
                    animate={{ x: [0, -30, 20, 0], y: [0, 40, -30, 0] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[15%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-[140px]"
                />
                <motion.div
                    animate={{ x: [0, 30, -20, 0], y: [0, -40, 30, 0] }}
                    transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-violet-500/[0.04] blur-[140px]"
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
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    {["CHOICE", "FORGING", "SEALED"].map((s, i) => (
                        <div key={s} className="flex items-center gap-4">
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black tracking-widest transition-all duration-500 border ${step === s
                                    ? "bg-white text-black border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                    : i < ["CHOICE", "FORGING", "SEALED"].indexOf(step)
                                        ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                        : "bg-white/[0.02] text-zinc-700 border-white/[0.05]"
                                    }`}
                            >
                                {i < ["CHOICE", "FORGING", "SEALED"].indexOf(step) ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    `0${i + 1}`
                                )}
                            </div>
                            {i < 2 && (
                                <div
                                    className={`w-12 h-[1px] transition-all duration-500 ${i < ["CHOICE", "FORGING", "SEALED"].indexOf(step)
                                        ? "bg-emerald-500"
                                        : "bg-white/[0.05]"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ═══════════════════════════════════════════════════
              STEP 1: THE CHOICE
              ═══════════════════════════════════════════════════ */}
                    {step === "CHOICE" && (
                        <motion.div key="choice" {...fadeUp} className="space-y-6">
                            <div className="text-center mb-10">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                                >
                                    <Fingerprint className="w-10 h-10 text-white" />
                                </motion.div>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 text-white">
                                    Forge Your Soul
                                </h1>
                                <p className="text-zinc-500 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                                    No database. No intermediary. Your sovereign identity is forged directly in your hardware.
                                </p>
                            </div>

                            {/* New Identity */}
                            <motion.button
                                {...staggerChild}
                                onClick={handleForge}
                                disabled={isForging}
                                className="w-full p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] text-left group transition-all hover:bg-white/[0.04] hover:border-white/[0.1] hover:scale-[1.01] active:scale-[0.99] block"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-black/40 border border-emerald-500/20 group-hover:border-emerald-500/40 flex items-center justify-center text-emerald-400 transition-all shrink-0">
                                        <Sparkles className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-xl mb-1 text-white uppercase tracking-tight">Generate Identity</h3>
                                        <p className="text-sm text-zinc-500 leading-relaxed">
                                            Forge a 12-word mnemonic master key. This is your soul on the mesh.
                                        </p>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-zinc-700 group-hover:text-emerald-400 transition-all" />
                                </div>

                                {isForging && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-6 pt-6 border-t border-white/[0.03]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                                GATHERING ENTROPY ...
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.button>

                            {/* Restore Identity */}
                            <motion.div {...staggerChild}>
                                <Link
                                    href="/login"
                                    className="w-full p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] text-left group transition-all hover:bg-white/[0.04] hover:border-white/[0.1] hover:scale-[1.01] active:scale-[0.99] flex items-center gap-6"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-black/40 border-violet-500/20 group-hover:border-violet-500/40 flex items-center justify-center text-violet-400 transition-all shrink-0">
                                        <Shield className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-xl mb-1 text-white uppercase tracking-tight">Restore Soul</h3>
                                        <p className="text-sm text-zinc-500 leading-relaxed">
                                            Already forged? Enter your mnemonic to reclaim your identity.
                                        </p>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-zinc-700 group-hover:text-violet-400 transition-all" />
                                </Link>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════
              STEP 2: THE FORGE (Mnemonic Reveal)
              ═══════════════════════════════════════════════════ */}
                    {step === "FORGING" && (
                        <motion.div key="forging" {...fadeUp} className="space-y-8">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-black tracking-tighter mb-4 text-white">
                                    Master Keys
                                </h1>
                                <p className="text-zinc-500 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                                    Commit these to memory or physical medium. They are the <span className="text-white font-black underline decoration-emerald-500/50 underline-offset-4">only proof</span> of your existence on the mesh.
                                </p>
                            </div>

                            {/* Warning */}
                            <div className="flex items-start gap-4 p-6 rounded-[2rem] bg-red-500/[0.02] border border-red-500/20">
                                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-400 leading-relaxed font-semibold">
                                    <strong className="text-red-500 uppercase tracking-widest block mb-1">Critical Fault Risk:</strong>
                                    If these words are lost, your identity is extinguished forever. There is no password reset. We hold no keys.
                                </p>
                            </div>

                            {/* Mnemonic Grid */}
                            <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] p-8 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
                                {!wordsRevealed && (
                                    <div
                                        onClick={() => setWordsRevealed(true)}
                                        className="absolute inset-0 bg-black/60 backdrop-blur-xl z-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-black/40 transition-all"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                            <EyeOff className="w-8 h-8 text-zinc-500" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
                                            Click to reveal soul words
                                        </span>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-4">
                                    {mnemonic.map((word, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05, duration: 0.3 }}
                                            className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/[0.02] group-hover:border-emerald-500/[0.05] transition-all"
                                        >
                                            <span className="text-[9px] font-black text-zinc-800 w-5 text-right">
                                                {i + 1 < 10 ? `0${i + 1}` : i + 1}
                                            </span>
                                            <span className="text-sm font-mono font-black text-white">
                                                {word}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Copy Button */}
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all"
                                >
                                    {copied ? (
                                        <><Check className="w-4 h-4 text-emerald-500" /> COPIED</>
                                    ) : (
                                        <><Copy className="w-4 h-4" /> COPY SEED</>
                                    )}
                                </button>
                                <button
                                    className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all"
                                >
                                    <Sparkles className="w-4 h-4" /> PRINT BACKUP
                                </button>
                            </div>

                            {/* Confirmation */}
                            <label className="flex items-start gap-4 p-6 rounded-[2rem] bg-emerald-500/[0.01] border border-emerald-500/10 cursor-pointer group hover:bg-emerald-500/[0.02] transition-all">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={confirmed}
                                        onChange={(e) => setConfirmed(e.target.checked)}
                                        className="peer w-6 h-6 opacity-0 absolute cursor-pointer"
                                    />
                                    <div className="w-6 h-6 border-2 border-white/[0.1] rounded-lg bg-black transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-all" />
                                    </div>
                                </div>
                                <span className="text-xs text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-400 transition-colors">
                                    I have transcribed my soul keys in a non-digital environment. I accept total responsibility for my sovereign identity.
                                </span>
                            </label>

                            {/* Continue */}
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setStep("SEALED")}
                                disabled={!confirmed || !wordsRevealed}
                                className="w-full py-6 rounded-[2rem] bg-white text-black text-xl font-black hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                            >
                                SEAL IDENTITY <ArrowRight className="w-6 h-6" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════
              STEP 3: THE SEAL (Identity Card)
              ═══════════════════════════════════════════════════ */}
                    {step === "SEALED" && (
                        <motion.div key="sealed" {...fadeUp} className="space-y-10">
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                                >
                                    <Check className="w-12 h-12 text-emerald-400" />
                                </motion.div>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 text-white">
                                    Forge Complete.
                                </h1>
                                <p className="text-zinc-500 font-medium text-sm">
                                    You are now a verified sovereign node.
                                </p>
                            </div>

                            {/* Identity Card */}
                            <div className="rounded-[3rem] bg-zinc-950 border border-white/[0.05] p-10 text-center relative overflow-hidden shadow-2xl group">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 opacity-50" />

                                {/* Ambient glow */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-700" />

                                {/* Identicon placeholder */}
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-cyan-500 mx-auto mb-10 flex items-center justify-center shadow-[0_15px_40px_rgba(16,185,129,0.2)]">
                                    <Fingerprint className="w-12 h-12 text-white" />
                                </div>

                                <div className="mb-10 text-center">
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3 block">
                                        SOVEREIGN PEER HASH
                                    </span>
                                    <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.03] font-mono text-[11px] font-black text-white/70 break-all leading-relaxed">
                                        {peerId}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/[0.03]">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-white">12</div>
                                        <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">Keys</div>
                                    </div>
                                    <div className="w-[1px] h-10 bg-white/[0.03] mx-auto" />
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-emerald-500 italic">256</div>
                                        <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">Bit AES</div>
                                    </div>
                                    <div className="w-[1px] h-10 bg-white/[0.03] mx-auto" />
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-white">ED</div>
                                        <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">25519</div>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSeal}
                                className="w-full py-7 rounded-[2.5rem] bg-white text-black text-2xl font-black hover:scale-[1.02] transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)] flex items-center justify-center gap-4"
                            >
                                ENTER THE MESH <ArrowRight className="w-7 h-7" />
                            </motion.button>

                            <p className="text-center text-[10px] font-black text-zinc-700 uppercase tracking-widest">
                                LOCAL KERNEL ACTIVE • NO CLOUD DETECTION
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
