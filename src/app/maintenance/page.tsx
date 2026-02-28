import Link from "next/link";
import { Wrench, ShieldCheck } from "lucide-react";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-4">
            <div className="max-w-md text-center space-y-6">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                    <Wrench className="w-12 h-12 text-blue-600 relative z-10" />
                </div>

                <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-br from-slate-900 to-slate-500 bg-clip-text text-transparent">
                    System Upgrade
                </h1>

                <p className="text-slate-500 text-lg">
                    Mission Nandix is currently undergoing critical infrastructure maintenance to enhance network performance.
                </p>

                <div className="p-4 bg-white/50 border border-black/5 rounded-lg backdrop-blur-sm shadow-sm">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorized Personnel Only</span>
                    </div>
                </div>

                <div className="pt-8">
                    <Link
                        href="/"
                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                    >
                        Check Status
                    </Link>
                </div>
            </div>
        </div>
    );
}
