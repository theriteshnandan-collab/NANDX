"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, ArrowLeft } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   404 PAGE — Aurora Brutalism
   Biome: Void + Plasma Glitch
══════════════════════════════════════════════════════════ */

export default function NotFound() {
    return (
        <div className="section-void min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">

            {/* Ambient plasma glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/6 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Background 404 text */}
            <div
                className="absolute select-none pointer-events-none"
                style={{
                    fontSize: "clamp(12rem, 35vw, 28rem)",
                    fontWeight: 900,
                    lineHeight: 1,
                    color: "rgba(255,255,255,0.02)",
                    letterSpacing: "-0.05em",
                    userSelect: "none",
                }}
            >
                404
            </div>

            {/* Glitch 404 display */}
            <div className="relative z-10 text-center">
                <div className="relative inline-block mb-8">
                    <motion.div
                        animate={{
                            x: [0, -4, 2, -1, 0],
                            opacity: [1, 0.8, 1, 0.9, 1],
                        }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
                        className="text-[clamp(5rem,15vw,10rem)] font-black font-mono text-white leading-none tracking-tight"
                        style={{ textShadow: "2px 0 rgba(168,85,247,0.6), -2px 0 rgba(244,63,94,0.6)" }}
                    >
                        404
                    </motion.div>
                    {/* Glitch overlay */}
                    <motion.div
                        animate={{
                            clipPath: [
                                "inset(0 0 100% 0)",
                                "inset(20% 0 60% 0)",
                                "inset(50% 0 30% 0)",
                                "inset(0 0 100% 0)",
                            ],
                            x: [0, 6, -4, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
                        className="absolute inset-0 text-[clamp(5rem,15vw,10rem)] font-black font-mono leading-none tracking-tight text-violet-400"
                    >
                        404
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="label-mono text-violet-400 mb-4">Signal Lost</div>
                    <h1 className="text-[1.5rem] font-black text-white mb-3 tracking-tight">
                        You've drifted off the mesh.
                    </h1>
                    <p className="text-zinc-600 text-sm max-w-xs mx-auto mb-10 leading-relaxed">
                        This node doesn't exist on our P2P network. Or maybe it did once, but left the mesh.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/">
                            <button className="btn-verdant px-6 py-3.5 rounded-2xl text-sm">
                                <ArrowLeft className="w-4 h-4" /> Return to Base
                            </button>
                        </Link>
                        <Link href="/nandix">
                            <button className="btn-ghost px-6 py-3.5 rounded-2xl text-sm border-white/10 text-zinc-400 hover:text-white">
                                Enter Mesh <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>

                    {/* Drift signal */}
                    <div className="mt-16 flex items-center gap-2 justify-center opacity-30">
                        <Zap className="w-3 h-3 text-zinc-600" />
                        <span className="label-mono text-zinc-700">P2P · Sovereign · No Central Authority</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
