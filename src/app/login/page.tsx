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
        <div className="min-h-screen bg-[#FAFBFE] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="blob-lavender w-[500px] h-[500px] -top-40 -left-40 fixed" />
            <div className="blob-mint w-[400px] h-[400px] bottom-0 -right-40 fixed" />

            {/* Back to landing */}
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors z-20"
            >
                <Shield className="w-4 h-4" /> NANDIX
            </Link>

            <div className="w-full max-w-lg relative z-10">
                <AnimatePresence mode="wait">
                    {/* ═══════════════════════════════════════════════════
              THE CHOICE
              ═══════════════════════════════════════════════════ */}
                    {mode === "CHOICE" && (
                        <motion.div key="choice" {...fadeUp} className="space-y-6">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-[#0F0F1A] flex items-center justify-center mx-auto mb-6">
                                    <Key className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-black tracking-tight mb-3">
                                    Restore Your Soul
                                </h1>
                                <p className="text-slate-500 text-base max-w-sm mx-auto">
                                    Choose how you want to recover your sovereign identity.
                                </p>
                            </div>

                            {/* Mnemonic Recovery */}
                            <button
                                onClick={() => setMode("MNEMONIC")}
                                className="w-full card-elevated p-6 text-left group cursor-pointer flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors shrink-0">
                                    <Key className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1">12 Magic Words</h3>
                                    <p className="text-sm text-slate-400">
                                        Enter the mnemonic seed phrase you saved during identity forging.
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                            </button>

                            {/* Bridge Recovery */}
                            <button
                                onClick={() => setMode("BRIDGE")}
                                className="w-full card-elevated p-6 text-left group cursor-pointer flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center text-violet-600 transition-colors shrink-0">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1">Sovereign Bridge</h3>
                                    <p className="text-sm text-slate-400">
                                        Recover using a linked phone number or email address.
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                            </button>

                            {/* New Identity */}
                            <div className="text-center pt-4 border-t border-slate-100">
                                <p className="text-sm text-slate-400">
                                    New to the mesh?{" "}
                                    <Link href="/signup" className="font-bold text-[#0F0F1A] hover:underline">
                                        Forge a New Identity
                                    </Link>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════
              MNEMONIC ENTRY
              ═══════════════════════════════════════════════════ */}
                    {mode === "MNEMONIC" && (
                        <motion.div key="mnemonic" {...fadeUp} className="space-y-6">
                            <button
                                onClick={() => setMode("CHOICE")}
                                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>

                            <div className="text-center mb-6">
                                <h1 className="text-3xl font-black tracking-tight mb-3">
                                    Enter Your 12 Words
                                </h1>
                                <p className="text-slate-500 text-base max-w-sm mx-auto">
                                    Type each word in order exactly as you wrote them down.
                                </p>
                            </div>

                            {/* Word Grid */}
                            <div className="card-elevated p-6">
                                <div className="grid grid-cols-3 gap-3">
                                    {words.map((word, i) => (
                                        <div key={i} className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">
                                                {i + 1}.
                                            </span>
                                            <input
                                                type="text"
                                                value={word}
                                                onChange={(e) => updateWord(i, e.target.value)}
                                                className="w-full pl-8 pr-3 py-3 text-sm font-mono font-bold bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all"
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
                                className="w-full btn-primary !py-4 text-base font-bold rounded-2xl flex items-center justify-center gap-2"
                            >
                                Restore Identity <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ═══════════════════════════════════════════════════
              SOVEREIGN BRIDGE
              ═══════════════════════════════════════════════════ */}
                    {mode === "BRIDGE" && (
                        <motion.div key="bridge" {...fadeUp} className="space-y-6">
                            <button
                                onClick={() => setMode("CHOICE")}
                                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>

                            <div className="text-center mb-6">
                                <h1 className="text-3xl font-black tracking-tight mb-3">
                                    Sovereign Bridge
                                </h1>
                                <p className="text-slate-500 text-base max-w-sm mx-auto">
                                    We&apos;ll use a blinded relay to find your identity. Your contact is never stored.
                                </p>
                            </div>

                            {/* Bridge Type Toggle */}
                            <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100">
                                <button
                                    onClick={() => setBridgeType("EMAIL")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${bridgeType === "EMAIL"
                                            ? "bg-white shadow-sm text-[#0F0F1A]"
                                            : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    <Mail className="w-4 h-4" /> Email
                                </button>
                                <button
                                    onClick={() => setBridgeType("PHONE")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${bridgeType === "PHONE"
                                            ? "bg-white shadow-sm text-[#0F0F1A]"
                                            : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    <Smartphone className="w-4 h-4" /> Phone
                                </button>
                            </div>

                            {/* Bridge Input */}
                            <div className="card-elevated p-6">
                                <input
                                    type={bridgeType === "EMAIL" ? "email" : "tel"}
                                    value={bridgeValue}
                                    onChange={(e) => setBridgeValue(e.target.value)}
                                    placeholder={
                                        bridgeType === "EMAIL"
                                            ? "sovereign@nandix.xyz"
                                            : "+1 (555) 000-0000"
                                    }
                                    className="w-full px-4 py-4 text-base font-medium bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all"
                                />
                                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                                    Your {bridgeType.toLowerCase()} is hashed locally and compared against the blinded relay. It is never stored on-chain or off-chain.
                                </p>
                            </div>

                            {/* Restore Button */}
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleBridgeRecover}
                                disabled={isRestoring || !bridgeValue.trim()}
                                className="w-full btn-primary !py-4 text-base font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {isRestoring ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Searching Relay...
                                    </>
                                ) : (
                                    <>
                                        Restore via Bridge <ArrowRight className="w-5 h-5" />
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
