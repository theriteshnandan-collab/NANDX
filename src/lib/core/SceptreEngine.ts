/**
 * 📱 THE SCEPTRE: Mobile Remote Execution Engine
 * 
 * 🎓 MISSION: Allow a mobile device to trigger commands on a connected 
 * desktop Nandix node via the P2P mesh. Think of your phone as a 
 * "remote control" for your desktop's Ghost Engine.
 * 
 * PATTERN: Command Pattern (each remote action is a Command object)
 */

export type SceptreCommand =
    | "GHOST_TASK"      // Run a Ghost AI task on the remote node
    | "FILE_LIST"       // List files on the remote node's OPFS
    | "SYSTEM_STATUS"   // Get kernel telemetry
    | "TRANSFER_PAUSE"  // Pause a transfer on the remote
    | "TRANSFER_RESUME" // Resume a transfer
    | "SCREENSHOT"      // Request a screenshot (future)
    | "SHUTDOWN";       // Graceful shutdown of the remote kernel

export interface SceptrePacket {
    type: "SCEPTRE_CMD";
    command: SceptreCommand;
    payload?: Record<string, unknown>;
    requestId: string;
    timestamp: number;
}

export interface SceptreResponse {
    type: "SCEPTRE_RES";
    requestId: string;
    success: boolean;
    data?: unknown;
    error?: string;
}

export class SceptreEngine {
    private handlers: Map<SceptreCommand, (payload?: Record<string, unknown>) => Promise<unknown>> = new Map();

    /**
     * Register a handler for a specific command.
     */
    registerHandler(command: SceptreCommand, handler: (payload?: Record<string, unknown>) => Promise<unknown>): void {
        this.handlers.set(command, handler);
        console.log(`[SCEPTRE] 📱 Handler registered: ${command}`);
    }

    /**
     * Execute a received Sceptre command.
     */
    async execute(packet: SceptrePacket): Promise<SceptreResponse> {
        const handler = this.handlers.get(packet.command);

        if (!handler) {
            console.warn(`[SCEPTRE] ⚠️ Unknown command: ${packet.command}`);
            return {
                type: "SCEPTRE_RES",
                requestId: packet.requestId,
                success: false,
                error: `Unknown command: ${packet.command}`,
            };
        }

        try {
            const data = await handler(packet.payload);
            return {
                type: "SCEPTRE_RES",
                requestId: packet.requestId,
                success: true,
                data,
            };
        } catch (err) {
            return {
                type: "SCEPTRE_RES",
                requestId: packet.requestId,
                success: false,
                error: err instanceof Error ? err.message : "Unknown error",
            };
        }
    }

    /**
     * Create a Sceptre command packet to send to a remote node.
     */
    static createCommand(command: SceptreCommand, payload?: Record<string, unknown>): SceptrePacket {
        return {
            type: "SCEPTRE_CMD",
            command,
            payload,
            requestId: `sceptre-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: Date.now(),
        };
    }
}

export const sceptreEngine = new SceptreEngine();
