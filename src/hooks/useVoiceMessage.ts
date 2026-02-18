"use client";

import { useState, useRef, useCallback } from "react";

/**
 * useVoiceMessage Hook
 * 
 * Records audio using MediaRecorder API and returns:
 * - Base64-encoded audio blob for transmission over RED wire
 * - Recording state + duration
 * - Start/Stop/Cancel controls
 */
export const useVoiceMessage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? "audio/webm;codecs=opus"
                    : "audio/webm",
            });

            chunks.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.current.push(e.data);
            };

            mediaRecorder.current = recorder;
            recorder.start(100); // Collect data every 100ms
            setIsRecording(true);
            setDuration(0);

            // Duration timer
            timerRef.current = setInterval(() => {
                setDuration((d) => d + 1);
            }, 1000);

            console.log("[VOICE] 🎙️ Recording started");
        } catch (err) {
            console.error("[VOICE] ❌ Mic access denied:", err);
        }
    }, []);

    const stopRecording = useCallback((): Promise<string | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorder.current || mediaRecorder.current.state === "inactive") {
                resolve(null);
                return;
            }

            mediaRecorder.current.onstop = async () => {
                const blob = new Blob(chunks.current, { type: "audio/webm" });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    console.log(`[VOICE] ✅ Recording complete: ${(blob.size / 1024).toFixed(1)}KB`);
                    resolve(base64);
                };
                reader.readAsDataURL(blob);

                // Stop all tracks
                mediaRecorder.current?.stream.getTracks().forEach((t) => t.stop());
            };

            mediaRecorder.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        });
    }, []);

    const cancelRecording = useCallback(() => {
        if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
            mediaRecorder.current.stop();
            mediaRecorder.current.stream.getTracks().forEach((t) => t.stop());
        }
        chunks.current = [];
        setIsRecording(false);
        setDuration(0);
        if (timerRef.current) clearInterval(timerRef.current);
        console.log("[VOICE] ❌ Recording cancelled");
    }, []);

    const formatDuration = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return {
        isRecording,
        duration,
        formattedDuration: formatDuration(duration),
        startRecording,
        stopRecording,
        cancelRecording,
    };
};
