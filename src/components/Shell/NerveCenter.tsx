"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe, MessageSquare, Share2, Radio, User,
    Ghost, Zap, Cpu
} from "lucide-react";
import { GhostTerminal } from "../Ghost/GhostTerminal";
import { GhostRemote } from "../AI/GhostRemote";
import { ghostEngine } from "@/lib/ghost/GhostEngineCPU";

/* ══════════════════════════════════════════════════════════════
   NERVE CENTER — Billion Dollar Sidebar
   64px fixed left. Teal active indicator. Clean icons.
══════════════════════════════════════════════════════════════ */

export type VoidMode = "FEED" | "TALK" | "DROP" | "RADAR" | "PROFILE" | "GHOST" | "REMOTE";

interface NerveCenterProps {
    activeMode: VoidMode;
    onModeChange: (mode: VoidMode) => void;
}

const modeConfig: Record<VoidMode, { icon: any; label: string; shortcut: string }> = {
    FEED: { icon: Globe, label: "Signal", shortcut: "S" },
    TALK: { icon: MessageSquare, label: "Talk", shortcut: "T" },
    DROP: { icon: Share2, label: "Drop", shortcut: "D" },
    RADAR: { icon: Radio, label: "Radar", shortcut: "R" },
    PROFILE: { icon: User, label: "Sense", shortcut: "P" },
    GHOST: { icon: Ghost, label: "Ghost", shortcut: "G" },
    REMOTE: { icon: Cpu, label: "Sceptre", shortcut: "E" },
};

const modes: VoidMode[] = ["FEED", "TALK", "DROP", "RADAR", "PROFILE", "GHOST", "REMOTE"];

/* ── Tooltip ── */
function Tooltip({ label, shortcut }: { label: string; shortcut: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none
                       flex items-center gap-2.5 px-3 py-2 rounded-lg whitespace-nowrap"
            style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--bg-border)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
        >
            <span className="text-slate-900 text-[12px] font-bold tracking-tight">{label}</span>
            <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-black/[0.03]"
                style={{ background: "rgba(0,0,0,0.02)", color: "var(--text-muted)" }}>
                {shortcut}
            </kbd>
        </motion.div>
    );
}

/* ── Nav Item ── */
function NavMode({ mode, isActive, onClick }: { mode: VoidMode; isActive: boolean; onClick: () => void }) {
    const [hovered, setHovered] = useState(false);
    const cfg = modeConfig[mode];
    const Icon = cfg.icon;

    return (
        <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            {/* Teal left-border active indicator */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                        style={{ height: 20, background: "var(--teal)", boxShadow: "0 0 10px rgba(0,217,165,0.5)" }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{ scaleY: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
            </AnimatePresence>

            <motion.button
                onClick={onClick}
                whileTap={{ scale: 0.93 }}
                className="relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 outline-none group"
                style={{
                    background: isActive ? "var(--teal-glow)" : hovered ? "rgba(37, 99, 235, 0.04)" : "transparent",
                    border: isActive ? "1px solid var(--teal-border)" : "1px solid transparent",
                    color: isActive ? "var(--teal)" : hovered ? "var(--text-primary)" : "var(--text-secondary)",
                    boxShadow: isActive ? "0 4px 20px rgba(0, 217, 165, 0.15)" : "none",
                }}
            >
                <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={isActive ? 2 : 1.75} />
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
                {hovered && (
                    <div className="hidden md:block">
                        <Tooltip label={cfg.label} shortcut={cfg.shortcut} />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ══ NERVE CENTER COMPONENT ══════════════════════════════════ */
export const NerveCenter: React.FC<NerveCenterProps> = ({ activeMode, onModeChange }) => {
    const [showGhost, setShowGhost] = React.useState(false);
    const [showRemote, setShowRemote] = React.useState(false);

    React.useEffect(() => {
        if (activeMode === "GHOST") {
            setShowGhost(true);
            setShowRemote(false);
            ghostEngine.enableMeshControl();
            ghostEngine.initialize();
        } else if (activeMode === "REMOTE") {
            setShowRemote(true);
            setShowGhost(false);
        } else {
            setShowGhost(false);
            setShowRemote(false);
        }
    }, [activeMode]);

    return (
        <>
            {showGhost && (
                <GhostTerminal onClose={() => { setShowGhost(false); onModeChange("TALK"); }} />
            )}
            {showRemote && (
                <GhostRemote onClose={() => { setShowRemote(false); onModeChange("TALK"); }} />
            )}

            {/* ── Sidebar (Floating Glass Rail on Desktop, Bottom Rail on Mobile) ── */}
            <motion.aside
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
                className="fixed left-0 right-0 bottom-0 md:bottom-4 md:left-4 md:top-4 z-40 
                           flex md:flex-col items-center justify-center md:justify-start py-3 md:py-6 select-none 
                           bg-white/40 backdrop-blur-3xl border-t md:border border-black/5 
                           md:rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] md:w-[72px]"
            >
                {/* Logo (Hidden on mobile) */}
                <div className="hidden md:flex mb-8 items-center justify-center w-12 h-12 rounded-2xl bg-white border border-black/5 shadow-[0_4px_15px_rgba(37,99,235,0.1)] transition-all hover:scale-105 hover:border-blue-500/30">
                    <Zap className="w-5 h-5 text-blue-600" />
                </div>

                <div className="hidden md:block w-full px-2 mb-4" style={{ height: 1, background: "var(--bg-border)" }} />

                {/* Mode icons */}
                <nav className="flex md:flex-col items-center gap-2 md:gap-2 px-2 md:pl-3 w-full">
                    {modes.map(mode => (
                        <NavMode
                            key={mode}
                            mode={mode}
                            isActive={activeMode === mode}
                            onClick={() => onModeChange(mode)}
                        />
                    ))}
                </nav>

                {/* Bottom: connection dot (Hidden on mobile) */}
                <div className="hidden md:flex mt-auto flex-col items-center gap-2 pb-2">
                    <div className="w-full px-2 mb-2" style={{ height: 1, background: "var(--bg-border)" }} />
                    <div className="flex flex-col items-center gap-1">
                        <div className="status-online" />
                    </div>
                </div>
            </motion.aside>
        </>
    );
};
