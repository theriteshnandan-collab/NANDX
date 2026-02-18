"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useMesh } from "../context/MeshProvider";
import * as Y from "yjs";
import { db, persistMessage } from "@/lib/db/NandixDB";

/**
 * useSovereign Hook v3 (Direct Relay + Memory)
 * Messages are sent directly via RED WIRE as simple JSON.
 * Local state is managed via Yjs array for reactivity.
 */
export const useSovereign = (topic: string) => {
    const { mesh, myId } = useMesh();
    const [messages, setMessages] = useState<any[]>([]);
    const persistedIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        mesh.joinSwarm(topic);
        const ydoc = mesh.getDoc();
        const yarray = ydoc.getArray(`chat-${topic}`);

        // 🧠 MEMORY: Load persisted history first
        db.messages
            .where("topic")
            .equals(topic)
            .sortBy("timestamp")
            .then((stored) => {
                if (stored.length > 0) {
                    const restored = stored.map((m) => ({
                        id: m.messageId,
                        sender: m.sender,
                        text: m.text,
                        timestamp: m.timestamp,
                    }));
                    restored.forEach((m) => persistedIds.current.add(m.id));
                    setMessages(restored);
                    console.log(`[TALK] Loaded ${restored.length} messages from memory`);
                }
            });

        // Observe Yjs for live messages (triggered by both local push AND remote CHAT_MSG relay)
        const observer = () => {
            const liveMessages = yarray.toArray() as any[];
            console.log(`[TALK] 🔄 Yjs observer fired: ${liveMessages.length} messages`);
            setMessages(liveMessages);

            // 📝 MEMORY: Persist any new messages to Dexie
            liveMessages.forEach((msg: any) => {
                if (!persistedIds.current.has(msg.id)) {
                    persistedIds.current.add(msg.id);
                    persistMessage({
                        topic,
                        messageId: msg.id,
                        sender: msg.sender,
                        text: msg.text,
                        timestamp: msg.timestamp,
                    });
                }
            });
        };

        yarray.observe(observer);

        // Read existing Yjs state on mount (in case data arrived before observer)
        const existing = yarray.toArray() as any[];
        if (existing.length > 0) {
            console.log(`[TALK] Found ${existing.length} existing Yjs messages on mount`);
            setMessages(existing);
        }

        return () => yarray.unobserve(observer);
    }, [topic, mesh]);

    const sendMessage = useCallback((text: string) => {
        const ydoc = mesh.getDoc();
        const yarray = ydoc.getArray(`chat-${topic}`);
        const msgId = Math.random().toString(36).substring(7);
        const timestamp = Date.now();

        const msg = {
            id: msgId,
            sender: myId,
            text,
            timestamp,
        };

        // 1. Push to local Yjs (triggers observer → UI update)
        yarray.push([msg]);

        // 2. Send DIRECTLY over RED WIRE as simple JSON (the critical fix!)
        mesh.sendChatMessage({ ...msg, sender: myId || "unknown", topic });

        console.log(`[TALK] ✅ Sent "${text}" | Local Yjs + RED WIRE relay`);
    }, [mesh, myId, topic]);

    const sendMediaMessage = useCallback((mediaType: "image" | "voice" | "file", mediaData: string, text: string = "", mediaName?: string) => {
        const ydoc = mesh.getDoc();
        const yarray = ydoc.getArray(`chat-${topic}`);
        const msgId = Math.random().toString(36).substring(7);
        const timestamp = Date.now();

        const msg = {
            id: msgId,
            sender: myId,
            text,
            timestamp,
            mediaType,
            mediaData,
            mediaName,
        };

        // 1. Push to local Yjs
        yarray.push([msg]);

        // 2. Send DIRECTLY over RED WIRE
        mesh.sendChatMessage({ ...msg, sender: myId || "unknown", topic });

        console.log(`[TALK] ✅ Sent ${mediaType} | Local Yjs + RED WIRE relay`);
    }, [mesh, myId, topic]);

    return { messages, sendMessage, sendMediaMessage };
};
