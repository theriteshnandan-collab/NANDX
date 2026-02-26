"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowLeft, ArrowRight } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   MANIFESTO PAGE — Aurora Brutalism
   Biome: Alternating Chalk / Void sections — magazine article
══════════════════════════════════════════════════════════ */

interface SectionProps {
    children: React.ReactNode;
    dark?: boolean;
    className?: string;
}

function ManifestoSection({ children, dark = false, className = "" }: SectionProps) {
    return (
        <section className={`py-24 px-6 ${dark ? "section-void" : "section-chalk"} ${className}`}>
            <div className="max-w-3xl mx-auto">
                {children}
            </div>
        </section>
    );
}

function PullQuote({ text, dark = false }: { text: string; dark?: boolean }) {
    return (
        <motion.blockquote
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`text-[clamp(1.8rem,4vw,3rem)] font-black leading-tight tracking-tight my-12 py-8 border-l-4 pl-8 ${dark
                ? "text-white border-emerald-400"
                : "text-[#080808] border-[#080808]"
                }`}
        >
            {text}
        </motion.blockquote>
    );
}

function ManifestoParagraph({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
    return (
        <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`text-[17px] leading-[1.8] mb-8 font-medium ${dark ? "text-zinc-400" : "text-zinc-600"}`}
        >
            {children}
        </motion.p>
    );
}

function ManifestoHeading({ children, dark = false, sub = false }: { children: React.ReactNode; dark?: boolean; sub?: boolean }) {
    return (
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${sub ? "text-[1.5rem]" : "text-[2.2rem]"} font-black ${dark ? "text-white" : "text-[#080808]"} tracking-tight mb-6`}
        >
            {children}
        </motion.h2>
    );
}

export default function ManifestoPage() {
    return (
        <div className="overflow-hidden">

            {/* ── NAV ── */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.04]">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="font-black text-white text-[15px]">NANDIX</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/" className="label-mono text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3" /> Back
                    </Link>
                    <Link href="/nandix">
                        <button className="btn-verdant px-5 py-2.5 text-xs rounded-xl">
                            Enter Mesh <ArrowRight className="w-3 h-3" />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Spacer for nav */}
            <div className="h-16" />

            {/* ══ HERO ════════════════════════════════════════════ */}
            <section className="section-void pt-24 pb-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[800px] h-[400px] bg-emerald-500/4 rounded-full blur-[150px]" />
                </div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <div className="label-mono text-emerald-400 mb-6">The NANDIX Manifesto</div>
                        <h1
                            className="font-black text-white leading-tight mb-8"
                            style={{ fontSize: "clamp(3rem, 7vw, 6rem)", letterSpacing: "-0.04em" }}
                        >
                            The web was built<br />
                            <span style={{ WebkitTextStroke: "1.5px white", color: "transparent" }}>
                                to be free.
                            </span>
                        </h1>
                        <p className="text-zinc-400 text-[18px] leading-relaxed max-w-xl">
                            Somewhere along the way, we traded sovereignty for convenience.
                            NANDIX is the reclamation.
                        </p>
                        <div className="mt-12 h-px bg-white/[0.06]" />
                        <div className="flex items-center gap-3 mt-6">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-zinc-300 font-bold text-sm">The NANDIX Protocol</div>
                                <div className="label-mono text-zinc-600">Feb 2026</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ══ THE PROBLEM (Chalk) ══════════════════════════════ */}
            <ManifestoSection dark={false}>
                <div className="label-mono text-zinc-400 mb-8">Part I — The Problem</div>
                <ManifestoHeading>They built cathedrals. You paid rent.</ManifestoHeading>
                <ManifestoParagraph>
                    Social networks promised to connect humanity. What they built instead was a surveillance apparatus
                    dressed in the language of community. Your messages, your relationships, your vulnerabilities —
                    all of it became product. The feed you see was engineered to keep you scrolling, not living.
                </ManifestoParagraph>

                <PullQuote text='"Every recommendation is a manipulation. Every algorithm is a jailor."' />

                <ManifestoParagraph>
                    The server was the original sin. The moment your data touched someone else's computer,
                    you lost ownership. You became a tenant in a house you built. A user of a platform you filled.
                    And when the platform decides you violated their terms — terms written by lawyers you never negotiated with —
                    you are gone. Your history, your network, your voice: erased.
                </ManifestoParagraph>

                <ManifestoParagraph>
                    This is not an accident. This is the business model.
                </ManifestoParagraph>
            </ManifestoSection>

            {/* ══ THE ANSWER (Void) ════════════════════════════════ */}
            <ManifestoSection dark={true}>
                <div className="label-mono text-emerald-400/50 mb-8">Part II — The Answer</div>
                <ManifestoHeading dark>Sovereignty is not a feature. It is the architecture.</ManifestoHeading>
                <ManifestoParagraph dark>
                    NANDIX is not built on servers because servers are points of control.
                    It is built on the direct connection between two browsers — the WebRTC handshake that the
                    internet was designed to enable but platforms worked hard to avoid.
                </ManifestoParagraph>

                <PullQuote dark text='"Your identity is a keypair. Your data lives in your browser. Your AI runs locally."' />

                <ManifestoParagraph dark>
                    When you generate your NANDIX identity, a cryptographic keypair is created in your device's
                    WebCrypto API. Nobody else sees it. Not us. Not a registration service. The keys live on your device.
                    If you lose them, they are gone — because that is what true ownership means.
                </ManifestoParagraph>
                <ManifestoParagraph dark>
                    Your messages are sealed before they leave your device. Your posts propagate peer-to-peer
                    through the mesh. Your AI summarization runs inside your browser tab using Transformers.js —
                    not on a GPU farm controlled by a corporation that reads your data.
                </ManifestoParagraph>
            </ManifestoSection>

            {/* ══ THE MESH (Chalk) ═════════════════════════════════ */}
            <ManifestoSection dark={false}>
                <div className="label-mono text-zinc-400 mb-8">Part III — The Mesh</div>
                <ManifestoHeading>The network is the computer. You are the server.</ManifestoHeading>
                <ManifestoParagraph>
                    Every NANDIX user is a node. When you connect to a peer, you and that peer create the network.
                    Content propagates through trust — not through an algorithm that ranks based on engagement metrics
                    designed to provoke outrage.
                </ManifestoParagraph>
                <ManifestoParagraph>
                    The Trust Protocol is a cryptographic vouch chain. When a peer's content is consistently valuable to you,
                    you vouch for them. Their trust score rises on your mesh — not globally, not on our servers,
                    but within your sovereign view of the network. Your curation. Your signal.
                </ManifestoParagraph>

                <PullQuote text='"The feed you see belongs to you. The algorithm that shapes it is your own judgment."' />
            </ManifestoSection>

            {/* ══ CALL TO ACTION (Void) ════════════════════════════ */}
            <ManifestoSection dark={true}>
                <div className="label-mono text-emerald-400/50 mb-8">The Invitation</div>
                <ManifestoHeading dark>Join the mesh. Become the node.</ManifestoHeading>
                <ManifestoParagraph dark>
                    We are not asking you to trust us. We are giving you the code. Read it. Fork it.
                    Run it. The mesh exists as long as its nodes run — and those nodes are your browsers.
                </ManifestoParagraph>
                <ManifestoParagraph dark>
                    No venture capital. No exit strategy. No terms of service that can be rewritten at midnight.
                    Only the protocol, the keys, and the signal.
                </ManifestoParagraph>

                <div className="mt-12 flex flex-wrap gap-4">
                    <Link href="/nandix">
                        <button className="btn-verdant">
                            Enter the Mesh <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                    <Link href="/">
                        <button className="btn-ghost border-white/10 text-zinc-400 hover:text-white hover:border-white/20">
                            Return to Landing
                        </button>
                    </Link>
                </div>
            </ManifestoSection>

            {/* Footer */}
            <div className="section-void py-10 px-6 border-t border-white/[0.04] flex items-center justify-center">
                <span className="label-mono text-zinc-700">NANDIX Manifesto · 2026 · No Rights Reserved · Sovereign Mesh</span>
            </div>
        </div>
    );
}
