"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { NerveCenter, VoidMode } from "@/components/Shell/NerveCenter";
import { useSovereign } from "@/hooks/useSovereign";
import { useVoiceMessage } from "@/hooks/useVoiceMessage";
import { useMediaStream } from "@/hooks/useMediaStream";
import { useMesh } from "@/context/MeshProvider";
import { mesh } from "@/lib/p2p/NandixMesh";
import { RegistryView } from "@/components/Social/RegistryView";
import { LinkPreview } from "@/components/Chat/LinkPreview";
import { FeedView } from "@/components/Social/FeedView";
import { EnhancedProfileView } from "@/components/Social/EnhancedProfileView";
import { RadarView as SovereignRadarView } from "@/components/Social/RadarView";
import { TalkView } from '@/components/Chat/TalkView';
import { DropView } from '@/components/Social/DropView';
import { sovereignCrypto } from "@/lib/crypto/SovereignCrypto";
import { kernel } from "@/lib/core/NandixKernel";
import { identity, UserProfile, getMyProfile, setMyProfile } from "@/lib/crypto/Identity";
import { db, saveContact, removeContact, createRoom, deleteRoom, ChatRoom, updateRoomPrivacy } from "@/lib/db/NandixDB";
import { BotManager, BotShard } from "@/lib/agents/BotShards";
import { trustEngine, TrustVouch } from "@/lib/crypto/TrustEngine";
import { useLiveQuery } from "dexie-react-hooks";
import { motion, AnimatePresence } from "framer-motion";
// import { reactorPipeline } from "@/lib/ghost/ReactorPipeline";
// import { vectorEngine } from "@/lib/ghost/VectorEngine";
import QRCode from "qrcode";
import {
    Send, Share2, Radio, User, Cpu, Activity,
    ArrowUpRight, ArrowDownLeft, Database,
    Wifi, Shield, Check, Zap, Copy, Users,
    Key, Eye, EyeOff, RefreshCw, AlertTriangle,
    Plus, Hash, ChevronLeft, Trash2, Image as ImageIcon, Mic, X, Play, Pause, Clock, CheckCheck,
    Settings, QrCode, Edit3, Phone, PhoneOff, VideoOff, Volume2, VolumeX, Video, Globe,
    Sparkles, BarChart3, Signal, Layers, MessageCircle, HardDrive, Upload, Download, Crosshair
} from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NANDIX OS: THE VOID
// A spatial, physics-based sovereign interface.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const modes: VoidMode[] = ["FEED", "TALK", "DROP", "RADAR", "PROFILE"];

export default function NandixOS() {
    const [mode, setMode] = useState<VoidMode>("FEED");
    const [activeTopic, setActiveTopic] = useState("general");
    const { messages, sendMessage, sendMediaMessage } = useSovereign(activeTopic);
    const { myId, connectedPeers, mnemonic, isNewIdentity } = useMesh();
    const [streamProgress, setStreamProgress] = useState({ percent: 0, file: "" });
    const [pairingRequest, setPairingRequest] = useState<{ peerId: string; secret: string } | null>(null);
    const [isPairing, setIsPairing] = useState(false);
    const [showVessel, setShowVessel] = useState(false);
    const [myProfile, setMyProfileState] = useState<UserProfile | null>(null);
    const [discoveredRooms, setDiscoveredRooms] = useState<any[]>([]);
    const [showRegistry, setShowRegistry] = useState(false);

    // CALL STATE
    const [callState, setCallState] = useState<"idle" | "calling" | "incoming" | "active">("idle");
    const [activeCallPeer, setActiveCallPeer] = useState<string | null>(null);
    const [callType, setCallType] = useState<"voice" | "video">("voice");
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const { stream: localStream, getStream, stopStream, toggleAudio, toggleVideo, isAudioMuted, isVideoOff } = useMediaStream();

    // BOT & TRUST STATE
    const botManagerRef = useRef<BotManager | null>(null);
    const [botShards, setBotShards] = useState<BotShard[]>([]);

    // Error & Toast State
    const [lastError, setLastError] = useState<string | null>(null);

    // 🚀 SOVEREIGN BOOT SEQUENCE (AAA Standard)
    useEffect(() => {
        if (myId) {
            // Instead of scattered initialization, we call the Kernel.
            // This ensures every module starts in the correct order.
            kernel.boot();

            getMyProfile(myId).then(setMyProfileState);

            // The Kernel now handles BotManager and Mesh orchestration
            if (!botManagerRef.current) {
                botManagerRef.current = new BotManager(mesh);
                setBotShards(botManagerRef.current.getShards());
            }

            // Hook Mesh Events (Eventually moved to Kernel subscribers)
            mesh.onConnection((peerId) => {
                botManagerRef.current?.handleConnection(peerId);
            });
        }
    }, [myId]);

    // Auto-Sync Profile on connection
    useEffect(() => {
        if (myProfile) {
            mesh.onConnectionChange(() => {
                mesh.sendProfile(myProfile);
            });
            // Handle incoming profiles
            mesh.onProfile(async (peerId, profile) => {
                const contact = await db.contacts.get(peerId);
                if (contact) {
                    await db.contacts.update(peerId, {
                        username: profile.username,
                        bio: profile.bio,
                        avatar: profile.avatar
                    });
                }
            });
        }
    }, [myProfile]);

    // Live rooms from Dexie
    const rooms = useLiveQuery(() => db.rooms.orderBy("lastActivity").reverse().toArray(), []);

    useEffect(() => {
        if (isNewIdentity && mnemonic) {
            setShowVessel(true);
        }
    }, [isNewIdentity, mnemonic]);

    // Zero-Host Deep Linking
    useEffect(() => {
        const handleHash = () => {
            const hash = window.location.hash.substring(1);
            if (!hash) return;
            const params = new URLSearchParams(hash);
            const peer = params.get("peer");
            const room = params.get("room");
            const invite = params.get("invite");

            if (peer) {
                console.log(`[DEEP-LINK] 🔗 Connecting to peer: ${peer}`);
                mesh.connectToPeer(peer);
            }
            if (room && invite) {
                console.log(`[DEEP-LINK] 🏠 Joining room via link: ${room}`);
                db.rooms.get(room).then(exists => {
                    if (!exists) {
                        db.rooms.put({
                            id: room,
                            name: "Joining...",
                            inviteCode: invite,
                            members: [],
                            createdAt: Date.now(),
                            createdBy: peer || "unknown",
                            lastActivity: Date.now()
                        });
                    }
                });
            }
        };
        handleHash();
        window.addEventListener("hashchange", handleHash);
        return () => window.removeEventListener("hashchange", handleHash);
    }, []);

    // Discovery Loop
    useEffect(() => {
        const interval = setInterval(async () => {
            const publicRooms = await db.rooms.where("isPublic").equals(1).toArray();
            if (publicRooms.length > 0) {
                mesh.announcePublicRooms(publicRooms);
            }
        }, 30000); // Announce every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const unsubscribe = mesh.setPacketListener((packet) => {
            if (packet.type === "BLUE_START") {
                mesh.initIncomingStream(packet.payload);
            }
            if (packet.type === "BLUE_END") {
                mesh.finalizeStream(packet.payload.name);
                setStreamProgress({ percent: 0, file: "" });
            }
        });
        return () => { unsubscribe(); };
    }, [callState, activeCallPeer]);

    const initiateCall = async (peerId: string, type: "voice" | "video") => {
        setCallType(type);
        setCallState("calling");
        setActiveCallPeer(peerId);

        const stream = await getStream(type === "video", true);
        if (stream) {
            mesh.callPeer(peerId, stream);
        } else {
            setCallState("idle");
            setActiveCallPeer(null);
        }
    };

    const acceptCall = async () => {
        if (!activeCallPeer) return;
        const stream = await getStream(callType === "video", true);
        if (stream) {
            mesh.answerCall(activeCallPeer, stream);
            setCallState("active");
        }
    };

    const endCall = () => {
        if (activeCallPeer) {
            mesh.endCall(activeCallPeer);
        }
        setCallState("idle");
        setActiveCallPeer(null);
        setRemoteStream(null);
        stopStream();
    };

    const handleAcceptPairing = () => {
        if (pairingRequest && mnemonic) {
            mesh.sendPairingData(pairingRequest.peerId, mnemonic);
            setPairingRequest(null);
        }
    };

    const handleRejectPairing = () => {
        setPairingRequest(null);
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-blue-500/20">
            {/* ═══ ERROR TOAST ═══ */}
            <AnimatePresence>
                {lastError && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="fixed top-8 left-1/2 z-[100] px-6 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl flex items-center gap-3 shadow-[0_0_40px_rgba(244,63,94,0.1)]"
                    >
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-rose-400">{lastError}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* IDENTITY VESSEL: Onboarding Modal */}
            <AnimatePresence>
                {showVessel && mnemonic && (
                    <IdentityVessel mnemonic={mnemonic} onComplete={() => setShowVessel(false)} />
                )}
            </AnimatePresence>

            {/* PAIRING REQUEST MODAL */}
            {pairingRequest && (
                <PairingDialog
                    request={pairingRequest}
                    onAccept={handleAcceptPairing}
                    onReject={handleRejectPairing}
                />
            )}

            {/* THE VOID: Physical Noise Layer */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: "128px 128px",
                }}
            />

            {/* DOT GRID PATTERN */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.06]"
                style={{
                    backgroundImage: `radial-gradient(circle, rgba(37,99,235,0.12) 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                }}
            />

            {/* AMBIENT GRADIENT ORBS — Floating energy signatures */}
            <motion.div
                animate={{ x: [0, 40, -30, 0], y: [0, -50, 30, 0] }}
                transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.04] blur-[150px] pointer-events-none z-0"
            />
            <motion.div
                animate={{ x: [0, -50, 40, 0], y: [0, 30, -40, 0] }}
                transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[15%] right-[10%] w-[450px] h-[450px] rounded-full bg-indigo-400/[0.03] blur-[130px] pointer-events-none z-0"
            />
            <motion.div
                animate={{ x: [0, 25, -20, 0], y: [0, -30, 50, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[45%] right-[25%] w-[350px] h-[350px] rounded-full bg-slate-400/[0.02] blur-[110px] pointer-events-none z-0"
            />

            {/* Wire-Responsive Ambient Glow */}
            <AnimatePresence>
                {streamProgress.percent > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                            background: `radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.06) 0%, transparent 60%)`,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* STATUS BAR: Sovereign Identity */}
            <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-8 h-14 border-b border-black/[0.04] bg-white/40 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <motion.div
                            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-emerald-500"
                        />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                        NANDIX
                    </span>
                    <div className="hidden md:block h-3 w-px bg-slate-200" />
                    <span className="hidden md:block text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                        Sovereign Mesh
                    </span>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* System Clock */}
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/50 border border-black/[0.03]">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    {/* Peer Counter */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${connectedPeers > 0 ? 'bg-blue-500/5 border-blue-500/10' : 'bg-slate-100/50 border-black/[0.03]'}`}>
                        <Users className={`w-2.5 h-2.5 ${connectedPeers > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className={`text-[10px] font-mono tabular-nums ${connectedPeers > 0 ? 'text-blue-600' : 'text-slate-500'}`}>
                            {connectedPeers}
                        </span>
                    </div>

                    {/* Identity Chip */}
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/50 border border-black/[0.03]">
                        <Crosshair className="w-2.5 h-2.5 text-slate-400" />
                        <span className="text-[9px] font-mono text-slate-500 tracking-wider">
                            {myId ? myId.substring(0, 10) + "…" : "…"}
                        </span>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-white/80 border border-black/5 flex items-center justify-center hover:border-black/10 transition-all cursor-pointer">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                </div>
            </header>

            {/* ☢️ REACTOR HUD (Desktop only) */}
            <div className="hidden md:flex absolute top-14 left-10 z-40 items-center gap-3 mt-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-blue-500/10 shadow-[0_4px_12px_rgba(37,99,235,0.05)]">
                    <Zap className="w-3 h-3 text-blue-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Reactor</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-slate-500/10 shadow-[0_4px_12px_rgba(71,85,105,0.05)]">
                    <Activity className="w-3 h-3 text-slate-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Kernel: {kernel.getUptime()}ms</span>
                </div>
            </div>

            {/* STREAM HUD */}
            <AnimatePresence>
                {streamProgress.percent > 0 && (
                    <motion.div
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        className="absolute top-16 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="px-8 py-4 rounded-2xl bg-white/95 backdrop-blur-3xl border border-black/5 flex items-center gap-5 shadow-2xl">
                            <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
                                    Blue Wire Active
                                </div>
                                <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                                    {streamProgress.file} · {streamProgress.percent.toFixed(0)}%
                                </div>
                            </div>
                            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${streamProgress.percent}%` }}
                                    className="h-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.3)] rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT: offset by sidebar (96px = ml-24) on desktop, pb-24 on mobile */}
            <main className="relative w-full h-full z-10 pt-14 md:ml-24 pb-24 md:pb-0" style={{ minHeight: "100vh" }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex-1 w-full"
                        onPanEnd={(_, info) => {
                            // 📱 Mobile Swipe Logic
                            if (Math.abs(info.offset.x) > 50) {
                                const currentIndex = modes.indexOf(mode);
                                if (info.offset.x > 0 && currentIndex > 0) {
                                    setMode(modes[currentIndex - 1]);
                                } else if (info.offset.x < 0 && currentIndex < modes.length - 1) {
                                    setMode(modes[currentIndex + 1]);
                                }
                            }
                        }}
                    >
                        {mode === "FEED" && <FeedView key="feed" myId={myId} connectedPeers={connectedPeers} />}
                        {mode === "TALK" && (
                            <TalkView
                                key="talk"
                                messages={messages}
                                sendMessage={sendMessage}
                                sendMediaMessage={sendMediaMessage}
                                myId={myId}
                                activeTopic={activeTopic}
                                rooms={rooms || []}
                                onSwitchTopic={setActiveTopic}
                                onCreateRoom={async (name) => {
                                    const id = await createRoom(name, myId || "anonymous");
                                    if (id) {
                                        setActiveTopic(id);
                                        mesh.sendRoomInvite(id, name, "");
                                    }
                                }}
                                showRegistry={showRegistry}
                                setShowRegistry={setShowRegistry}
                                onCall={initiateCall}
                            />
                        )}
                        {mode === "DROP" && <DropView key="drop" streamProgress={streamProgress} />}
                        {mode === "RADAR" && (
                            <SovereignRadarView
                                key="radar"
                                myId={myId}
                                connectedPeers={connectedPeers}
                                onAddContact={(peerId) => saveContact({ peerId, nickname: "", addedAt: Date.now(), lastSeen: Date.now(), messageCount: 0, trustScore: 0, publicKeyFingerprint: "" })}
                                onJoinRoom={(roomId, inviteCode) => {
                                    setActiveTopic(roomId);
                                    setMode("TALK");
                                }}
                            />
                        )}
                        {mode === "PROFILE" && (
                            <EnhancedProfileView key="profile" myId={myId} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* NERVE CENTER */}
            <NerveCenter activeMode={mode} onModeChange={setMode} />

            {/* CALL OVERLAY */}
            <AnimatePresence>
                {callState !== "idle" && (
                    <CallOverlay
                        state={callState}
                        type={callType}
                        peerId={activeCallPeer}
                        remoteStream={remoteStream}
                        localStream={localStream}
                        isAudioMuted={isAudioMuted}
                        isVideoOff={isVideoOff}
                        onAccept={acceptCall}
                        onEnd={endCall}
                        onToggleAudio={toggleAudio}
                        onToggleVideo={toggleVideo}
                    />
                )}
            </AnimatePresence>

        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IDENTITY VESSEL: The Onboarding Portal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function IdentityVessel({ mnemonic, onComplete }: { mnemonic: string; onComplete: () => void }) {
    const words = mnemonic.split(" ");
    const [confirmed, setConfirmed] = useState(false);
    const [showWords, setShowWords] = useState(true);
    const [copiedWords, setCopiedWords] = useState(false);

    const handleCopyWords = () => {
        navigator.clipboard.writeText(mnemonic);
        setCopiedWords(true);
        setTimeout(() => setCopiedWords(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-3xl flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-full max-w-lg bg-white/80 border border-black/5 p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(37,99,235,0.1)] relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
                    >
                        <Key className="w-7 h-7 text-blue-600 animate-pulse" />
                    </motion.div>
                    <h2 className="display-sm font-black tracking-tight text-slate-900">Sovereign Onboarding</h2>
                    <p className="text-[12px] text-slate-500 mt-3 leading-relaxed max-w-xs mx-auto">
                        These 12 words are your total sovereign identity. <b className="text-slate-900">Do not lose them.</b>
                        They are the only way to recover your node.
                    </p>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-6">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-600/90 font-bold leading-relaxed">
                        Never share these words. Anyone with them controls your identity. Store them offline.
                    </p>
                </div>

                {/* Word Grid */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {words.map((word, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative px-4 py-3.5 rounded-2xl bg-slate-50 border border-black/5 shadow-sm group hover:border-blue-500/30 transition-all"
                        >
                            <span className="text-[9px] font-mono text-slate-400 absolute top-1 left-2 group-hover:text-blue-500">{(i + 1).toString().padStart(2, '0')}</span>
                            <span className={`text-[14px] font-mono block text-center mt-1 font-bold ${showWords ? "text-slate-900" : "text-transparent bg-slate-200 rounded-md select-none"}`}>
                                {showWords ? word : "••••••"}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => setShowWords(!showWords)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white border border-black/5 text-[11px] font-mono uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:border-black/10 transition-all shadow-sm"
                    >
                        {showWords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showWords ? "Hide" : "Reveal"}
                    </button>
                    <button
                        onClick={handleCopyWords}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border text-[11px] font-mono uppercase tracking-widest transition-all shadow-sm ${copiedWords
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-600"
                            : "bg-white border-black/5 text-slate-500 hover:text-slate-900"
                            }`}
                    >
                        {copiedWords ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedWords ? "Copied" : "Copy"}
                    </button>
                </div>

                {/* Confirmation */}
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-black/[0.03] cursor-pointer mb-6">
                    <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500/20"
                    />
                    <span className="text-[11px] text-slate-500 font-bold">
                        I have written down my Magic Words in a safe place
                    </span>
                </label>

                {/* Enter the Void */}
                <motion.button
                    whileHover={confirmed ? { scale: 1.02, y: -2 } : {}}
                    whileTap={confirmed ? { scale: 0.98 } : {}}
                    onClick={confirmed ? onComplete : undefined}
                    className={`w-full py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] transition-all ${confirmed
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:shadow-[0_25px_50px_rgba(37,99,235,0.3)] cursor-pointer"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                        }`}
                >
                    Establish Node
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RADAR VIEW: Neural Sonar (Green Wire)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


function RadarView({ myId, connectedPeers, discoveredRooms }: { myId: string | null; connectedPeers: number; discoveredRooms: any[] }) {
    const [peerId, setPeerId] = useState("");
    const [copied, setCopied] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [showRecovery, setShowRecovery] = useState(false);
    const [recoveryWords, setRecoveryWords] = useState("");
    const [recovering, setRecovering] = useState(false);
    const [showMyWords, setShowMyWords] = useState(false);
    const [tab, setTab] = useState<"radar" | "lounge">("radar");
    const { mnemonic, recoverIdentity } = useMesh();

    // Live contacts from Dexie
    const contacts = useLiveQuery(() => db.contacts.orderBy("lastSeen").reverse().toArray(), []);
    const connectedIds = mesh.getConnectedPeerIds();

    const handleConnect = () => {
        if (peerId.trim()) {
            setConnecting(true);
            mesh.connectToPeer(peerId.trim());

            // Prompt to save as contact
            const nickname = prompt("Save as contact? Enter nickname (or cancel):");
            if (nickname) {
                saveContact({
                    peerId: peerId.trim(),
                    nickname,
                    addedAt: Date.now(),
                    lastSeen: Date.now(),
                    messageCount: 0,
                });
            }

            setPeerId("");
            setTimeout(() => setConnecting(false), 3000);
        }
    };

    const handleRecover = async () => {
        if (!recoveryWords.trim()) return;
        setRecovering(true);
        const success = await recoverIdentity(recoveryWords.trim());
        if (!success) {
            alert("Invalid Magic Words. Please check your words and try again.");
        }
        setRecovering(false);
        setShowRecovery(false);
        setRecoveryWords("");
    };

    const handleCopy = () => {
        if (!myId) return;
        navigator.clipboard.writeText(myId);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleShare = async () => {
        if (!myId) return;
        if (navigator.share) {
            await navigator.share({
                title: "NANDIX Sovereign ID",
                text: `Connect to my Sovereign Mesh: ${myId}`,
            });
        } else {
            handleCopy();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-start max-w-2xl mx-auto px-6 pt-12 gap-8"
        >
            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 rounded-2xl bg-slate-200/50 border border-black/5">
                <button
                    onClick={() => setTab("radar")}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === "radar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                    Sonar
                </button>
                <button
                    onClick={() => setTab("lounge")}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === "lounge" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                    Lounge
                </button>
            </div>

            {tab === "radar" ? (
                <div className="w-full flex flex-col items-center gap-12">
                    {/* Neural Sonar */}
                    <div className="relative">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 2.5],
                                    opacity: [0.2, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeOut",
                                    delay: i * 1.3
                                }}
                                className={`absolute inset-0 rounded-full border ${connectedPeers > 0 ? "border-emerald-500/30" : "border-rose-500/30"}`}
                                style={{ width: 120, height: 120, top: -20, left: -20 }}
                            />
                        ))}

                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className={`w-20 h-20 rounded-full ${connectedPeers > 0 ? "bg-emerald-500/[0.05] border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)]" : "bg-rose-500/[0.05] border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.1)]"} border flex items-center justify-center`}
                        >
                            <Radio className={`w-8 h-8 ${connectedPeers > 0 ? "text-emerald-500/50" : "text-rose-500/50"}`} />
                        </motion.div>
                    </div>

                    {/* Connection Status Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border ${connectedPeers > 0 ? "bg-emerald-500/5 border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "bg-slate-50 border-black/5 shadow-sm"}`}
                    >
                        <Users className={`w-3 h-3 ${connectedPeers > 0 ? "text-emerald-600" : "text-slate-400"}`} />
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${connectedPeers > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                            {connectedPeers > 0 ? `${connectedPeers} peer${connectedPeers > 1 ? "s" : ""} connected` : "No peers connected"}
                        </span>
                    </motion.div>

                    <div className="w-full flex flex-col gap-6">
                        {/* ═══ SOURCE IDENTITY CARD ═══ */}
                        <div className="relative p-6 md:p-7 rounded-[2.2rem] bg-white/50 backdrop-blur-3xl border border-black/5 shadow-xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Your Sovereign ID</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${myId ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-slate-200"} animate-pulse`} />
                                    <span className={`text-[8px] font-mono uppercase ${myId ? "text-emerald-600" : "text-slate-300"}`}>
                                        {myId ? "Online" : "Linking..."}
                                    </span>
                                </div>
                            </div>

                            {/* The ID itself — large, prominent, selectable */}
                            <div className="py-3 px-4 rounded-2xl bg-slate-50 border border-black/[0.03] mb-4 shadow-inner">
                                <p className="text-[15px] md:text-[17px] font-mono text-slate-900 font-bold tracking-tight break-all leading-relaxed select-all">
                                    {myId || "⏳ Generating cryptographic identity..."}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleCopy}
                                    disabled={!myId}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-[11px] font-mono uppercase tracking-wider transition-all ${copied
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                                        : myId
                                            ? "bg-white border-black/5 text-slate-500 hover:text-blue-600 hover:border-blue-500/30 shadow-sm"
                                            : "bg-slate-50 border-black/[0.02] text-slate-300 cursor-not-allowed"
                                        }`}
                                >
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? "Copied!" : "Copy ID"}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleShare}
                                    disabled={!myId}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-[11px] font-mono uppercase tracking-wider transition-all ${myId
                                        ? "bg-white border-black/5 text-slate-500 hover:text-blue-600 hover:border-blue-500/30 shadow-sm"
                                        : "bg-slate-50 border-black/[0.02] text-slate-300 cursor-not-allowed"
                                        }`}
                                >
                                    <Share2 className="w-3.5 h-3.5" />
                                    Share
                                </motion.button>
                            </div>
                        </div>

                        {/* ═══ TARGET SIGNAL INPUT ═══ */}
                        <div className="relative p-6 md:p-7 rounded-[2.2rem] bg-white/50 backdrop-blur-3xl border border-black/5 shadow-xl">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-3">Connect to Peer</span>
                            <div className="flex items-center gap-3">
                                <input
                                    value={peerId}
                                    onChange={(e) => setPeerId(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                                    placeholder="Paste Sovereign ID here..."
                                    className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-[13px] text-slate-900 font-bold placeholder-slate-300 outline-none font-mono border border-black/[0.03] focus:border-blue-500/20 transition-all shadow-inner"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleConnect}
                                    disabled={!peerId.trim()}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${connecting
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                                        : peerId.trim()
                                            ? "bg-blue-600 text-white shadow-lg active:scale-90"
                                            : "bg-slate-100 border border-black/[0.02] text-slate-300"
                                        }`}
                                >
                                    {connecting ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                </motion.button>
                            </div>
                        </div>

                        {/* ═══ CONTACTS PANEL ═══ */}
                        {contacts && contacts.length > 0 && (
                            <div className="relative p-6 md:p-7 rounded-[2.2rem] bg-zinc-950/40 backdrop-blur-3xl border border-white/[0.03]">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 block mb-4">
                                    Contacts · {contacts.length}
                                </span>
                                <div className="space-y-2">
                                    {contacts.map((contact) => {
                                        const isOnline = connectedIds.includes(contact.peerId);
                                        return (
                                            <motion.div
                                                key={contact.peerId}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-black/5 shadow-sm group"
                                            >
                                                {/* Avatar */}
                                                <div className="relative">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-black/5 flex items-center justify-center">
                                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                                    </div>
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline ? "bg-emerald-500" : "bg-slate-200"
                                                        }`} />
                                                </div>

                                                {/* Connection Quality Badge */}
                                                {isOnline && (
                                                    <div className={`px-1 rounded bg-black/40 border border-white/5 flex items-center gap-1 ${mesh.getQuality(contact.peerId) === "relay" ? "text-amber-500" : "text-emerald-500/60"
                                                        }`}>
                                                        <span className="text-[7px] font-black tracking-tighter uppercase">
                                                            {mesh.getQuality(contact.peerId) === "relay" ? "RLY" : "DIR"}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-[12px] font-black text-slate-900 truncate uppercase tracking-tight">
                                                            {contact.nickname}
                                                        </span>
                                                        {contact.isBot && (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[7px] font-black text-blue-600 uppercase tracking-tighter">
                                                                <Cpu className="w-2 h-2" />
                                                                Bot
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-mono text-slate-400 truncate">
                                                            {contact.peerId.substring(0, 16)}...
                                                        </span>

                                                        {/* Trust Shield */}
                                                        <div className={`flex items-center gap-1 px-1 rounded-md border ${(contact.trustScore || 0) > 70 ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600" :
                                                            (contact.trustScore || 0) > 30 ? "bg-amber-500/5 border-amber-500/10 text-amber-600" :
                                                                "bg-slate-50 border-black/5 text-slate-300"
                                                            }`}>
                                                            <Shield className="w-2 h-2" />
                                                            <span className="text-[8px] font-black">{contact.trustScore || 10}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                {contact.messageCount > 0 && (
                                                    <span className="text-[8px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-50 border border-black/[0.02]">
                                                        {contact.messageCount} msgs
                                                    </span>
                                                )}

                                                {/* Actions */}
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!isOnline && (
                                                        <button
                                                            onClick={() => mesh.connectToPeer(contact.peerId)}
                                                            className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-emerald-950 transition-all"
                                                            title="Reconnect"
                                                        >
                                                            <Zap className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Remove ${contact.nickname}?`)) {
                                                                removeContact(contact.peerId);
                                                            }
                                                        }}
                                                        className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-rose-500 hover:border-rose-500/20 transition-all"
                                                        title="Remove"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ═══ SOVEREIGN VAULT ═══ */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowMyWords(!showMyWords); setShowRecovery(false); }}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-mono uppercase tracking-wider transition-all shadow-sm ${showMyWords
                                    ? "bg-blue-600 text-white shadow-blue-500/20"
                                    : "bg-white border-black/5 text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                <Key className="w-3 h-3" />
                                My Words
                            </button>
                            <button
                                onClick={() => { setShowRecovery(!showRecovery); setShowMyWords(false); }}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-mono uppercase tracking-wider transition-all shadow-sm ${showRecovery
                                    ? "bg-blue-600 text-white shadow-blue-500/20"
                                    : "bg-white border-black/5 text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                <RefreshCw className="w-3 h-3" />
                                Recover
                            </button>
                        </div>

                        {/* ═══ MY MAGIC WORDS (Expandable) ═══ */}
                        <AnimatePresence>
                            {showMyWords && mnemonic && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-5 rounded-[2rem] bg-zinc-950/40 backdrop-blur-3xl border border-violet-500/10">
                                        {/* ═══ RECOVERY INPUT (Expandable) ═══ */}
                                        <AnimatePresence>
                                            {showRecovery && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-5 rounded-[2rem] bg-white border border-blue-500/10 shadow-xl">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-600/60 block mb-3">Enter 12 Magic Words</span>
                                                        <textarea
                                                            value={recoveryWords}
                                                            onChange={(e) => setRecoveryWords(e.target.value)}
                                                            placeholder="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
                                                            rows={3}
                                                            className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[12px] text-slate-900 font-bold placeholder-slate-300 outline-none font-mono border border-black/[0.03] focus:border-blue-500/30 transition-all resize-none shadow-inner"
                                                        />
                                                        <button
                                                            onClick={handleRecover}
                                                            disabled={recovering || !recoveryWords.trim()}
                                                            className={`w-full mt-3 py-3 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all shadow-lg ${recoveryWords.trim()
                                                                ? "bg-blue-600 text-white shadow-blue-500/20"
                                                                : "bg-slate-50 border border-black/[0.02] text-slate-200"
                                                                }`}
                                                        >
                                                            {recovering ? "Recovering..." : "Restore Identity"}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                            {showRecovery && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-5 rounded-[2rem] bg-white/40 backdrop-blur-3xl border border-blue-500/10 shadow-xl">
                                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-600 block mb-3">Enter 12 Magic Words</span>
                                        <textarea
                                            value={recoveryWords}
                                            onChange={(e) => setRecoveryWords(e.target.value)}
                                            placeholder="word1 word2 word3..."
                                            rows={3}
                                            className="w-full bg-white/50 rounded-xl px-4 py-3 text-[12px] text-slate-900 placeholder-slate-300 outline-none font-mono border border-black/[0.04] focus:border-blue-500/20 transition-all resize-none"
                                        />
                                        <button
                                            onClick={handleRecover}
                                            disabled={recovering || !recoveryWords.trim()}
                                            className="w-full mt-3 py-3 rounded-xl bg-blue-600 text-white font-mono text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
                                        >
                                            {recovering ? "Recovering..." : "Restore Identity"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            ) : (
                <div className="w-full space-y-6">
                    <div className="text-center">
                        <h3 className="text-[20px] font-black tracking-tight text-white mb-1">Discovery Lounge</h3>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">Public Mesh Spaces</p>
                    </div>

                    <div className="grid gap-4 custom-scrollbar max-h-[60vh] overflow-y-auto pr-2">
                        {discoveredRooms.length === 0 ? (
                            <div className="py-20 text-center opacity-30">
                                <Radio className="w-12 h-12 mx-auto mb-4 text-zinc-700 animate-pulse" />
                                <p className="text-[11px] font-mono uppercase tracking-[0.4em] text-zinc-800">No public signals found</p>
                            </div>
                        ) : (
                            discoveredRooms.map((room) => (
                                <motion.div
                                    key={room.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-6 rounded-[2rem] bg-white/60 backdrop-blur-3xl border border-black/5 flex items-center justify-between group shadow-sm"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[14px] font-black text-slate-900">{room.name}</span>
                                            <div className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[8px] font-mono text-blue-600 uppercase">Public</div>
                                        </div>
                                        <p className="text-[11px] text-slate-500 max-w-xs">{room.description || "No description."}</p>
                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="flex items-center gap-1"><Users className="w-3 h-3 text-slate-400" /><span className="text-[9px] font-mono text-slate-500">{room.members?.length || 0}</span></div>
                                            <div className="flex items-center gap-1"><Cpu className="w-3 h-3 text-slate-400" /><span className="text-[9px] font-mono text-slate-500">via {room.host.substring(0, 8)}</span></div>
                                        </div>
                                    </div>
                                    <button onClick={() => { mesh.connectToPeer(room.host); db.rooms.put({ ...room, isPublic: false }); alert(`Joined ${room.name}!`); }} className="w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center"><Plus className="w-5 h-5" /></button>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VOID STATS: Floating Side Shards
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROFILE VIEW: Sovereign Identity & Discovery
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ProfileView({ profile, onSave, shards, onToggleShard }: { profile: UserProfile | null; onSave: (p: UserProfile) => void; shards: BotShard[]; onToggleShard: (id: string, enabled: boolean) => void }) {
    const [qrData, setQrData] = useState<string>("");
    const [username, setUsername] = useState(profile?.username || "");
    const [bio, setBio] = useState(profile?.bio || "");
    const [copied, setCopied] = useState(false);
    const msgCount = useLiveQuery(() => db.messages.count(), []);
    const fileCount = useLiveQuery(() => (db as any).files.count(), []);
    const contactCount = useLiveQuery(() => db.contacts.count(), []);

    useEffect(() => {
        if (profile) {
            setUsername(profile.username);
            setBio(profile.bio);
            QRCode.toDataURL(profile.peerId, {
                margin: 2,
                width: 400,
                color: {
                    dark: "#A855F7",
                    light: "#00000000"
                }
            }).then(setQrData);
        }
    }, [profile]);

    if (!profile) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(profile.peerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full max-w-2xl mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-32 overflow-y-auto custom-scrollbar"
        >
            <div className="space-y-5 md:space-y-6">
                {/* ═══ HERO: QR + IDENTITY ═══ */}
                <div className="relative p-6 rounded-[2rem] bg-white/[0.02] backdrop-blur-xl border border-violet-500/10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-transparent pointer-events-none" />
                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                        {/* QR */}
                        <div className="relative group w-36 h-36 md:w-40 md:h-40 shrink-0">
                            <div className="absolute -inset-2 bg-blue-600/5 rounded-2xl blur-xl group-hover:bg-blue-600/10 transition-all duration-700" />
                            <div className="relative w-full h-full p-3 rounded-2xl bg-white border border-black/5 flex items-center justify-center shadow-sm">
                                {qrData ? (
                                    <img src={qrData} alt="QR Identity" className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="animate-pulse w-full h-full bg-slate-50 rounded-xl" />
                                )}
                            </div>
                        </div>

                        {/* Identity Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-[22px] font-black tracking-tight text-white">@{username}</h2>
                            <p className="text-[10px] font-mono text-zinc-600 mt-1 break-all">{profile.peerId.substring(0, 24)}…</p>
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-mono uppercase tracking-wider transition-all ${copied ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-zinc-900/60 border-white/[0.04] text-zinc-500 hover:text-white"}`}
                                >
                                    {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                                <button
                                    onClick={() => { if (navigator.share) navigator.share({ title: "NANDIX ID", text: profile.peerId }); else handleCopy(); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/[0.04] text-[9px] font-mono uppercase tracking-wider text-zinc-500 hover:text-white transition-all"
                                >
                                    <Share2 className="w-2.5 h-2.5" />
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ STATS DASHBOARD ═══ */}
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: "Trust", value: "100", icon: <Shield className="w-3 h-3" />, color: "emerald" },
                        { label: "Messages", value: `${msgCount ?? 0}`, icon: <MessageCircle className="w-3 h-3" />, color: "cyan" },
                        { label: "Files", value: `${fileCount ?? 0}`, icon: <HardDrive className="w-3 h-3" />, color: "violet" },
                        { label: "Contacts", value: `${contactCount ?? 0}`, icon: <Users className="w-3 h-3" />, color: "rose" },
                    ].map((stat, i) => {
                        const colorPrefix: Record<string, string> = {
                            emerald: "text-emerald-500/50",
                            cyan: "text-cyan-500/50",
                            violet: "text-violet-500/50",
                            rose: "text-rose-500/50",
                        };
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all text-center"
                            >
                                <div className={`${colorPrefix[stat.color as keyof typeof colorPrefix]} mx-auto mb-1.5`}>{stat.icon}</div>
                                <div className="text-[16px] font-black text-white tabular-nums">{stat.value}</div>
                                <div className="text-[7px] font-black uppercase tracking-[0.2em] text-zinc-600">{stat.label}</div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* ═══ EDIT PROFILE CARD ═══ */}
                <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
                    <div className="flex items-center gap-3">
                        <Edit3 className="w-4 h-4 text-violet-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Profile Parameters</span>
                    </div>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block ml-1">Identity Tag</label>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/5 rounded-2xl px-5 py-4 text-[14px] text-zinc-200 outline-none border border-white/5 focus:border-violet-500/50 focus:bg-white/[0.08] transition-all"
                                placeholder="Enter tag..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block ml-1">Sub-Space Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-white/5 rounded-2xl px-5 py-4 text-[14px] text-zinc-200 outline-none border border-white/5 focus:border-violet-500/50 focus:bg-white/[0.08] transition-all resize-none"
                                placeholder="Broadcast your intent..."
                                rows={2}
                            />
                        </div>
                        <button
                            onClick={() => onSave({ ...profile, username, bio })}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-[11px] font-black uppercase tracking-[0.25em] shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:shadow-[0_15px_40px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                        >
                            Sync Identity
                        </button>
                    </div>
                </div>

                {/* ═══ CROSS-LINK MODULE ═══ */}
                <div className="glass-panel p-8 rounded-[2.5rem] border-white/5">
                    <LinkingShard myId={profile.peerId} />
                </div>

                {/* ═══ REPUTATION ═══ */}
                <div className="glass-panel p-8 rounded-[2.5rem] border-white/5">
                    <ReputationShard peerId={profile.peerId} isMe={true} />
                </div>

                {/* ═══ BOT LABORATORY ═══ */}
                <div className="glass-panel p-8 rounded-[2.5rem] border-white/5">
                    <BotLaboratory shards={shards} onToggle={onToggleShard} />
                </div>

                {/* ═══ TECH STACK FOOTER ═══ */}
                <div className="grid grid-cols-3 gap-3 pt-2 pb-8">
                    {[
                        { icon: <Shield className="w-4 h-4 text-emerald-500/40" />, label: "E2E Encrypted", sub: "AES-256-GCM" },
                        { icon: <Wifi className="w-4 h-4 text-violet-500/40" />, label: "P2P Mesh", sub: "WebRTC" },
                        { icon: <Database className="w-4 h-4 text-cyan-500/40" />, label: "Local DB", sub: "IndexedDB" },
                    ].map((item) => (
                        <div key={item.label} className="flex flex-col items-center gap-1.5 py-4 rounded-xl bg-slate-50 border border-black/[0.03] shadow-sm">
                            {item.icon}
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                            <span className="text-[7px] font-mono text-slate-500">{item.sub}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function LinkingShard({ myId }: { myId: string }) {
    const [pairingCode, setPairingCode] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [mode, setMode] = useState<"none" | "bridge" | "link">("none");

    const generateBridge = () => {
        const secret = Math.random().toString(36).substring(2, 8).toUpperCase();
        setPairingCode(`${myId}:${secret}`);
        setMode("bridge");
    };

    const handleLink = () => {
        const [targetId, secret] = joinCode.split(":");
        if (targetId && secret) {
            mesh.requestPairing(targetId, secret);
            setMode("link");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-500/60">Cross-Link Module</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode(mode === "bridge" ? "none" : "bridge")}
                        className={`px-4 py-2 rounded-lg text-[9px] font-bold tracking-tight transition-all ${mode === "bridge" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-100 text-slate-500 border border-black/5 hover:bg-slate-200"}`}
                    >
                        BRIDGE
                    </button>
                    <button
                        onClick={() => setMode(mode === "link" ? "none" : "link")}
                        className={`px-4 py-2 rounded-lg text-[9px] font-bold tracking-tight transition-all ${mode === "link" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-100 text-slate-500 border border-black/5 hover:bg-slate-200"}`}
                    >
                        LINK
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mode === "bridge" && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3"
                    >
                        {!pairingCode ? (
                            <button
                                onClick={generateBridge}
                                className="w-full py-4 rounded-xl bg-blue-600/5 border border-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                                Generate Bridging Secret
                            </button>
                        ) : (
                            <div className="p-5 rounded-xl bg-slate-50 border border-blue-500/10 text-center shadow-inner">
                                <span className="text-[8px] text-slate-400 block mb-2 uppercase tracking-widest font-bold">Your One-Time Bridge Code</span>
                                <div className="text-[18px] font-mono text-blue-600 tracking-tighter select-all font-black">{pairingCode}</div>
                                <p className="text-[9px] text-slate-500 mt-3 leading-relaxed">
                                    Send this to your secondary device. It expires when you close this view.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

                {mode === "link" && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3"
                    >
                        <input
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="nandix-XXXX:SECRET"
                            className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[12px] text-slate-900 placeholder-slate-300 outline-none font-mono border border-black/[0.04] focus:border-blue-500/20 transition-all"
                        />
                        <button
                            onClick={handleLink}
                            className="w-full py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all"
                        >
                            Request Link
                        </button>
                        <p className="text-[9px] text-zinc-500 text-center px-4">
                            Ensure the primary device is open and showing the bridge code.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function PairingDialog({ request, onAccept, onReject }: { request: { peerId: string; secret: string }; onAccept: () => void; onReject: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-3xl">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm p-10 bg-white/80 backdrop-blur-2xl border border-black/5 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Share2 className="w-10 h-10 text-blue-600 animate-pulse" />
                </div>
                <h3 className="display-sm font-black tracking-tight text-slate-900 mb-3">Bridge Link</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-10">
                    A node with ID <span className="text-blue-600 font-mono font-bold">{request.peerId.substring(0, 12)}...</span> is requesting a sub-space bridge.
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={onReject}
                        className="flex-1 py-4 rounded-2xl bg-slate-100 border border-black/5 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                        Deny
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 py-4 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                    >
                        Accept
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function VoidStats() {
    const { connectedPeers } = useMesh();
    const fileCount = useLiveQuery(() => (db as any).files.count(), []);
    const msgCount = useLiveQuery(() => db.messages.count(), []);

    const stats = [
        { label: "Neural Load", value: `${(fileCount ?? 0) + (msgCount ?? 0)}`, icon: <Database className="w-3 h-3" />, color: "violet", delay: 0.6 },
        { label: "Blue Wire", value: `${fileCount ?? 0}`, icon: <Database className="w-3 h-3" />, color: "cyan", delay: 0.7 },
        { label: "Green Wire", value: `${msgCount ?? 0}`, icon: <Share2 className="w-3 h-3" />, color: "emerald", delay: 0.8 },
        { label: "Mesh Pulse", value: `${connectedPeers}`, icon: <Wifi className="w-3 h-3" />, color: "rose", delay: 0.9 },
    ];

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 20 }}
            className="fixed left-7 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4"
        >
            {stats.map((s, i) => (
                <StatShard key={s.label} {...s} index={i} />
            ))}
        </motion.div>
    );
}

function StatShard({ label, value, icon, color, delay, index }: { label: string; value: string; icon: React.ReactNode; color: string; delay: number; index: number }) {
    const colorClasses: Record<string, { text: string; border: string; ring: string; shadow: string; glow: string }> = {
        violet: { text: "text-violet-400", border: "border-violet-500/20", ring: "bg-violet-500", shadow: "shadow-violet-500/10", glow: "from-violet-500/20 to-transparent" },
        cyan: { text: "text-cyan-400", border: "border-cyan-500/20", ring: "bg-cyan-500", shadow: "shadow-cyan-500/10", glow: "from-cyan-500/20 to-transparent" },
        emerald: { text: "text-emerald-400", border: "border-emerald-500/20", ring: "bg-emerald-500", shadow: "shadow-emerald-500/10", glow: "from-emerald-500/20 to-transparent" },
        rose: { text: "text-rose-400", border: "border-rose-500/20", ring: "bg-rose-500", shadow: "shadow-rose-500/10", glow: "from-rose-500/20 to-transparent" },
        amber: { text: "text-amber-400", border: "border-amber-500/20", ring: "bg-amber-500", shadow: "shadow-amber-500/10", glow: "from-amber-500/20 to-transparent" },
    };
    const c = colorClasses[color] || colorClasses.violet;

    return (
        <motion.div
            initial={{ x: -40, opacity: 0, scale: 0.5, rotateY: -45 }}
            animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay, type: "spring", stiffness: 200, damping: 25 }}
            whileHover={{
                scale: 1.1,
                x: 10,
                transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
            className={`relative w-16 h-16 rounded-3xl bg-white/40 backdrop-blur-3xl border border-black/5 shadow-sm group isolation-auto`}
        >
            {/* Inner Glow Gradient */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${c.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Neural Breathing Ring */}
            <motion.div
                animate={{
                    scale: [0.9, 1.6, 0.9],
                    opacity: [0.2, 0, 0.2]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                }}
                className={`absolute inset-0 rounded-3xl ${c.ring} blur-md`}
            />

            {/* Micro Pulse Core */}
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={c.text}
            >
                {icon}
            </motion.div>

            <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-blue-600 transition-colors duration-300 tracking-tighter tabular-nums z-10">
                {value}
            </span>

            {/* High-Fidelity Tooltip */}
            <div className="absolute left-[calc(100%+14px)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none z-50">
                <div className="relative px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-black/5 shadow-2xl overflow-hidden min-w-[120px]">
                    {/* Tooltip Accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.ring}`} />

                    <div className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-0.5">{color.toUpperCase()} MODULE</div>
                    <div className="text-[11px] font-bold text-slate-900 tracking-tight">{label}</div>

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />
                </div>

                {/* Arrow */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-white border-l border-b border-black/5 -mr-[5px]" />
            </div>
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CALL OVERLAY: The Sovereign Bridge
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function CallOverlay({ state, type, peerId, remoteStream, localStream, isAudioMuted, isVideoOff, onAccept, onEnd, onToggleAudio, onToggleVideo }: any) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 bg-slate-900/40 backdrop-blur-3xl"
        >
            <div className="relative w-full max-w-2xl aspect-video md:aspect-video rounded-[3rem] bg-white border border-black/5 overflow-hidden shadow-2xl flex flex-col">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent z-30" />

                {/* Visual Background (Remote Video or Ambient) */}
                <div className="absolute inset-0 z-0 text-slate-500">
                    {type === "video" && remoteStream ? (
                        <StreamPreview stream={remoteStream} muted={false} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="w-64 h-64 rounded-full bg-blue-500/10 blur-[100px]"
                            />
                        </div>
                    )}
                </div>

                {/* Local Preview (PiP) */}
                {type === "video" && localStream && state === "active" && (
                    <div className="absolute top-8 right-8 w-32 h-44 rounded-2xl border border-black/5 overflow-hidden z-20 shadow-xl bg-slate-100">
                        <StreamPreview stream={localStream} muted={true} className="w-full h-full object-cover" />
                        {isVideoOff && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                                <VideoOff className="w-4 h-4 text-slate-400" />
                            </div>
                        )}
                    </div>
                )}

                {/* Content Overlay */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-12">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 border border-black/5 flex items-center justify-center mb-8 relative">
                        <User className="w-8 h-8 text-slate-400" />
                        {(state === "calling" || state === "incoming") && (
                            <motion.div
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-[2.5rem] border border-blue-500"
                            />
                        )}
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">
                        {peerId?.substring(0, 12)}
                    </h2>
                    <p className="text-xs uppercase tracking-[0.3em] font-black text-slate-400">
                        {state === "calling" ? "Requesting Entry..." :
                            state === "incoming" ? "Incoming Transmission" :
                                state === "active" ? "Sub-Space Link Active" : ""}
                    </p>

                    {state === "incoming" && (
                        <div className="mt-12 flex gap-8">
                            <button
                                onClick={onEnd}
                                className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                            >
                                <PhoneOff className="w-6 h-6" />
                            </button>
                            <button
                                onClick={onAccept}
                                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-emerald-950 hover:scale-110 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                            >
                                <Phone className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Controls (Active/Calling) */}
                {state !== "incoming" && (
                    <div className="relative z-20 p-8 flex items-center justify-center gap-6">
                        <button
                            onClick={onToggleAudio}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isAudioMuted ? 'bg-rose-500/20 border-rose-500/30 text-rose-500' : 'bg-slate-100 border-black/5 text-slate-500 hover:text-blue-600'}`}
                        >
                            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={onEnd}
                            className="w-16 h-16 rounded-[2rem] bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-all shadow-lg"
                        >
                            <PhoneOff className="w-6 h-6" />
                        </button>

                        {type === "video" && (
                            <button
                                onClick={onToggleVideo}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isVideoOff ? 'bg-rose-500/20 border-rose-500/30 text-rose-500' : 'bg-slate-100 border-black/5 text-slate-500 hover:text-blue-600'}`}
                            >
                                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function StreamPreview({ stream, muted, className }: { stream: MediaStream; muted: boolean; className?: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            className={className}
        />
    );
}

function BotLaboratory({ shards, onToggle }: { shards: BotShard[]; onToggle: (id: string, enabled: boolean) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-violet-500/60">Bot Laboratory</span>
                <Cpu className="w-3 h-3 text-violet-500/40" />
            </div>

            <div className="grid grid-cols-1 gap-2">
                {shards.map((shard) => (
                    <div
                        key={shard.id}
                        className={`p-4 rounded-2xl border transition-all ${shard.enabled ? "bg-violet-500/5 border-violet-500/20" : "bg-black/20 border-white/[0.02]"}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h4 className={`text-[11px] font-bold ${shard.enabled ? "text-violet-400" : "text-zinc-500"}`}>{shard.name}</h4>
                                <p className="text-[9px] text-zinc-600 leading-relaxed max-w-[180px]">{shard.description}</p>
                            </div>
                            <button
                                onClick={() => onToggle(shard.id, !shard.enabled)}
                                className={`w-10 h-6 rounded-full relative transition-all ${shard.enabled ? "bg-violet-500" : "bg-zinc-800"}`}
                            >
                                <motion.div
                                    animate={{ x: shard.enabled ? 18 : 2 }}
                                    className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow-sm"
                                />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReputationShard({ peerId, isMe }: { peerId: string; isMe: boolean }) {
    const contact = useLiveQuery(() => db.contacts.get(peerId), [peerId]);

    const score = contact?.trustScore || 10;
    const vouches = contact?.vouchedBy?.length || 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/60">Sovereign Reputation</span>
                    <Shield className="w-3 h-3 text-emerald-500/40" />
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 p-5 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] flex flex-col items-center group hover:bg-white/[0.04] transition-all">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Mesh Trust</span>
                        <span className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">{score}</span>
                    </div>
                    <div className="flex-1 p-5 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] flex flex-col items-center group hover:bg-white/[0.04] transition-all">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Vouches</span>
                        <span className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">{vouches}</span>
                    </div>
                </div>

                {!isMe && (
                    <button
                        onClick={() => {
                            const level = prompt("Vouch for this peer? Enter trust level (1-10):", "5");
                            if (level && !isNaN(parseInt(level))) {
                                mesh.vouchForPeer(peerId, parseInt(level));
                                alert("Vouch broadcasted to the mesh! 🛡️");
                            }
                        }}
                        className="w-full py-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-emerald-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] active:scale-[0.98]"
                    >
                        Forge Vouch Shard
                    </button>
                )}
            </div>
        </div>
    );
}

function TrustStats({ peerId }: { peerId: string }) {
    const contact = useLiveQuery(() => db.contacts.get(peerId), [peerId]);
    if (!contact) return null;

    return (
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] group hover:border-emerald-500/40 transition-all">
            <Shield className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest leading-none">Reputation</span>
                <span className="text-sm font-mono font-black text-white leading-none mt-1">{contact.trustScore || 10}</span>
            </div>
        </div>
    );
}
