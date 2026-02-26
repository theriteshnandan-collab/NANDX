"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Hash, Lock, Save, Trash2, Plus, Image as ImageIcon, Mic,
    Phone, Video, X, Play, Pause, AlertTriangle, Send, Loader2
} from "lucide-react";
import { mesh } from "@/lib/p2p/NandixMesh"; // for mesh.sendTyping / mesh.onTyping
import { useVoiceMessage } from "@/hooks/useVoiceMessage";
import { ChatRoom } from "@/lib/db/NandixDB";
import { RegistryView } from "@/components/Social/RegistryView";

/* ══════════════════════════════════════════════════════════════
   TALK VIEW — Billion Dollar Design
   Void + Teal. Card classes. Typography tokens.
══════════════════════════════════════════════════════════════ */

interface TalkViewProps {
    messages: any[];
    sendMessage: (text: string) => void;
    sendMediaMessage: (mediaType: "image" | "voice" | "file", mediaData: string, text?: string, mediaName?: string) => void;
    myId: string | null;
    activeTopic: string;
    rooms: ChatRoom[];
    onSwitchTopic: (topic: string) => void;
    onCreateRoom: (name: string) => void;
    onCall: (peerId: string, type: "voice" | "video") => void;
    showRegistry: boolean;
    setShowRegistry: (show: boolean) => void;
}

export function TalkView({
    messages, sendMessage, sendMediaMessage, myId, activeTopic,
    rooms, onSwitchTopic, onCreateRoom, onCall, showRegistry, setShowRegistry
}: TalkViewProps) {
    const [input, setInput] = useState("");
    const [peerTyping, setPeerTyping] = useState<string | null>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const [showRooms, setShowRooms] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { isRecording, formattedDuration, startRecording, stopRecording, cancelRecording } = useVoiceMessage();

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            sendMediaMessage("image", base64, "", file.name);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleVoiceSend = async () => {
        const base64 = await stopRecording();
        if (base64) sendMediaMessage("voice", base64);
    };

    useEffect(() => {
        mesh.onTyping((peerId, isTyping) => {
            if (isTyping) {
                setPeerTyping(peerId.substring(0, 8));
                if (typingTimeout.current) clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => setPeerTyping(null), 3000);
            } else {
                setPeerTyping(null);
            }
        });
    }, []);

    const sendTypingRef = useRef<NodeJS.Timeout | null>(null);
    const handleInputChange = useCallback((value: string) => {
        setInput(value);
        if (value.trim()) {
            mesh.sendTyping(true);
            if (sendTypingRef.current) clearTimeout(sendTypingRef.current);
            sendTypingRef.current = setTimeout(() => mesh.sendTyping(false), 2000);
        }
    }, []);

    const filteredMessages = messages.filter(msg =>
        !searchQuery ||
        msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.sender?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [filteredMessages.length]);

    const handleSend = () => {
        if (input.trim()) {
            sendMessage(input.trim());
            setInput("");
            mesh.sendTyping(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full w-full max-w-5xl mx-auto px-4 py-4 relative"
        >
            {/* Header */}
            <header className="w-full flex items-center justify-between px-5 py-4 card-elevated mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowRooms(!showRooms)} className="btn-ghost !px-3 !bg-[var(--bg-border)] flex items-center gap-2">
                        <Hash className="w-4 h-4 text-teal" />
                        <span className="font-display font-bold text-white tracking-tight">
                            {activeTopic === "general" ? "general" : rooms.find(r => r.id === activeTopic)?.name || activeTopic}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search sequence..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="hidden md:block input-void w-48 !py-1.5 !text-[13px]"
                    />
                    <div className="flex items-center gap-2 border-l pl-3 border-[var(--bg-border)]">
                        <button onClick={() => activeTopic !== "general" && onCall(activeTopic, "voice")} className="btn-ghost !p-2"><Phone className="w-4 h-4" /></button>
                        <button onClick={() => activeTopic !== "general" && onCall(activeTopic, "video")} className="btn-ghost !p-2"><Video className="w-4 h-4" /></button>
                        <button onClick={() => setShowRegistry(true)} className="btn-ghost !p-2" title="Sovereign Identity Registry"><Lock className="w-4 h-4" /></button>
                    </div>
                </div>
            </header>

            {/* Room Selector Dropdown */}
            <AnimatePresence>
                {showRooms && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute top-20 left-4 z-50 card-elevated p-2 w-64 shadow-2xl"
                        style={{ border: "1px solid var(--teal-border)" }}
                    >
                        <div className="max-h-60 overflow-y-auto no-scrollbar pb-2">
                            <button onClick={() => { onSwitchTopic("general"); setShowRooms(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg label-data transition text-[11px] hover:bg-[var(--bg-border)] ${activeTopic === "general" ? "text-teal bg-[var(--teal-glow)]" : ""}`}>
                                # general
                            </button>
                            {rooms.map(room => (
                                <button key={room.id} onClick={() => { onSwitchTopic(room.id); setShowRooms(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg label-data transition mt-1 text-[11px] hover:bg-[var(--bg-border)] ${activeTopic === room.id ? "text-teal bg-[var(--teal-glow)]" : ""}`}>
                                    # {room.name}
                                </button>
                            ))}
                        </div>
                        <div className="border-t pt-2 border-[var(--bg-border)] flex gap-2">
                            <input
                                type="text"
                                placeholder="New Room"
                                className="input-void !py-1 !px-2 !text-[11px] flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        onCreateRoom((e.target as HTMLInputElement).value);
                                        setShowRooms(false);
                                    }
                                }}
                            />
                            <button className="btn-teal !p-1.5" onClick={() => { }} title="Create"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-2 flex flex-col gap-6 w-full">
                {filteredMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <Lock className="w-8 h-8 text-[var(--text-muted)] mb-4" />
                        <p className="label-data">End-to-End Encrypted Tunnel</p>
                        <p className="font-mono text-[10px] text-[var(--text-muted)] mt-2">Awaiting transmission...</p>
                    </div>
                ) : (
                    filteredMessages.map((msg, i) => {
                        const isMe = msg.self;
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                key={i} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex flex-col gap-1 max-w-[85%] ${isMe ? "items-end" : "items-start"}`}>
                                    {/* Author & Time */}
                                    <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                        <span className="font-mono text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                                            {isMe ? "You" : msg.senderName || msg.sender.substring(0, 8)}
                                        </span>
                                        <span className="font-mono text-[9px] text-[var(--text-muted)]">
                                            {typeof msg.timestamp === 'number' ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : msg.timestamp}
                                        </span>
                                    </div>

                                    {/* Bubble */}
                                    <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-md font-medium text-white
                                        ${isMe ? "bg-teal text-[#0A0A0F] rounded-br-sm" : "bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-bl-sm"}`}>

                                        {msg.mediaType === "image" && msg.mediaData ? (
                                            <div className="flex flex-col gap-2">
                                                <img src={msg.mediaData} alt={msg.mediaName} className="max-w-[260px] max-h-[260px] rounded-xl object-contain border border-[var(--bg-border)]" />
                                                {msg.text && <span>{msg.text}</span>}
                                            </div>
                                        ) : msg.mediaType === "voice" && msg.mediaData ? (
                                            <div className={`flex items-center gap-3 w-48 ${isMe ? "text-[#0A0A0F]" : "text-teal"}`}>
                                                <div className="p-2 rounded-full card">
                                                    <Play className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex-1 h-1 bg-current opacity-30 rounded-full" />
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                {peerTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-teal rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-teal rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-teal rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </motion.div>
                )}
                <div ref={endRef} />
            </div>

            {/* Input Footer */}
            <footer className="mt-4 card p-2 flex flex-col gap-2 relative">
                {isRecording && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="w-full flex items-center justify-between px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="font-mono text-[12px] font-bold text-red-400">{formattedDuration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={cancelRecording} className="btn-ghost !p-1.5 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                            <button onClick={handleVoiceSend} className="btn-teal !p-1.5 !rounded-lg"><Send className="w-4 h-4" /></button>
                        </div>
                    </motion.div>
                )}

                <div className="flex items-end gap-2 px-2">
                    <button onClick={() => fileInputRef.current?.click()} className="btn-ghost !p-2 mb-1" title="Upload Media">
                        <ImageIcon className="w-5 h-5 text-[var(--text-secondary)] hover:text-teal transition-colors" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />

                    <textarea
                        value={input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                        }}
                        placeholder={`Signal to #${activeTopic === "general" ? "general" : rooms.find(r => r.id === activeTopic)?.name || activeTopic}...`}
                        className="flex-1 bg-transparent text-white placeholder-[var(--text-muted)] text-[14px] min-h-[40px] max-h-[160px] py-2.5 outline-none resize-none no-scrollbar font-medium"
                        rows={1}
                    />

                    {input.trim() ? (
                        <button onClick={handleSend} className="btn-teal !p-2 mb-1">
                            <Send className="w-4 h-4" />
                        </button>
                    ) : (
                        <button onClick={startRecording} className="btn-ghost !p-2 mb-1 group" title="Hold to record">
                            <Mic className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-teal transition-colors" />
                        </button>
                    )}
                </div>
            </footer>

            {/* Registry Overlay */}
            <AnimatePresence>
                {showRegistry && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 rounded-2xl overflow-hidden backdrop-blur-3xl bg-[#0A0A0F]/90 border border-[var(--bg-border)] m-4 shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-[var(--bg-border)]">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-teal" />
                                <span className="font-display font-medium text-white text-sm">Sovereign Identity Registry</span>
                            </div>
                            <button onClick={() => setShowRegistry(false)} className="btn-ghost !p-1.5 hover:bg-white/5 disabled:opacity-50 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <RegistryView
                                onJoinRoom={(roomId, inviteCode) => {
                                    onSwitchTopic(roomId);
                                    setShowRegistry(false);
                                }}
                                onAddContact={() => { }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
