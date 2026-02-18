"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Globe, Loader2 } from "lucide-react";

interface LinkPreviewProps {
    url: string;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                setLoading(true);
                // We'll call a server-side API or a local hook
                // For now, let's assume an API route exists for this
                const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
                if (!res.ok) throw new Error("Failed to fetch preview");
                const data = await res.json();
                setMetadata(data.metadata);
            } catch (err) {
                console.error("[PREVIEW] ❌ Error:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();
    }, [url]);

    if (loading) {
        return (
            <div className="w-full max-w-sm mt-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Scanning Signal...</span>
            </div>
        );
    }

    if (error || !metadata) return null;

    return (
        <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="block w-full max-w-sm mt-3 group"
        >
            <div className="overflow-hidden rounded-2xl bg-zinc-950/40 backdrop-blur-3xl border border-white/[0.04] group-hover:border-cyan-500/30 transition-all shadow-2xl">
                {metadata.image && (
                    <div className="relative aspect-video w-full overflow-hidden border-b border-white/[0.03]">
                        <img
                            src={metadata.image}
                            alt={metadata.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                    </div>
                )}

                <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        {metadata.siteName ? (
                            <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">
                                {metadata.siteName}
                            </span>
                        ) : (
                            <Globe className="w-3 h-3 text-white/20" />
                        )}
                        <span className="text-[9px] font-mono text-white/10 truncate">{new URL(url).hostname}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
                        {metadata.title}
                    </h4>

                    {metadata.description && (
                        <p className="text-[11px] text-white/30 line-clamp-2 leading-relaxed font-medium">
                            {metadata.description}
                        </p>
                    )}

                    <div className="pt-2 flex items-center justify-end">
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:border-cyan-500/30 transition-all">
                            <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-cyan-400" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.a>
    );
};
