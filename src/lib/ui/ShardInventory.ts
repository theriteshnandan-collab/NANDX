/**
 * 🧊 SHARD INVENTORY: Standardized Data Shard Visual Objects
 * 
 * 🎓 MISSION: Every piece of data in Nandix (a file, a message, a contact,
 * a room) is represented as a "Data Shard." This module defines the
 * standard schema and utilities for creating and styling shards.
 * 
 * PATTERN: Factory + Type System
 */

export type ShardType =
    | "FILE"
    | "MESSAGE"
    | "CONTACT"
    | "ROOM"
    | "AGENT"
    | "KEY"
    | "VAULT"
    | "TRANSFER"
    | "TRUST";

export interface DataShard {
    id: string;
    type: ShardType;
    label: string;
    sublabel?: string;
    timestamp: number;
    size?: number;      // bytes
    status: "ACTIVE" | "PENDING" | "ENCRYPTED" | "EXPIRED";
    metadata?: Record<string, unknown>;
}

/**
 * 🎨 Visual styling tokens for each shard type (Void Theme).
 */
export const SHARD_STYLES: Record<ShardType, {
    icon: string;
    bgColor: string;
    borderColor: string;
    glowColor: string;
    textColor: string;
}> = {
    FILE: {
        icon: "📄",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        glowColor: "shadow-blue-500/20",
        textColor: "text-blue-400",
    },
    MESSAGE: {
        icon: "💬",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        glowColor: "shadow-emerald-500/20",
        textColor: "text-emerald-400",
    },
    CONTACT: {
        icon: "👤",
        bgColor: "bg-violet-500/10",
        borderColor: "border-violet-500/20",
        glowColor: "shadow-violet-500/20",
        textColor: "text-violet-400",
    },
    ROOM: {
        icon: "🏠",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        glowColor: "shadow-amber-500/20",
        textColor: "text-amber-400",
    },
    AGENT: {
        icon: "🤖",
        bgColor: "bg-cyan-500/10",
        borderColor: "border-cyan-500/20",
        glowColor: "shadow-cyan-500/20",
        textColor: "text-cyan-400",
    },
    KEY: {
        icon: "🔑",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        glowColor: "shadow-red-500/20",
        textColor: "text-red-400",
    },
    VAULT: {
        icon: "🛡️",
        bgColor: "bg-zinc-500/10",
        borderColor: "border-zinc-500/20",
        glowColor: "shadow-zinc-500/20",
        textColor: "text-zinc-400",
    },
    TRANSFER: {
        icon: "📡",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
        glowColor: "shadow-orange-500/20",
        textColor: "text-orange-400",
    },
    TRUST: {
        icon: "🏛️",
        bgColor: "bg-emerald-500/20",
        borderColor: "border-emerald-500/30",
        glowColor: "shadow-emerald-500/30",
        textColor: "text-emerald-400",
    },
};

/**
 * 🏭 FACTORY: Create standardized Data Shards.
 */
export class ShardFactory {

    static createFile(id: string, fileName: string, size: number): DataShard {
        return {
            id,
            type: "FILE",
            label: fileName,
            sublabel: ShardFactory.formatBytes(size),
            timestamp: Date.now(),
            size,
            status: "ACTIVE",
        };
    }

    static createMessage(id: string, preview: string): DataShard {
        return {
            id,
            type: "MESSAGE",
            label: preview.substring(0, 50),
            timestamp: Date.now(),
            status: "ACTIVE",
        };
    }

    static createContact(id: string, name: string, peerId: string): DataShard {
        return {
            id,
            type: "CONTACT",
            label: name,
            sublabel: peerId.substring(0, 16),
            timestamp: Date.now(),
            status: "ACTIVE",
            metadata: { peerId },
        };
    }

    static createRoom(id: string, roomName: string, memberCount: number): DataShard {
        return {
            id,
            type: "ROOM",
            label: roomName,
            sublabel: `${memberCount} members`,
            timestamp: Date.now(),
            status: "ACTIVE",
            metadata: { memberCount },
        };
    }

    static createAgent(id: string, agentName: string, capability: string): DataShard {
        return {
            id,
            type: "AGENT",
            label: agentName,
            sublabel: capability,
            timestamp: Date.now(),
            status: "ACTIVE",
        };
    }

    static createTransfer(id: string, fileName: string, progress: number): DataShard {
        return {
            id,
            type: "TRANSFER",
            label: fileName,
            sublabel: `${progress}%`,
            timestamp: Date.now(),
            status: progress >= 100 ? "ACTIVE" : "PENDING",
            metadata: { progress },
        };
    }

    static createTrust(id: string, score: number, vouches: number): DataShard {
        return {
            id,
            type: "TRUST",
            label: `Trust Score: ${score}`,
            sublabel: `${vouches} community vouches`,
            timestamp: Date.now(),
            status: "ACTIVE",
            metadata: { score, vouches },
        };
    }

    /**
     * Get the Tailwind CSS classes for a shard's visual style.
     */
    static getStyle(type: ShardType) {
        return SHARD_STYLES[type];
    }

    /**
     * Human-readable bytes formatting.
     */
    static formatBytes(bytes: number): string {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    }
}
