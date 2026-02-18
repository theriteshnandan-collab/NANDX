"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { mesh, NandixMesh } from "../lib/p2p/NandixMesh";
import { identity, SovereignProfile } from "../lib/crypto/Identity";
import { sovereignCrypto } from "../lib/crypto/SovereignCrypto";

interface MeshContextType {
    mesh: NandixMesh;
    myId: string | null;
    mnemonic: string | null;
    status: "OFFLINE" | "CONNECTING" | "ONLINE" | "ERROR";
    connectedPeers: number;
    isNewIdentity: boolean;
    recoverIdentity: (words: string) => Promise<boolean>;
    resetIdentity: () => void;
}

const MeshContext = createContext<MeshContextType | null>(null);

export const MeshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [myId, setMyId] = useState<string | null>(null);
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    const [status, setStatus] = useState<"OFFLINE" | "CONNECTING" | "ONLINE" | "ERROR">("OFFLINE");
    const [connectedPeers, setConnectedPeers] = useState(0);
    const [isNewIdentity, setIsNewIdentity] = useState(false);

    const bootMesh = async (profile: SovereignProfile) => {
        try {
            const peerId = await mesh.initialize(profile.id);
            setMyId(peerId);
            setMnemonic(profile.mnemonic);
            setIsNewIdentity(profile.isNew);
            setStatus("ONLINE");
            console.log(`[SOVEREIGN] ✅ Mesh Online: ${peerId}`);

            mesh.onConnectionChange((count) => {
                setConnectedPeers(count);
                console.log(`[SOVEREIGN] Peers: ${count}`);
            });

            // 💓 Start the Heartbeat (30s interval)
            mesh.startHeartbeat();
        } catch (err) {
            console.error("[SOVEREIGN] ❌ Mesh boot failed:", err);

            // Fallback: use auto-generated PeerJS ID
            try {
                const peerId = await mesh.initialize();
                setMyId(peerId);
                setMnemonic(profile.mnemonic);
                setStatus("ONLINE");
                mesh.onConnectionChange((count) => setConnectedPeers(count));
            } catch (fatal) {
                console.error("[SOVEREIGN] ❌ Fatal:", fatal);
                setStatus("ERROR");
            }
        }
    };

    useEffect(() => {
        const boot = async () => {
            setStatus("CONNECTING");
            // Initialize E2E encryption keypair first
            await sovereignCrypto.initialize();
            const profile = await identity.generate();
            await bootMesh(profile);
        };
        boot();
    }, []);

    const recoverIdentity = async (words: string): Promise<boolean> => {
        const profile = identity.recover(words);
        if (!profile) return false;

        // Re-initialize mesh with recovered identity
        setStatus("CONNECTING");
        await bootMesh(profile);
        return true;
    };

    const resetIdentity = () => {
        identity.wipe();
        setMyId(null);
        setMnemonic(null);
        setStatus("OFFLINE");
        setIsNewIdentity(false);
        // Reload page to trigger fresh identity generation
        if (typeof window !== "undefined") window.location.reload();
    };

    return (
        <MeshContext.Provider value={{
            mesh, myId, mnemonic, status, connectedPeers,
            isNewIdentity, recoverIdentity, resetIdentity
        }}>
            {children}
        </MeshContext.Provider>
    );
};

export const useMesh = () => {
    const context = useContext(MeshContext);
    if (!context) throw new Error("useMesh must be used within MeshProvider");
    return context;
};
