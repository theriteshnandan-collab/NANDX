/**
 * 🔊 SPATIAL AUDIO ENGINE: 3D Sound for Group Calls
 * 
 * 🎓 MISSION: Position each peer's voice in a 3D audio space using
 * the Web Audio API's PannerNode. This creates an immersive, 
 * "conference room" feel for group voice calls.
 * 
 * PATTERN: Decorator (wraps existing MediaStream handling with spatial positioning)
 */

export interface SpatialPeer {
    peerId: string;
    pannerNode: PannerNode;
    sourceNode: MediaStreamAudioSourceNode;
    position: { x: number; y: number; z: number };
}

export class SpatialAudioEngine {
    private context: AudioContext | null = null;
    private peers: Map<string, SpatialPeer> = new Map();
    private listenerAngle: number = 0;

    /**
     * Initialize the Audio Context.
     * Must be called after a user gesture (browser policy).
     */
    initialize(): boolean {
        try {
            this.context = new AudioContext();

            // Set listener at origin
            const listener = this.context.listener;
            if (listener.positionX) {
                listener.positionX.value = 0;
                listener.positionY.value = 0;
                listener.positionZ.value = 0;
                listener.forwardX.value = 0;
                listener.forwardY.value = 0;
                listener.forwardZ.value = -1;
                listener.upX.value = 0;
                listener.upY.value = 1;
                listener.upZ.value = 0;
            }

            console.log("[SPATIAL] 🔊 Spatial Audio Engine initialized.");
            return true;
        } catch (err) {
            console.error("[SPATIAL] ❌ Failed to initialize:", err);
            return false;
        }
    }

    /**
     * Add a peer's audio stream and position them in 3D space.
     * Peers are arranged in a circle around the listener.
     */
    addPeer(peerId: string, stream: MediaStream, index: number, totalPeers: number): void {
        if (!this.context) return;

        try {
            const source = this.context.createMediaStreamSource(stream);
            const panner = this.context.createPanner();

            // Configure panner for realistic spatial audio
            panner.panningModel = "HRTF"; // Head-Related Transfer Function
            panner.distanceModel = "inverse";
            panner.refDistance = 1;
            panner.maxDistance = 100;
            panner.rolloffFactor = 1;
            panner.coneInnerAngle = 360;
            panner.coneOuterAngle = 360;
            panner.coneOuterGain = 0;

            // Calculate position in a circle around listener
            const angle = (2 * Math.PI * index) / Math.max(totalPeers, 1);
            const radius = 3; // 3 meters out
            const position = {
                x: Math.cos(angle) * radius,
                y: 0, // Same height plane
                z: Math.sin(angle) * radius,
            };

            panner.positionX.setValueAtTime(position.x, this.context.currentTime);
            panner.positionY.setValueAtTime(position.y, this.context.currentTime);
            panner.positionZ.setValueAtTime(position.z, this.context.currentTime);

            // Connect: Source → Panner → Destination (speakers)
            source.connect(panner);
            panner.connect(this.context.destination);

            this.peers.set(peerId, {
                peerId,
                pannerNode: panner,
                sourceNode: source,
                position,
            });

            console.log(`[SPATIAL] 🎧 Peer ${peerId.substring(0, 8)} positioned at (${position.x.toFixed(1)}, ${position.z.toFixed(1)})`);
        } catch (err) {
            console.error(`[SPATIAL] ❌ Failed to add peer ${peerId}:`, err);
        }
    }

    /**
     * Remove a peer from the spatial audio field.
     */
    removePeer(peerId: string): void {
        const peer = this.peers.get(peerId);
        if (peer) {
            peer.sourceNode.disconnect();
            peer.pannerNode.disconnect();
            this.peers.delete(peerId);
            console.log(`[SPATIAL] 🔇 Removed peer ${peerId.substring(0, 8)}`);
        }
    }

    /**
     * Rearrange all peers when someone joins/leaves.
     */
    rearrange(): void {
        if (!this.context) return;
        const peerList = Array.from(this.peers.values());
        const total = peerList.length;

        peerList.forEach((peer, i) => {
            const angle = (2 * Math.PI * i) / Math.max(total, 1);
            const radius = 3;
            peer.position = {
                x: Math.cos(angle) * radius,
                y: 0,
                z: Math.sin(angle) * radius,
            };

            peer.pannerNode.positionX.setValueAtTime(peer.position.x, this.context!.currentTime);
            peer.pannerNode.positionZ.setValueAtTime(peer.position.z, this.context!.currentTime);
        });
    }

    /**
     * Shutdown the engine.
     */
    destroy(): void {
        this.peers.forEach((peer) => {
            peer.sourceNode.disconnect();
            peer.pannerNode.disconnect();
        });
        this.peers.clear();
        if (this.context) {
            this.context.close();
            this.context = null;
        }
        console.log("[SPATIAL] 🛑 Spatial Audio Engine destroyed.");
    }
}

export const spatialAudio = new SpatialAudioEngine();
