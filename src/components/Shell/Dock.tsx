"use client";

import React from "react";
import { MessageSquare, Folder, Radio, Shield } from "lucide-react";
import { motion } from "framer-motion";

export type OSMode = "TALK" | "DROP" | "RADAR";

interface DockProps {
    activeMode: OSMode;
    onModeChange: (mode: OSMode) => void;
}

export const Dock: React.FC<DockProps> = ({ activeMode, onModeChange }) => {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/60 backdrop-blur-[120px] border border-black/5 px-5 py-3 rounded-[2.5rem] flex items-center gap-2 shadow-sm"
            >
                <DockItem
                    icon={<MessageSquare className="w-5 h-5" />}
                    label="Talk"
                    active={activeMode === "TALK"}
                    onClick={() => onModeChange("TALK")}
                    color="emerald"
                />
                <div className="w-[1px] h-6 bg-white/5 mx-1" />
                <DockItem
                    icon={<Folder className="w-5 h-5" />}
                    label="Drop"
                    active={activeMode === "DROP"}
                    onClick={() => onModeChange("DROP")}
                    color="cyan"
                />
                <div className="w-[1px] h-6 bg-white/5 mx-1" />
                <DockItem
                    icon={<Radio className="w-5 h-5" />}
                    label="Radar"
                    active={activeMode === "RADAR"}
                    onClick={() => onModeChange("RADAR")}
                    color="rose"
                />
            </motion.div>
        </div>
    );
};

const DockItem = ({ icon, label, active, onClick, color }: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
    color: string;
}) => {
    const colorClasses: Record<string, string> = {
        emerald: "text-emerald-400 shadow-emerald-500/20",
        cyan: "text-cyan-400 shadow-cyan-500/20",
        rose: "text-rose-400 shadow-rose-500/20"
    };

    return (
        <button
            onClick={onClick}
            className={`relative flex flex-col items-center gap-1.5 px-5 py-2 transition-all duration-500 group outline-none`}
        >
            <motion.div
                animate={active ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                className={`transition-all duration-300 z-10 ${active ? colorClasses[color] : 'text-slate-400 group-hover:text-slate-600'}`}
            >
                {icon}
            </motion.div>
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 z-10 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 group-hover:opacity-40'}`}>
                {label}
            </span>
            {active && (
                <motion.div
                    layoutId="dock-indicator"
                    className="absolute inset-0 bg-slate-900/[0.03] rounded-2xl border border-black/5"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
            )}
            {active && (
                <motion.div
                    layoutId="dock-dot"
                    className={`absolute -bottom-1.5 w-1 h-1 rounded-full bg-current ${colorClasses[color]} shadow-[0_0_10px_currentColor]`}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
            )}
        </button>
    );
};
