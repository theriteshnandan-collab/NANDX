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
    Settings, QrCode, Edit3, Phone, PhoneOff, VideoOff, Volume2, VolumeX, Video, Globe
} from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NANDIX OS: THE VOID
// A spatial, physics-based sovereign interface.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const modes: VoidMode[] = ["TALK", "DROP", "RADAR", "PROFILE"];

export default function NandixOS() {
    const [mode, setMode] = useState<VoidMode>("TALK");
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
        <div className="relative w-screen h-screen overflow-hidden bg-[#000000] text-white selection:bg-emerald-500/30">
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
            <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-8 h-14">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">
                        Sovereign Mesh
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[8px] font-mono text-zinc-700 tracking-wider">
                        {myId ? myId.substring(0, 12) + "..." : "Initializing..."}
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-zinc-900/60 border border-white/5 flex items-center justify-center">
                        <Shield className="w-3 h-3 text-zinc-600" />
                    </div>
                </div>

                {/* ☢️ REACTOR HUD */}
                <div className="absolute top-14 left-8 flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md">
                        <Zap className="w-3 h-3 text-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Reactor Online</span>
                    </div>
                    {/* ⚙️ KERNEL HEARTBEAT */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/5 border border-cyan-500/10 backdrop-blur-md">
                        <Activity className="w-3 h-3 text-cyan-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Kernel: {kernel.getUptime()}ms</span>
                    </div>
                </div>
            </header>

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
                        <div className="px-8 py-4 rounded-2xl bg-zinc-950/80 backdrop-blur-3xl border border-cyan-500/20 flex items-center gap-5">
                            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
                                    Blue Wire Active
                                </div>
                                <div className="text-[9px] text-zinc-600 font-mono mt-0.5">
                                    {streamProgress.file} · {streamProgress.percent.toFixed(0)}%
                                </div>
                            </div>
                            <div className="w-32 h-1 bg-zinc-900 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ width: `${streamProgress.percent}%` }}
                                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT: The Void Canvas */}
            <main className="relative w-full h-full z-10 pt-14 pb-20 md:pb-32">
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
                            <RadarView
                                key="radar"
                                myId={myId}
                                connectedPeers={connectedPeers}
                                discoveredRooms={discoveredRooms}
                            />
                        )}
                        {mode === "PROFILE" && <ProfileView
                            key="profile"
                            profile={myProfile}
                            shards={botShards}
                            onToggleShard={(id, enabled) => {
                                botManagerRef.current?.toggleShard(id, enabled);
                                setBotShards([...(botManagerRef.current?.getShards() || [])]);
                            }}
                            onSave={async (p) => { await setMyProfile(p); setMyProfileState(p); mesh.sendProfile(p); }}
                        />}
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

            {/* SIDE STATS: Floating Shards */}
            <VoidStats />
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TALK VIEW: Data Shards (Not Bubbles)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function TalkView({ messages, sendMessage, sendMediaMessage, myId, activeTopic, rooms, onSwitchTopic, onCreateRoom, onCall, showRegistry, setShowRegistry }: { messages: any[]; sendMessage: (text: string) => void; sendMediaMessage: (mediaType: "image" | "voice" | "file", mediaData: string, text?: string, mediaName?: string) => void; myId: string | null; activeTopic: string; rooms: ChatRoom[]; onSwitchTopic: (topic: string) => void; onCreateRoom: (name: string) => void; onCall: (peerId: string, type: "voice" | "video") => void; showRegistry: boolean; setShowRegistry: (show: boolean) => void }) {
    const [input, setInput] = useState("");
    const [peerTyping, setPeerTyping] = useState<string | null>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const [showRooms, setShowRooms] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Voice Message Hook
    const { isRecording, formattedDuration, startRecording, stopRecording, cancelRecording } = useVoiceMessage();

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle Image Selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            sendMediaMessage("image", base64, "", file.name);
        };
        reader.readAsDataURL(file);

        // Reset input
        e.target.value = "";
    };

    const handleVoiceSend = async () => {
        const base64 = await stopRecording();
        if (base64) {
            sendMediaMessage("voice", base64);
        }
    };

    // Listen for typing indicators
    useEffect(() => {
        mesh.onTyping((peerId, isTyping) => {
            if (isTyping) {
                setPeerTyping(peerId.substring(0, 8));
                // Auto-clear after 3s
                if (typingTimeout.current) clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => setPeerTyping(null), 3000);
            } else {
                setPeerTyping(null);
            }
        });
    }, []);

    // Debounced typing sender
    const sendTypingRef = useRef<NodeJS.Timeout | null>(null);
    const handleInputChange = useCallback((value: string) => {
        setInput(value);
        if (value.trim()) {
            mesh.sendTyping(true);
            if (sendTypingRef.current) clearTimeout(sendTypingRef.current);
            sendTypingRef.current = setTimeout(() => mesh.sendTyping(false), 2000);
        }
    }, []);

    // Filter messages for search
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="h-full flex flex-col max-w-4xl mx-auto px-6 md:px-12"
        >
            {/* ═══ CONSOLIDATED HEADER ═══ */}
            <div className="flex items-center justify-between pt-4 pb-4 border-b border-white/[0.03] gap-2 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={() => setShowRooms(!showRooms)}
                        className="flex items-center gap-2 px-3 py-2 md:py-1.5 rounded-lg bg-zinc-900/60 border border-white/[0.04] text-[11px] font-bold text-zinc-300 hover:text-white transition-all active:scale-95"
                    >
                        <Hash className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="truncate max-w-[80px] md:max-w-none">
                            {activeTopic === "general" ? "general" : rooms.find(r => r.id === activeTopic)?.name || activeTopic}
                        </span>
                    </button>
                    {activeTopic !== "general" && (
                        <button
                            onClick={() => onSwitchTopic("general")}
                            className="flex items-center gap-1 text-[9px] font-mono text-zinc-600 hover:text-zinc-400 transition-all"
                        >
                            <ChevronLeft className="w-3 h-3" /> back
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 md:gap-3">
                    <button
                        onClick={() => onCall(activeTopic, "voice")}
                        className="p-2.5 md:p-2 rounded-lg text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-90"
                        title="Voice Call"
                    >
                        <Phone className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onCall(activeTopic, "video")}
                        className="p-2.5 md:p-2 rounded-lg text-zinc-600 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all active:scale-90"
                        title="Video Call"
                    >
                        <Video className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                        {isSearching && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 140, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="overflow-hidden hidden md:block"
                            >
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-zinc-950 border border-white/5 rounded-lg px-3 py-1.5 text-[11px] text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/30"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => { setIsSearching(!isSearching); if (isSearching) setSearchQuery(""); }}
                        className={`p-2.5 md:p-2 rounded-lg transition-colors active:scale-90 ${isSearching ? 'bg-emerald-500/10 text-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setShowRegistry(!showRegistry)}
                        className={`w-9 h-9 md:w-7 md:h-7 rounded-lg border flex items-center justify-center transition-all active:scale-90 ${showRegistry ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-zinc-900/60 border-white/[0.04] text-zinc-600 hover:text-cyan-400 hover:border-cyan-500/20'}`}
                        title="Discovery Lounge"
                    >
                        <Globe className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={() => {
                            const name = prompt("Room name:");
                            if (name?.trim()) onCreateRoom(name.trim());
                        }}
                        className="w-9 h-9 md:w-7 md:h-7 rounded-lg bg-zinc-900/60 border border-white/[0.04] flex items-center justify-center text-zinc-600 hover:text-emerald-400 hover:border-emerald-500/20 transition-all active:scale-90"
                        title="Create Room"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Room Drawer */}
            <AnimatePresence>
                {showRooms && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-white/[0.03]"
                    >
                        <div className="py-3 space-y-1">
                            <button
                                onClick={() => { onSwitchTopic("general"); setShowRooms(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-mono transition-all ${activeTopic === "general" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
                                    }`}
                            >
                                <Hash className="w-3 h-3" /> general
                            </button>
                            {rooms.map((room) => (
                                <div key={room.id} className="flex items-center gap-1">
                                    <button
                                        onClick={() => { onSwitchTopic(room.id); setShowRooms(false); }}
                                        className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-mono transition-all ${activeTopic === room.id ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
                                            }`}
                                    >
                                        <Users className="w-3 h-3" /> {room.name}
                                        <span className="text-[8px] text-zinc-700 ml-auto">{room.members.length} members</span>
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const isPublic = !room.isPublic;
                                            const description = isPublic ? (prompt("Enter room description:") || "") : "";
                                            await updateRoomPrivacy(room.id, isPublic, description);
                                        }}
                                        className={`w-6 h-6 rounded flex items-center justify-center transition-all ${room.isPublic ? 'text-emerald-500 hover:text-emerald-400' : 'text-zinc-700 hover:text-zinc-500'}`}
                                        title={room.isPublic ? "Make Private" : "Make Public"}
                                    >
                                        <Radio className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                        onClick={() => deleteRoom(room.id)}
                                        className="w-6 h-6 rounded flex items-center justify-center text-zinc-700 hover:text-rose-500 transition-all"
                                    >
                                        <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Message Shards Container */}
            <div className="flex-1 overflow-y-auto pt-8 md:pt-12 pb-8 pr-2 md:pr-4 custom-scrollbar space-y-2">
                {filteredMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center gap-6 opacity-30">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 rounded-[2rem] border border-white/5 flex items-center justify-center bg-white/[0.01]"
                        >
                            <div className="w-10 h-10 rounded-full border border-emerald-500/20 flex items-center justify-center">
                                <Radio className="w-4 h-4 text-emerald-500/40" />
                            </div>
                        </motion.div>
                        <p className="text-[10px] text-zinc-700 uppercase tracking-[0.5em] font-black">
                            {searchQuery ? "No shards found" : "Awaiting Signal"}
                        </p>
                    </div>
                )}

                {filteredMessages.map((msg: any, i: number) => {
                    const isMe = msg.sender === myId;
                    const isEncrypted = msg.encrypted || sovereignCrypto.hasKeyFor(msg.sender);
                    return (
                        <motion.div
                            key={msg.id || i}
                            initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{
                                delay: Math.min(i * 0.03, 0.5),
                                type: "spring",
                                stiffness: 500,
                                damping: 28
                            }}
                            className={`group flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`relative max-w-[90%] md:max-w-[85%] px-5 md:px-7 py-3 md:py-4 transition-all duration-500 ${isMe
                                ? "bg-emerald-500/[0.03] border-r-2 border-emerald-500/20 rounded-l-2xl md:rounded-l-3xl rounded-tr-lg"
                                : "bg-white/[0.01] border-l-2 border-white/[0.05] rounded-r-2xl md:rounded-r-3xl rounded-tl-lg"
                                }`}>
                                {/* Light Streak Effect */}
                                <div className={`absolute top-0 ${isMe ? 'right-0' : 'left-0'} w-12 h-[1px] bg-gradient-to-r ${isMe ? 'from-transparent to-emerald-500/40' : 'from-white/10 to-transparent'}`} />

                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-[0.4rem] bg-zinc-900 border border-white/5 flex items-center justify-center">
                                            <User className="w-2 h-2 text-zinc-600" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                                            {isMe ? "You" : msg.sender?.substring(0, 8)}
                                        </span>
                                    </div>
                                    {isEncrypted && (
                                        <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity" title="E2EE Secured">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
                                            <Shield className="w-2.5 h-2.5 text-emerald-500/60" />
                                        </div>
                                    )}
                                </div>

                                {msg.mediaType === "image" && msg.mediaData && (
                                    <div className="mb-4 rounded-xl overflow-hidden border border-white/5 bg-zinc-900/40 aspect-auto">
                                        <img
                                            src={msg.mediaData}
                                            alt={msg.mediaName || "Image"}
                                            className="w-full h-auto max-h-[300px] object-contain"
                                        />
                                    </div>
                                )}

                                {msg.mediaType === "voice" && msg.mediaData && (
                                    <div className="mb-4 px-4 py-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <Play className="w-3 h-3 text-emerald-400" />
                                        </div>
                                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full relative overflow-hidden">
                                            <div className="absolute inset-y-0 left-0 w-1/3 bg-emerald-500/40" />
                                        </div>
                                        <audio src={msg.mediaData} controls className="hidden" />
                                        <span className="text-[10px] font-mono text-zinc-500">VOICE</span>
                                    </div>
                                )}

                                {msg.text && (
                                    <>
                                        <p className="text-[14px] text-zinc-300 leading-relaxed font-normal tracking-tight selection:bg-emerald-500 selection:text-emerald-950">
                                            {msg.text}
                                        </p>
                                        {(() => {
                                            const urlMatch = msg.text.match(/https?:\/\/[^\s]+/);
                                            if (urlMatch) {
                                                return (
                                                    <div className="mt-3">
                                                        <LinkPreview url={urlMatch[0]} />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </>
                                )}

                                <div className="flex items-center justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[8px] text-zinc-800 font-mono tracking-widest">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                    </span>
                                    {isMe && (
                                        <div className="flex items-center gap-0.5">
                                            {msg.deliveryStatus === "pending" && (
                                                <motion.div
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                >
                                                    <Clock className="w-2.5 h-2.5 text-zinc-600" />
                                                </motion.div>
                                            )}
                                            {msg.deliveryStatus === "sent" && <Check className="w-2.5 h-2.5 text-emerald-500/40" />}
                                            {msg.deliveryStatus === "delivered" && <CheckCheck className="w-2.5 h-2.5 text-emerald-500" />}
                                            {!msg.deliveryStatus && <Check className="w-2.5 h-2.5 text-emerald-500/40" />}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={endRef} className="h-4" />
            </div>

            {/* Typing Indicator */}
            <AnimatePresence>
                {peerTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="px-6 py-2"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-[9px] text-zinc-600 font-mono">{peerTyping} is typing</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Section */}
            <div className="pb-8 pt-4">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-[2.2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />

                    <div className="relative flex items-center gap-4 px-7 py-5 rounded-[2rem] bg-zinc-950/40 backdrop-blur-3xl border border-white/[0.03] group-focus-within:border-emerald-500/20 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

                        {!isRecording ? (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-10 h-10 rounded-2xl bg-zinc-900/40 border border-white/5 flex items-center justify-center shrink-0 hover:border-emerald-500/30 transition-all"
                                >
                                    <ImageIcon className="w-4 h-4 text-zinc-600" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />

                                <input
                                    value={input}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Type into the collective consciousness..."
                                    className="flex-1 bg-transparent text-[14px] text-zinc-200 placeholder-zinc-800 outline-none font-medium tracking-tight"
                                />

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={startRecording}
                                        className="w-10 h-10 rounded-2xl bg-zinc-900/40 border border-white/5 flex items-center justify-center shrink-0 hover:border-emerald-500/30 transition-all"
                                    >
                                        <Mic className="w-4 h-4 text-zinc-600" />
                                    </button>

                                    <motion.button
                                        whileHover={{ scale: 1.05, x: 2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSend}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${input.trim()
                                            ? 'bg-emerald-500 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                            : 'bg-zinc-900 text-zinc-700 opacity-50'
                                            }`}
                                    >
                                        <Send className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-[12px] font-mono text-zinc-400 tabular-nums">{formattedDuration}</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600">Recording Data...</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={cancelRecording}
                                        className="px-4 py-2 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-rose-500 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleVoiceSend}
                                        className="px-6 py-2 rounded-xl bg-emerald-500 text-emerald-950 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                    >
                                        Push Shard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DROP VIEW: The Wormhole (Blue Wire)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function DropView({ streamProgress }: any) {
    const [dragging, setDragging] = useState(false);
    const recentFiles = useLiveQuery(
        () => (db as any).files.orderBy("timestamp").reverse().limit(5).toArray(),
        []
    );

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) mesh.streamFile(file);
    };

    // 🧠 LEARNING: Circular progress using SVG.
    // dasharray = circumference. dashoffset = 1 - percentage.
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (streamProgress.percent / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            className="h-full flex flex-col items-center px-6 md:px-12 custom-scrollbar overflow-y-auto"
        >
            {/* Drop Zone: The Wormhole */}
            <div className="flex-1 flex items-center justify-center w-full max-w-2xl py-8 md:py-12">
                <motion.div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center group"
                >
                    {/* Liquid Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="50%" cy="50%" r="40%"
                            fill="transparent"
                            stroke="rgba(255,255,255,0.02)"
                            strokeWidth="2"
                        />
                        <motion.circle
                            cx="50%" cy="50%" r="40%"
                            fill="transparent"
                            stroke="url(#blue-gradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            style={{ strokeDasharray: circumference }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        />
                        <defs>
                            <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22D3EE" />
                                <stop offset="100%" stopColor="#3B82F6" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Ambient Glow */}
                    <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-1000 ${dragging ? 'bg-cyan-500/10 scale-125' : 'bg-white/[0.02] scale-100'
                        }`} />

                    {/* Core Shard */}
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <motion.div
                            animate={{
                                backgroundColor: dragging ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.02)",
                                scale: dragging ? 1.1 : 1,
                                rotate: dragging ? 45 : 0
                            }}
                            className="w-24 h-24 rounded-[2rem] border border-white/10 flex items-center justify-center backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <Share2 className={`w-8 h-8 ${dragging ? 'text-cyan-400' : 'text-zinc-600'}`} />
                        </motion.div>
                        <div className="text-center">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-300">
                                {streamProgress.percent > 0 ? `${streamProgress.percent}%` : "Wormhole"}
                            </h2>
                            <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest mt-1">
                                {dragging ? "Release to Send" : "Drop Files"}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Ghost Log */}
            {recentFiles && recentFiles.length > 0 && (
                <div className="w-full max-w-2xl pb-12 space-y-3">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        <span className="px-6 text-[9px] font-black tracking-[0.6em] text-zinc-800 uppercase">Archive</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </div>
                    {recentFiles.map((file: any, i: number) => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-6 px-7 py-4 rounded-3xl bg-zinc-950/20 border border-white/[0.02] hover:border-white/5 group transition-all"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center">
                                {file.direction === "sent"
                                    ? <ArrowUpRight className="w-4 h-4 text-cyan-500/50" />
                                    : <ArrowDownLeft className="w-4 h-4 text-emerald-500/50" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-bold text-zinc-300 truncate tracking-tight">{file.name}</div>
                                <div className="text-[9px] text-zinc-700 font-mono mt-0.5">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.status}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
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
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-full max-w-lg"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-rose-500/20 border border-violet-500/20 flex items-center justify-center"
                    >
                        <Key className="w-7 h-7 text-violet-400" />
                    </motion.div>
                    <h2 className="text-xl font-black tracking-wide text-white">Your Magic Words</h2>
                    <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed max-w-xs mx-auto">
                        These 12 words are your sovereign identity. Write them down.
                        They are the ONLY way to recover your account.
                    </p>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-6">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-500/80 leading-relaxed">
                        Never share these words. Anyone with them controls your identity. Store them offline.
                    </p>
                </div>

                {/* Word Grid */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {words.map((word, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.04]"
                        >
                            <span className="text-[9px] font-mono text-zinc-700 absolute top-1 left-2">{i + 1}</span>
                            <span className={`text-[13px] font-mono block text-center mt-1 ${showWords ? "text-white" : "text-transparent bg-zinc-800 rounded select-none"}`}>
                                {showWords ? word : "••••••"}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => setShowWords(!showWords)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 text-[11px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-all"
                    >
                        {showWords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showWords ? "Hide" : "Reveal"}
                    </button>
                    <button
                        onClick={handleCopyWords}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-[11px] font-mono uppercase tracking-wider transition-all ${copiedWords
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white"
                            }`}
                    >
                        {copiedWords ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedWords ? "Copied" : "Copy"}
                    </button>
                </div>

                {/* Confirmation */}
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-950/50 border border-white/[0.03] cursor-pointer mb-6">
                    <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-violet-500 focus:ring-violet-500/20"
                    />
                    <span className="text-[11px] text-zinc-400">
                        I have written down my Magic Words in a safe place
                    </span>
                </label>

                {/* Enter the Void */}
                <motion.button
                    whileHover={confirmed ? { scale: 1.02 } : {}}
                    whileTap={confirmed ? { scale: 0.98 } : {}}
                    onClick={confirmed ? onComplete : undefined}
                    className={`w-full py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] transition-all ${confirmed
                        ? "bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-[0_0_40px_rgba(139,92,246,0.2)] hover:shadow-[0_0_60px_rgba(139,92,246,0.3)] cursor-pointer"
                        : "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                        }`}
                >
                    Enter the Void
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
            <div className="flex gap-1 p-1 rounded-2xl bg-zinc-950/60 border border-white/5">
                <button
                    onClick={() => setTab("radar")}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === "radar" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                    Sonar
                </button>
                <button
                    onClick={() => setTab("lounge")}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === "lounge" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-600 hover:text-zinc-400"}`}
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border ${connectedPeers > 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-zinc-900/50 border-white/5"}`}
                    >
                        <Users className={`w-3 h-3 ${connectedPeers > 0 ? "text-emerald-400" : "text-zinc-600"}`} />
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${connectedPeers > 0 ? "text-emerald-400" : "text-zinc-600"}`}>
                            {connectedPeers > 0 ? `${connectedPeers} peer${connectedPeers > 1 ? "s" : ""} connected` : "No peers connected"}
                        </span>
                    </motion.div>

                    <div className="w-full flex flex-col gap-6">
                        {/* ═══ SOURCE IDENTITY CARD ═══ */}
                        <div className="relative p-6 md:p-7 rounded-[2.2rem] bg-zinc-950/40 backdrop-blur-3xl border border-white/[0.03]">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700">Your Sovereign ID</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${myId ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-zinc-800"} animate-pulse`} />
                                    <span className={`text-[8px] font-mono uppercase ${myId ? "text-emerald-500/80" : "text-zinc-800"}`}>
                                        {myId ? "Online" : "Linking..."}
                                    </span>
                                </div>
                            </div>

                            {/* The ID itself — large, prominent, selectable */}
                            <div className="py-3 px-4 rounded-2xl bg-black/40 border border-white/[0.02] mb-4">
                                <p className="text-[15px] md:text-[17px] font-mono text-white tracking-wide break-all leading-relaxed select-all">
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
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                        : myId
                                            ? "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
                                            : "bg-zinc-950 border-white/[0.02] text-zinc-800 cursor-not-allowed"
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
                                        ? "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
                                        : "bg-zinc-950 border-white/[0.02] text-zinc-800 cursor-not-allowed"
                                        }`}
                                >
                                    <Share2 className="w-3.5 h-3.5" />
                                    Share
                                </motion.button>
                            </div>
                        </div>

                        {/* ═══ TARGET SIGNAL INPUT ═══ */}
                        <div className="relative p-6 md:p-7 rounded-[2.2rem] bg-zinc-950/40 backdrop-blur-3xl border border-white/[0.03]">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 block mb-3">Connect to Peer</span>
                            <div className="flex items-center gap-3">
                                <input
                                    value={peerId}
                                    onChange={(e) => setPeerId(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                                    placeholder="Paste Sovereign ID here..."
                                    className="flex-1 bg-black/40 rounded-xl px-4 py-3 text-[13px] text-zinc-300 placeholder-zinc-800 outline-none font-mono border border-white/[0.02] focus:border-rose-500/20 transition-all"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleConnect}
                                    disabled={!peerId.trim()}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${connecting
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                        : peerId.trim()
                                            ? "bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-rose-950"
                                            : "bg-zinc-950 border border-white/[0.02] text-zinc-800"
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
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/30 border border-white/[0.02] group"
                                            >
                                                {/* Avatar */}
                                                <div className="relative">
                                                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                                                        <User className="w-3.5 h-3.5 text-zinc-600" />
                                                    </div>
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${isOnline ? "bg-emerald-500" : "bg-zinc-700"
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
                                                        <span className="text-[12px] font-semibold text-zinc-300 truncate">
                                                            {contact.nickname}
                                                        </span>
                                                        {contact.isBot && (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[7px] font-black text-violet-400 uppercase tracking-tighter">
                                                                <Cpu className="w-2 h-2" />
                                                                Bot
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-mono text-zinc-700 truncate">
                                                            {contact.peerId.substring(0, 16)}...
                                                        </span>

                                                        {/* Trust Shield */}
                                                        <div className={`flex items-center gap-1 px-1 rounded-md border ${(contact.trustScore || 0) > 70 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                                            (contact.trustScore || 0) > 30 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                                                "bg-zinc-900 border-white/5 text-zinc-600"
                                                            }`}>
                                                            <Shield className="w-2 h-2" />
                                                            <span className="text-[8px] font-black">{contact.trustScore || 10}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                {contact.messageCount > 0 && (
                                                    <span className="text-[8px] font-mono text-zinc-700 px-1.5 py-0.5 rounded bg-zinc-900">
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
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-mono uppercase tracking-wider transition-all ${showMyWords
                                    ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                                    : "bg-zinc-950/50 border-white/[0.03] text-zinc-600 hover:text-zinc-400"
                                    }`}
                            >
                                <Key className="w-3 h-3" />
                                My Words
                            </button>
                            <button
                                onClick={() => { setShowRecovery(!showRecovery); setShowMyWords(false); }}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-mono uppercase tracking-wider transition-all ${showRecovery
                                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                    : "bg-zinc-950/50 border-white/[0.03] text-zinc-600 hover:text-zinc-400"
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
                                                    <div className="p-5 rounded-[2rem] bg-zinc-950/40 backdrop-blur-3xl border border-rose-500/10">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-500/60 block mb-3">Enter 12 Magic Words</span>
                                                        <textarea
                                                            value={recoveryWords}
                                                            onChange={(e) => setRecoveryWords(e.target.value)}
                                                            placeholder="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
                                                            rows={3}
                                                            className="w-full bg-black/40 rounded-xl px-4 py-3 text-[12px] text-zinc-300 placeholder-zinc-800 outline-none font-mono border border-white/[0.02] focus:border-rose-500/20 transition-all resize-none"
                                                        />
                                                        <button
                                                            onClick={handleRecover}
                                                            disabled={recovering || !recoveryWords.trim()}
                                                            className={`w-full mt-3 py-3 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all ${recoveryWords.trim()
                                                                ? "bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-rose-950"
                                                                : "bg-zinc-950 border border-white/[0.02] text-zinc-800"
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
                                    <div className="p-5 rounded-[2rem] bg-zinc-950/40 backdrop-blur-3xl border border-rose-500/10">
                                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-500/60 block mb-3">Enter 12 Magic Words</span>
                                        <textarea
                                            value={recoveryWords}
                                            onChange={(e) => setRecoveryWords(e.target.value)}
                                            placeholder="word1 word2 word3..."
                                            rows={3}
                                            className="w-full bg-black/40 rounded-xl px-4 py-3 text-[12px] text-zinc-300 placeholder-zinc-800 outline-none font-mono border border-white/[0.02] focus:border-rose-500/20 transition-all resize-none"
                                        />
                                        <button
                                            onClick={handleRecover}
                                            disabled={recovering || !recoveryWords.trim()}
                                            className="w-full mt-3 py-3 rounded-xl bg-radius-500/10 border border-radius-500/20 text-rose-400 font-mono text-[11px] uppercase tracking-widest"
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
                                    className="p-6 rounded-[2rem] bg-zinc-950/40 backdrop-blur-3xl border border-white/5 flex items-center justify-between group"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[14px] font-black text-white">{room.name}</span>
                                            <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-mono text-emerald-500 uppercase">Public</div>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 max-w-xs">{room.description || "No description."}</p>
                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="flex items-center gap-1"><Users className="w-3 h-3 text-zinc-700" /><span className="text-[9px] font-mono text-zinc-600">{room.members?.length || 0}</span></div>
                                            <div className="flex items-center gap-1"><Cpu className="w-3 h-3 text-zinc-700" /><span className="text-[9px] font-mono text-zinc-600">via {room.host.substring(0, 8)}</span></div>
                                        </div>
                                    </div>
                                    <button onClick={() => { mesh.connectToPeer(room.host); db.rooms.put({ ...room, isPublic: false }); alert(`Joined ${room.name}!`); }} className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500"><Plus className="w-5 h-5" /></button>
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
            className="h-full max-w-2xl mx-auto px-4 md:px-6 pt-6 md:pt-12 pb-32"
        >
            <div className="space-y-6 md:space-y-8">
                {/* ═══ QR SHARD ═══ */}
                <div className="relative group mx-auto w-64 h-64">
                    <div className="absolute -inset-4 bg-violet-600/10 rounded-[2.5rem] blur-2xl group-hover:bg-violet-600/20 transition-all duration-700" />
                    <div className="relative w-full h-full p-4 rounded-[2rem] bg-zinc-950/40 backdrop-blur-3xl border border-violet-500/10 flex items-center justify-center overflow-hidden">
                        {qrData ? (
                            <img src={qrData} alt="QR Identity" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                            <div className="animate-pulse w-full h-full bg-zinc-900 rounded-xl" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-violet-600/10 to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* ═══ IDENTITY DATA ═══ */}
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-[24px] font-black tracking-tighter text-white">@{username}</h2>
                        <button
                            onClick={handleCopy}
                            className="text-[10px] font-mono text-zinc-600 hover:text-violet-400 transition-all uppercase tracking-widest mt-1 flex items-center gap-2 mx-auto"
                        >
                            {copied ? "Copied" : profile.peerId.substring(0, 16) + "..."}
                            <Copy className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="p-7 rounded-[2.2rem] bg-zinc-950/40 backdrop-blur-3xl border border-white/[0.03] space-y-5">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 block ml-1">Username</label>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-zinc-900/60 rounded-xl px-4 py-3 text-[14px] text-zinc-300 outline-none border border-white/5 focus:border-violet-500/30 transition-all"
                                placeholder="Enter username..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 block ml-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-zinc-900/60 rounded-xl px-4 py-3 text-[14px] text-zinc-300 outline-none border border-white/5 focus:border-violet-500/30 transition-all resize-none"
                                placeholder="Tell the void about yourself..."
                                rows={3}
                            />
                        </div>

                        <button
                            onClick={() => onSave({ ...profile, username, bio })}
                            className="w-full py-4 rounded-2xl bg-violet-600 text-violet-950 text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all"
                        >
                            Sync Soul
                        </button>

                        <div className="pt-4 border-t border-white/5">
                            <LinkingShard myId={profile.peerId} />
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <ReputationShard peerId={profile.peerId} isMe={true} />
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <BotLaboratory shards={shards} onToggle={onToggleShard} />
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-center gap-8 mt-12">
                        <div className="flex flex-col items-center gap-1">
                            <Shield className="w-4 h-4 text-emerald-500/40" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Encrypted</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Zap className="w-4 h-4 text-violet-500/40" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">P2P Mesh</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Database className="w-4 h-4 text-cyan-500/40" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Local DB</span>
                        </div>
                    </div>
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
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-mono transition-all ${mode === "bridge" ? "bg-cyan-500 text-cyan-950" : "bg-zinc-900 text-zinc-400 border border-white/5"}`}
                    >
                        BRIDGE
                    </button>
                    <button
                        onClick={() => setMode(mode === "link" ? "none" : "link")}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-mono transition-all ${mode === "link" ? "bg-emerald-500 text-emerald-950" : "bg-zinc-900 text-zinc-400 border border-white/5"}`}
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
                                className="w-full py-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-cyan-950 transition-all"
                            >
                                Generate Bridging Secret
                            </button>
                        ) : (
                            <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 text-center">
                                <span className="text-[8px] text-zinc-600 block mb-2 uppercase tracking-widest">Your One-Time Bridge Code</span>
                                <div className="text-[18px] font-mono text-cyan-400 tracking-tighter select-all">{pairingCode}</div>
                                <p className="text-[9px] text-zinc-500 mt-3 leading-relaxed">
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
                            className="w-full bg-black/40 rounded-xl px-4 py-3 text-[12px] text-zinc-300 placeholder-zinc-800 outline-none font-mono border border-white/[0.02] focus:border-emerald-500/20 transition-all"
                        />
                        <button
                            onClick={handleLink}
                            className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-emerald-950 transition-all"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm p-8 rounded-[2.5rem] bg-zinc-950 border border-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.1)] text-center"
            >
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                    <Share2 className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-[20px] font-black tracking-tight text-white mb-2">Bridge Request</h3>
                <p className="text-[12px] text-zinc-400 leading-relaxed mb-6">
                    A device with ID <span className="text-cyan-400 font-mono">{request.peerId.substring(0, 12)}...</span> is requesting access to your Sovereign Identity.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onReject}
                        className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                    >
                        Deny
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 py-3 rounded-xl bg-cyan-500 text-cyan-950 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
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
            className={`relative w-16 h-16 rounded-3xl bg-zinc-950/40 backdrop-blur-3xl border-t border-white/10 border-b border-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${c.border} flex flex-col items-center justify-center gap-1.5 cursor-pointer group isolation-auto`}
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

            <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover:text-white transition-colors duration-300 tracking-tighter tabular-nums">
                {value}
            </span>

            {/* High-Fidelity Tooltip */}
            <div className="absolute left-[calc(100%+14px)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none z-50">
                <div className="relative px-4 py-2 rounded-2xl bg-zinc-950/90 backdrop-blur-2xl border border-white/5 shadow-2xl overflow-hidden min-w-[120px]">
                    {/* Tooltip Accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.ring}`} />

                    <div className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-0.5">{color.toUpperCase()} MODULE</div>
                    <div className="text-[11px] font-bold text-white tracking-tight">{label}</div>

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-scanline opacity-[0.03] pointer-events-none" />
                </div>

                {/* Arrow */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-zinc-950/90 border-l border-b border-white/5 -mr-[5px]" />
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 bg-black/80 backdrop-blur-xl"
        >
            <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-video rounded-[3rem] bg-zinc-950 border border-white/5 overflow-hidden shadow-2xl flex flex-col">
                {/* Visual Background (Remote Video or Ambient) */}
                <div className="absolute inset-0 z-0">
                    {type === "video" && remoteStream ? (
                        <StreamPreview stream={remoteStream} muted={false} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950/20 flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="w-64 h-64 rounded-full bg-emerald-500/10 blur-[100px]"
                            />
                        </div>
                    )}
                </div>

                {/* Local Preview (PiP) */}
                {type === "video" && localStream && state === "active" && (
                    <div className="absolute top-8 right-8 w-32 h-44 rounded-2xl border border-white/10 overflow-hidden z-20 shadow-xl bg-black">
                        <StreamPreview stream={localStream} muted={true} className="w-full h-full object-cover" />
                        {isVideoOff && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                                <VideoOff className="w-4 h-4 text-white/20" />
                            </div>
                        )}
                    </div>
                )}

                {/* Content Overlay */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-12">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-900 border border-white/5 flex items-center justify-center mb-8 relative">
                        <User className="w-8 h-8 text-zinc-600" />
                        {(state === "calling" || state === "incoming") && (
                            <motion.div
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-[2.5rem] border border-emerald-500"
                            />
                        )}
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-white mb-2">
                        {peerId?.substring(0, 12)}
                    </h2>
                    <p className="text-xs uppercase tracking-[0.3em] font-black text-zinc-600">
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
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isAudioMuted ? 'bg-rose-500/20 border-rose-500/30 text-rose-500' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'}`}
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
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isVideoOff ? 'bg-rose-500/20 border-rose-500/30 text-rose-500' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'}`}
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
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/60">Reputation Shard</span>
                <Shield className="w-3 h-3 text-emerald-500/40" />
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1 p-4 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col items-center">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Global Trust</span>
                    <span className="text-2xl font-black text-white mt-1">{score}</span>
                </div>
                <div className="flex-1 p-4 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col items-center">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Vouches</span>
                    <span className="text-2xl font-black text-white mt-1">{vouches}</span>
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
                    className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-emerald-950 transition-all"
                >
                    Vouch for this Peer
                </button>
            )}
        </div>
    );
}

function TrustStats({ peerId }: { peerId: string }) {
    const contact = useLiveQuery(() => db.contacts.get(peerId), [peerId]);
    if (!contact) return null;

    return (
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <Shield className="w-3 h-3 text-emerald-400" />
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Global Trust</span>
                <span className="text-[12px] font-mono text-white leading-none mt-0.5">{contact.trustScore || 10}</span>
            </div>
        </div>
    );
}
