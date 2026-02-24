import { mesh, NandixPacket } from "../p2p/NandixMesh";
import { BinaryProtocol } from "../p2p/BinaryProtocol";
import { AgentManifest } from "./SovereignAgent";

/**
 * 📡 AGENT MESH (The Green Wire)
 * 
 * Handles autonomous agent communication, discovery, and task execution.
 */

class AgentMesh {
    private static instance: AgentMesh;
    private localAgents: Map<string, AgentManifest> = new Map();
    private remoteAgents: Map<string, AgentManifest> = new Map();

    private constructor() {
        this.setupGreenWire();
    }

    public static getInstance() {
        if (!AgentMesh.instance) {
            AgentMesh.instance = new AgentMesh();
        }
        return AgentMesh.instance;
    }

    private setupGreenWire() {
        mesh.setPacketListener((packet: NandixPacket) => {
            if (packet.wire !== "GREEN") return;

            switch (packet.type) {
                case "AGENT_ANNOUNCE":
                    this.handleAnnounce(packet.payload);
                    break;
                case "AGENT_SEARCH":
                    this.handleSearch(packet);
                    break;
                case "AGENT_TASK_REQ":
                    this.handleTaskRequest(packet);
                    break;
            }
        });
    }

    /**
     * Announce a local agent to the mesh
     */
    public announceAgent(agent: AgentManifest) {
        this.localAgents.set(agent.id, agent);
        mesh.send("GREEN", agent, "AGENT_ANNOUNCE");
        console.log(`[AGENT-MESH] 📣 Announcing Agent: ${agent.name} (${agent.id})`);
    }

    private handleAnnounce(manifest: AgentManifest) {
        this.remoteAgents.set(manifest.id, manifest);
        console.log(`[AGENT-MESH] 👁️ Discovered Remote Agent: ${manifest.name} capabilities: ${manifest.capabilities.join(", ")}`);
    }

    private handleSearch(packet: NandixPacket) {
        const { capability } = packet.payload;
        // Search local agents for matching capability
        for (const [id, agent] of this.localAgents) {
            if (agent.capabilities.includes(capability)) {
                // Respond with matching agent manifest
                // Implementation note: we need a way to send back to a specific peer
                // Currently mesh.send is broadcast or topic-based.
                // We'll rely on the mesh handling the peer routing if id matches.
                mesh.send("GREEN", agent, "AGENT_SEARCH_RESP");
            }
        }
    }

    private async handleTaskRequest(packet: NandixPacket) {
        const { agentId, taskId, taskPayload } = packet.payload;
        const agent = this.localAgents.get(agentId);

        if (agent) {
            console.log(`[AGENT-MESH] ⚙️ Agent ${agent.name} received task: ${taskId}`);
            // Logic to trigger GhostEngine or specific tool would go here
        }
    }

    public getRemoteAgents() {
        // For demonstration, we show both local and remote
        return [...Array.from(this.localAgents.values()), ...Array.from(this.remoteAgents.values())];
    }
}

export const agentMesh = AgentMesh.getInstance();
