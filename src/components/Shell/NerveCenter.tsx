"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { MessageSquare, Share2, Radio, User } from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THE NERVE CENTER v2: PHYSICS ENGINE
// Magnetic tilt, breathing glow, spring inertia.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type VoidMode = "TALK" | "DROP" | "RADAR" | "PROFILE";

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
};

const modes: VoidMode[] = ["TALK", "DROP", "RADAR", "PROFILE"];

// 🧠 LEARNING: This is a "Magnetic Tilt" component.
// It tracks your mouse position relative to the center of the element,
// then tilts the element toward your cursor using CSS perspective + rotateX/Y.
function MagneticButton({ children, onClick, isActive, config }: any) {
    const ref = useRef<HTMLButtonElement>(null);

    // Motion values track the mouse offset from center
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Springs smooth out the raw motion values (this is the "physics")
    // Lower damping = more bouncy. Higher stiffness = more responsive.
    const springConfig = { stiffness: 350, damping: 20, mass: 0.5 };
    const rotateX = useSpring(useTransform(y, [-20, 20], [8, -8]), springConfig);
    const rotateY = useSpring(useTransform(x, [-20, 20], [-8, 8]), springConfig);
    const scale = useSpring(1, { stiffness: 500, damping: 25 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
        scale.set(1.08);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        scale.set(1);
    };

    const Icon = config.icon;

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => scale.set(0.95)}
            onMouseUp={() => scale.set(1.08)}
            style={{ rotateX, rotateY, scale, perspective: 600 }}
            className="relative flex flex-col items-center outline-none group"
        >
            {/* Shard Container with Glass */}
            <motion.div
                animate={{
                    backgroundColor: isActive ? `rgba(${config.glowRGB},0.06)` : "rgba(255,255,255,0.015)",
                    borderColor: isActive ? `rgba(${config.glowRGB},0.25)` : "rgba(255,255,255,0.04)",
                    boxShadow: isActive
                        ? `0 0 40px rgba(${config.glowRGB},0.12), 0 0 80px rgba(${config.glowRGB},0.04), inset 0 1px 0 rgba(255,255,255,0.05)`
                        : "inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-[4.2rem] h-[4.2rem] rounded-[1.3rem] border flex items-center justify-center"
                style={{
                    backdropFilter: "blur(40px) saturate(180%)",
                    WebkitBackdropFilter: "blur(40px) saturate(180%)",
                }}
            >
                <Icon
                    className="w-[1.15rem] h-[1.15rem] transition-all duration-400"
                    style={{
                        color: isActive ? config.color : "rgba(255,255,255,0.2)",
                        filter: isActive ? `drop-shadow(0 0 6px ${config.color})` : "none",
                    }}
                />
            </motion.div>

            {/* Label — slides up on active */}
            <motion.span
                animate={{
                    opacity: isActive ? 1 : 0,
                    y: isActive ? 0 : 6,
                    scale: isActive ? 1 : 0.8,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="text-[7px] font-black uppercase tracking-[0.4em] mt-2 absolute -bottom-5"
                style={{ color: isActive ? config.color : "transparent" }}
            >
                {config.label}
            </motion.span>

            {/* Active Indicator: Breathing Dot */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        layoutId="nerve-dot"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0.3, 0.8] }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -bottom-8 w-1.5 h-1.5 rounded-full"
                        style={{
                            backgroundColor: config.color,
                            boxShadow: `0 0 10px ${config.color}`,
                        }}
                        transition={{
                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                            layout: { type: "spring", stiffness: 500, damping: 30 },
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.button>
    );
}

export const NerveCenter: React.FC<NerveCenterProps> = ({
    activeMode,
    onModeChange,
}) => {
    return (
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
            </motion.div>
        </div>
    );
};
