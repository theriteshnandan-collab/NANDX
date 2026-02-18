import { useState, useCallback, useRef, useEffect } from "react";

export function useMediaStream() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const getStream = useCallback(async (video: boolean = true, audio: boolean = true) => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
            setStream(mediaStream);
            setError(null);
            return mediaStream;
        } catch (err: any) {
            console.error("[MEDIA] ❌ Failed to get stream:", err);
            setError(err.message || "Could not access camera/microphone");
            return null;
        }
    }, []);

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    }, [stream]);

    const toggleAudio = useCallback(() => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioMuted(!audioTrack.enabled);
            }
        }
    }, [stream]);

    const toggleVideo = useCallback(() => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    }, [stream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    return {
        stream,
        error,
        getStream,
        stopStream,
        toggleAudio,
        toggleVideo,
        isAudioMuted,
        isVideoOff,
    };
}
