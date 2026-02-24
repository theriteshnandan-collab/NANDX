"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Zap, Eye, Lock, Terminal } from "lucide-react";

export default function ManifestoPage() {
    const tenets = [
        {
            icon: <Lock />,
            title: "ZERO TRACKING",
            desc: "IP addresses are shards. Identities are keys. Your movement through the mesh leaves no shadow on any central server."
        },
        {
            icon: <Terminal />,
            title: "LOCAL INTELLIGENCE",
            desc: "We don't send your data to a cloud brain. We send the models to you. Compute happens at the edge of the soul."
        },
        {
            icon: <Eye />,
            title: "RADICAL TRANSPARENCY",
            desc: "The protocol is the truth. Every packet is signed, every chunk is verified. Open source isn't an option, it is the law."
        }
    ];

    return (
        <div className="min-h-screen bg-[#050508] text-zinc-300 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden relative">
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

            {/* 🧭 Navigation */}
            <nav className="relative z-50 h-[100px] flex items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto backdrop-blur-md border-b border-white/[0.03]">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:scale-110 group-hover:border-emerald-500/30 transition-all duration-500">
                        <Shield className="w-6 h-6 text-emerald-400 opacity-80" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tighter uppercase text-white">NANDIX.</span>
                </Link>
                <Link href="/signup" className="px-8 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    Initialize
                </Link>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-40">
                {/* 📜 The Header */}
                <header className="mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h1 className="text-6xl md:text-[140px] font-black tracking-tighter leading-[0.8] mb-12 text-white">
                            SOVEREIGN <br />
                            <span className="text-white opacity-10">MANIFESTO.</span>
                        </h1>
                        <p className="text-2xl md:text-3xl text-zinc-400 font-bold leading-tight max-w-2xl bg-gradient-to-br from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
                            We are building communication for a world that has forgotten what privacy costs.
                        </p>
                    </motion.div>
                </header>

                {/* ⚔️ The Content */}
                <div className="space-y-32">
                    <section className="space-y-8">
                        <div className="h-1 w-20 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
                        <h2 className="text-4xl font-black tracking-tight uppercase text-white">01. The End of Hosts</h2>
                        <div className="text-xl font-medium text-zinc-500 leading-relaxed space-y-6">
                            <p>
                                The era of the "Host" is over. For too long, we have traded our secrets for convenience,
                                letting central servers act as the silent arbiters of our conversations.
                                <strong className="text-white"> Nandix kills the middleman.</strong>
                            </p>
                            <p>
                                By utilizing a symmetric peer-to-peer mesh, your messages never touch a disk you don't own.
                                We don't host your data because we don't believe in digital landlords.
                            </p>
                        </div>
                    </section>

                    {/* 🧱 Physics Representation */}
                    <section className="flex justify-center py-20 relative">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="relative w-80 h-80 bg-white/[0.02] rounded-[4rem] border border-white/[0.05] flex items-center justify-center p-8 overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-violet-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <Zap className="w-24 h-24 text-emerald-500/10 absolute -top-4 -right-4 rotate-12" />
                            <div className="w-full h-full rounded-[3rem] bg-black/40 border border-white/[0.02] shadow-2xl flex items-center justify-center relative z-10">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.1, 0.2, 0.1],
                                        rotate: [0, 90, 180, 270, 360]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="w-[120%] h-[120%] bg-emerald-500/20 rounded-full blur-[80px]"
                                />
                                <Lock className="w-20 h-20 text-white opacity-20" />
                            </div>
                        </motion.div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {tenets.map((tenet, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-emerald-500/20 flex items-center justify-center mb-8 text-emerald-400 group-hover:scale-110 transition-transform">
                                    {React.cloneElement(tenet.icon as React.ReactElement, { className: "w-7 h-7" })}
                                </div>
                                <h3 className="text-lg font-black tracking-widest mb-4 uppercase text-white">{tenet.title}</h3>
                                <p className="text-sm text-zinc-500 font-medium leading-relaxed">{tenet.desc}</p>
                            </motion.div>
                        ))}
                    </section>

                    <section className="text-center pt-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                        >
                            <h2 className="text-5xl font-black tracking-tighter mb-12 text-white">CLAIM YOUR SOVEREIGNTY.</h2>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link
                                    href="/signup"
                                    className="px-12 py-6 rounded-[2rem] bg-emerald-500 text-white text-base uppercase font-black tracking-widest shadow-[0_20px_50px_-10px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all"
                                >
                                    Forge Identity
                                </Link>
                                <Link
                                    href="/"
                                    className="px-12 py-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] text-white text-base uppercase font-black tracking-widest flex items-center justify-center gap-2 hover:bg-white/[0.05] transition-all"
                                >
                                    Back to Mesh <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </motion.div>
                    </section>
                </div>
            </main>

            {/* 🧭 Minimal Footer */}
            <footer className="relative z-50 py-20 px-6 max-w-7xl mx-auto border-t border-white/[0.03]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
                        Nandix Protocol // Manifesto revision 1.0.0
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
                        No Copyright. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
