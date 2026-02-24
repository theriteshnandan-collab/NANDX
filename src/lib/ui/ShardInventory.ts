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
    | "TRANSFER";

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
 * 🎨 Visual styling tokens for each shard type.
 */
export const SHARD_STYLES: Record<ShardType, {
    icon: string;
    bgColor: string;
    borderColor: string;
    glowColor: string;
}> = {
    FILE: {
        icon: "📄",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        glowColor: "shadow-blue-100/50",
    },
    MESSAGE: {
        icon: "💬",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        glowColor: "shadow-green-100/50",
    },
    CONTACT: {
        icon: "👤",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        glowColor: "shadow-purple-100/50",
    },
    ROOM: {
        icon: "🏠",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        glowColor: "shadow-amber-100/50",
    },
    AGENT: {
        icon: "🤖",
        bgColor: "bg-cyan-50",
        borderColor: "border-cyan-200",
        glowColor: "shadow-cyan-100/50",
    },
    KEY: {
        icon: "🔑",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        glowColor: "shadow-red-100/50",
    },
    VAULT: {
        icon: "🛡️",
        bgColor: "bg-zinc-100",
        borderColor: "border-zinc-300",
        glowColor: "shadow-zinc-200/50",
    },
    TRANSFER: {
        icon: "📡",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        glowColor: "shadow-orange-100/50",
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
