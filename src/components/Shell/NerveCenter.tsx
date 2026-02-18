"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { MessageSquare, Share2, Radio, User, Zap, Cpu, Laptop, Smartphone } from "lucide-react";
import { GhostTerminal } from "../Ghost/GhostTerminal";
import { GhostRemote } from "../AI/GhostRemote";
import { ghostEngine } from "@/lib/ghost/GhostEngineCPU";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THE NERVE CENTER v2: PHYSICS ENGINE
// Magnetic tilt, breathing glow, spring inertia.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type VoidMode = "TALK" | "DROP" | "RADAR" | "PROFILE" | "GHOST" | "REMOTE";

interface NerveCenterProps {
    activeMode: VoidMode;
    onModeChange: (mode: VoidMode) => void;
}

const modeConfig = {
    TALK: {
        icon: MessageSquare,
        label: "Talk",
        color: "#22C55E",
        glowRGB: "34,197,94",
    },
    DROP: {
        icon: Share2,
        label: "Drop",
        color: "#22D3EE",
        glowRGB: "34,211,238",
    },
    RADAR: {
        icon: Radio,
        label: "Radar",
        color: "#F43F5E",
        glowRGB: "244,63,94",
    },
    PROFILE: {
        icon: User,
        label: "Sense",
        color: "#A855F7",
        glowRGB: "168,85,247",
    },
    GHOST: {
        icon: ({ className, style }: any) => <span className={className} style={{ ...style, fontSize: '1.2rem' }}>👻</span>,
        label: "Ghost",
        color: "#10B981",
        glowRGB: "16,185,129",
    },
    REMOTE: {
        icon: ({ className, style }: any) => <span className={className} style={{ ...style, fontSize: '1.2rem' }}>🪄</span>,
        label: "Sceptre",
        color: "#A855F7",
        glowRGB: "168,85,247",
    }
};

const modes: VoidMode[] = ["TALK", "DROP", "RADAR", "PROFILE", "GHOST", "REMOTE"];

const MagneticButton = ({ onClick, isActive, config }: { onClick: () => void, isActive: boolean, config: any }) => {
    const ref = React.useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = 15; // Magnetic pull strength

        x.set((e.clientX - centerX) / distance);
        y.set((e.clientY - centerY) / distance);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const Icon = config.icon;

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
        >
            {/* Active Indicator Dot */}
            {isActive && (
                <motion.div
                    layoutId="active-dot"
                    className="absolute -top-1 w-1 h-1 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                />
            )}

            {/* Icon with Glow */}
            <div className="relative z-10">
                <Icon
                    className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'
                        }`}
                    style={{
                        color: isActive ? config.color : "#71717a",
                        filter: isActive ? `drop-shadow(0 0 8px rgba(${config.glowRGB}, 0.5))` : "none"
                    }}
                />
            </div>

            {/* Label Tooltip */}
            <AnimatePresence>
                {isActive && (
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute -top-8 px-2 py-1 rounded-md bg-zinc-900 border border-white/10 text-[10px] font-medium text-white whitespace-nowrap pointer-events-none"
                    >
                        {config.label}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Hover Glint */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 group-hover:ring-white/10 transition-all duration-300" />
        </motion.button>
    );
};

export const NerveCenter: React.FC<NerveCenterProps> = ({
    activeMode,
    onModeChange,
}) => {
    // Lazy load GhostTerminal to avoid heavy bundle impact initially?
    // For now direct import is fine as it's a client component.
    const [showGhost, setShowGhost] = React.useState(false);
    const [showRemote, setShowRemote] = React.useState(false);

    React.useEffect(() => {
        if (activeMode === "GHOST") {
            setShowGhost(true);
            setShowRemote(false);
            // On Laptop, enable Mesh Control so Phone can find us
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
                <GhostTerminal onClose={() => {
                    setShowGhost(false);
                    onModeChange("TALK");
                }} />
            )}

            {showRemote && (
                <GhostRemote onClose={() => {
                    setShowRemote(false);
                    onModeChange("TALK");
                }} />
            )}

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <motion.div
                    className="relative flex items-center gap-2 px-3 py-3 rounded-[1.8rem] bg-zinc-950/60 backdrop-blur-3xl border border-white/[0.04]"
                    initial={{ y: 80, opacity: 0, scale: 0.7 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 250, damping: 20, delay: 0.3 }}
                    style={{
                        boxShadow: "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
                    }}
                >
                    {modes.map((mode) => {
                        const config = modeConfig[mode];
                        const isActive = mode === activeMode;

                        return (
                            <MagneticButton
                                key={mode}
                                onClick={() => onModeChange(mode)}
                                isActive={isActive}
                                config={config}
                            />
                        );
                    })}

                    {/* Separator Lines */}
                    <div className="absolute left-[4.8rem] top-1/2 -translate-y-1/2 w-px h-7 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
                    <div className="absolute left-[9.6rem] top-1/2 -translate-y-1/2 w-px h-7 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
                    <div className="absolute right-[4.8rem] top-1/2 -translate-y-1/2 w-px h-7 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
                    {/* Added separation for Ghost? No, let flex gap handle it for now, can polish later */}
                </motion.div>
            </div>
        </>
    );
};
