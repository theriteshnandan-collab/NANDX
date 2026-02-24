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
        <div className="min-h-screen bg-[#FAFBFE] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="blob-mint w-[500px] h-[500px] -top-40 -right-40 fixed" />
            <div className="blob-lavender w-[400px] h-[400px] bottom-0 -left-40 fixed" />

            {/* Back to landing */}
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors z-20"
            >
                <Shield className="w-4 h-4" /> NANDIX
            </Link>

            <div className="w-full max-w-lg relative z-10">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {["CHOICE", "FORGING", "SEALED"].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step === s
                                        ? "bg-[#0F0F1A] text-white scale-110"
                                        : i < ["CHOICE", "FORGING", "SEALED"].indexOf(step)
                                            ? "bg-emerald-500 text-white"
                                            : "bg-slate-100 text-slate-400"
                                    }`}
                            >
                                {i < ["CHOICE", "FORGING", "SEALED"].indexOf(step) ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    i + 1
                                )}
                            </div>
                            {i < 2 && (
                                <div
                                    className={`w-12 h-0.5 rounded-full transition-all duration-500 ${i < ["CHOICE", "FORGING", "SEALED"].indexOf(step)
                                            ? "bg-emerald-500"
                                            : "bg-slate-200"
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
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-[#0F0F1A] flex items-center justify-center mx-auto mb-6">
                                    <Fingerprint className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-black tracking-tight mb-3">
                                    Forge Your Identity
                                </h1>
                                <p className="text-slate-500 text-base max-w-sm mx-auto">
                                    No email. No phone. Your sovereign identity is generated
                                    entirely on your device.
                                </p>
                            </div>

                            {/* New Identity */}
                            <motion.button
                                {...staggerChild}
                                onClick={handleForge}
                                disabled={isForging}
                                className="w-full card-elevated p-6 text-left group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors shrink-0">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">Create New Identity</h3>
                                        <p className="text-sm text-slate-400">
                                            Generate a 12-word mnemonic seed. This is your key to the mesh.
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                                </div>

                                {isForging && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-4 pt-4 border-t border-slate-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-sm font-medium text-emerald-600">
                                                Gathering entropy...
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.button>

                            {/* Restore Identity */}
                            <motion.div {...staggerChild}>
                                <Link
                                    href="/login"
                                    className="w-full card-elevated p-6 text-left group cursor-pointer flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center text-violet-600 transition-colors shrink-0">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">Restore Existing Soul</h3>
                                        <p className="text-sm text-slate-400">
                                            Enter your 12 magic words to recover your identity.
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                                </Link>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════
              STEP 2: THE FORGE (Mnemonic Reveal)
              ═══════════════════════════════════════════════════ */}
                    {step === "FORGING" && (
                        <motion.div key="forging" {...fadeUp} className="space-y-6">
                            <div className="text-center mb-6">
                                <h1 className="text-3xl font-black tracking-tight mb-3">
                                    Your 12 Magic Words
                                </h1>
                                <p className="text-slate-500 text-base max-w-sm mx-auto">
                                    Write these down and store them safely. They are the <strong className="text-[#0F0F1A]">only way</strong> to recover your identity.
                                </p>
                            </div>

                            {/* Warning */}
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200/60">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 leading-relaxed">
                                    <strong>Critical:</strong> If you lose these words, you lose access to your identity forever. We cannot recover them for you.
                                </p>
                            </div>

                            {/* Mnemonic Grid */}
                            <div className="card-elevated p-6 relative">
                                {!wordsRevealed && (
                                    <div
                                        onClick={() => setWordsRevealed(true)}
                                        className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl z-10 flex flex-col items-center justify-center gap-3 cursor-pointer"
                                    >
                                        <EyeOff className="w-8 h-8 text-slate-400" />
                                        <span className="text-sm font-semibold text-slate-500">
                                            Click to reveal your words
                                        </span>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-3">
                                    {mnemonic.map((word, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05, duration: 0.3 }}
                                            className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100"
                                        >
                                            <span className="text-xs font-bold text-slate-300 w-5 text-right">
                                                {i + 1}.
                                            </span>
                                            <span className="text-sm font-mono font-bold text-[#0F0F1A]">
                                                {word}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-600 transition-colors"
                            >
                                {copied ? (
                                    <><Check className="w-4 h-4 text-emerald-500" /> Copied!</>
                                ) : (
                                    <><Copy className="w-4 h-4" /> Copy to Clipboard</>
                                )}
                            </button>

                            {/* Confirmation */}
                            <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={confirmed}
                                    onChange={(e) => setConfirmed(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-emerald-500 mt-0.5 accent-emerald-500"
                                />
                                <span className="text-sm text-slate-600 leading-relaxed">
                                    I have written down my 12 words in a safe place. I understand that losing them means losing my identity forever.
                                </span>
                            </label>

                            {/* Continue */}
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setStep("SEALED")}
                                disabled={!confirmed || !wordsRevealed}
                                className="w-full btn-primary !py-4 text-base font-bold rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Seal My Identity <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════
              STEP 3: THE SEAL (Identity Card)
              ═══════════════════════════════════════════════════ */}
                    {step === "SEALED" && (
                        <motion.div key="sealed" {...fadeUp} className="space-y-8">
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
                                >
                                    <Check className="w-10 h-10 text-emerald-600" />
                                </motion.div>
                                <h1 className="text-3xl font-black tracking-tight mb-3">
                                    Identity Forged.
                                </h1>
                                <p className="text-slate-500 text-base">
                                    You are now a sovereign node on the mesh.
                                </p>
                            </div>

                            {/* Identity Card */}
                            <div className="card-elevated p-8 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400" />

                                {/* Identicon placeholder */}
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 mx-auto mb-6 flex items-center justify-center shadow-lg">
                                    <Fingerprint className="w-10 h-10 text-white" />
                                </div>

                                <div className="mb-4">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Sovereign Peer ID
                                    </span>
                                    <p className="font-mono text-sm font-bold text-[#0F0F1A] mt-1 break-all">
                                        {peerId}
                                    </p>
                                </div>

                                <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100">
                                    <div className="text-center">
                                        <div className="text-xl font-black text-emerald-600">12</div>
                                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Words</div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-100" />
                                    <div className="text-center">
                                        <div className="text-xl font-black text-emerald-600">256</div>
                                        <div className="text-[10px] text-slate-400 font-semibold uppercase">bit AES</div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-100" />
                                    <div className="text-center">
                                        <div className="text-xl font-black text-emerald-600">ED25519</div>
                                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Signing</div>
                                    </div>
                                </div>
                            </div>

                            {/* Enter Mesh */}
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSeal}
                                className="w-full btn-primary !py-5 text-lg font-bold rounded-2xl flex items-center justify-center gap-3"
                            >
                                Enter the Mesh <ArrowRight className="w-5 h-5" />
                            </motion.button>

                            <p className="text-center text-xs text-slate-400">
                                Your identity lives on this device. No servers involved.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
