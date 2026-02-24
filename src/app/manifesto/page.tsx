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
        <div className="min-h-screen bg-[#F3F4F7] text-tactile-text selection:bg-tactile-sage/30 overflow-x-hidden">
            {/* 💡 Ambient Light Source */}
            <div className="fixed inset-0 bg-gradient-to-br from-white/60 via-transparent to-slate-200/20 pointer-events-none z-0" />

            {/* 🧭 Navigation */}
            <nav className="relative z-50 h-20 flex items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-convex flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6 text-tactile-text opacity-80" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tighter uppercase">NANDIX.</span>
                </Link>
                <Link href="/signup" className="btn-tactile px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-white">
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
                        <h1 className="text-6xl md:text-[140px] font-black tracking-tighter leading-[0.8] mb-12">
                            SOVEREIGN <br />
                            <span className="text-tactile-leaf/20">MANIFESTO.</span>
                        </h1>
                        <p className="text-2xl md:text-3xl text-tactile-leaf font-bold leading-tight max-w-2xl">
                            We are building communication for a world that has forgotten what privacy costs.
                        </p>
                    </motion.div>
                </header>

                {/* ⚔️ The Content */}
                <div className="space-y-32">
                    <section className="space-y-8">
                        <div className="h-1 w-20 bg-tactile-sage shadow-[0_0_10px_rgba(212,225,149,0.5)]" />
                        <h2 className="text-4xl font-black tracking-tight uppercase">01. The End of Hosts</h2>
                        <div className="prose prose-xl font-medium text-tactile-leaf/80 leading-relaxed">
                            <p>
                                The era of the "Host" is over. For too long, we have traded our secrets for convenience,
                                letting central servers act as the silent arbiters of our conversations.
                                <strong> Nandix kills the middleman.</strong>
                            </p>
                            <p className="mt-6">
                                By utilizing a symmetric peer-to-peer mesh, your messages never touch a disk you don't own.
                                We don't host your data because we don't believe in digital landlords.
                            </p>
                        </div>
                    </section>

                    {/* 🧱 Physics Representation */}
                    <section className="flex justify-center py-20">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="relative w-64 h-64 bg-[#F3F4F7] rounded-[48px] shadow-levitate flex items-center justify-center border border-white/80"
                        >
                            <Zap className="w-20 h-20 text-tactile-sage opacity-20 absolute" />
                            <div className="w-48 h-48 rounded-[32px] bg-[#F3F4F7] shadow-concave flex items-center justify-center">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="w-full h-full bg-tactile-sage/10 rounded-full blur-[60px]"
                                />
                                <Lock className="w-16 h-16 text-tactile-text opacity-40 absolute" />
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
                                className="bg-[#F3F4F7] p-8 rounded-[32px] shadow-levitate border border-white/50"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white shadow-convex flex items-center justify-center mb-6 text-tactile-leaf">
                                    {tenet.icon}
                                </div>
                                <h3 className="text-lg font-black tracking-widest mb-4 uppercase">{tenet.title}</h3>
                                <p className="text-sm text-tactile-leaf font-medium leading-relaxed">{tenet.desc}</p>
                            </motion.div>
                        ))}
                    </section>

                    <section className="text-center pt-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                        >
                            <h2 className="text-5xl font-black tracking-tighter mb-12">CLAIM YOUR SOVEREIGNTY.</h2>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link href="/signup" className="btn-tactile px-12 py-6 bg-tactile-sage text-base uppercase font-black tracking-widest shadow-[0_20px_40px_-10px_rgba(212,225,149,0.5)]">
                                    Forge Identity
                                </Link>
                                <Link href="/" className="btn-tactile px-12 py-6 bg-white text-base uppercase font-black tracking-widest flex items-center justify-center gap-2">
                                    Back to Mesh <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </motion.div>
                    </section>
                </div>
            </main>

            {/* 🧭 Minimal Footer */}
            <footer className="relative z-50 py-20 px-6 max-w-7xl mx-auto border-t border-gray-200/50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-tactile-leaf">
                        Nandix Protocol // Manifesto revision 1.0.0
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-tactile-leaf">
                        No Copyright. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
