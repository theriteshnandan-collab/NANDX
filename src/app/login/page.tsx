"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, ArrowRight, Key } from "lucide-react";
import { toast } from "sonner";

// 🛡️ Login Schema
const loginSchema = z.object({
    email: z.string().email("Invalid handle."),
    password: z.string().min(1, "Key required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormValues) => {
        // Simulate Auth
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Identity Verified.", {
            description: "Decrypted session keys successfully.",
        });

        router.push("/nandix");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#F3F4F7]">
            {/* 💡 Ambient Light Source (Top Left) */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/60 via-transparent to-slate-200/20 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* 🧱 CLAY CARD (Levitating) */}
                <div className="bg-[#F3F4F7] rounded-[32px] p-8 shadow-levitate border border-white/50 relative overflow-hidden">
                    {/* Sage Glow Header Overlay */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-tactile-sage/10 to-transparent pointer-events-none" />

                    <div className="relative z-10 text-center mb-10">
                        <Link href="/">
                            <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-[#F3F4F7] shadow-convex mb-4 text-tactile-text group cursor-pointer active:scale-95 transition-transform">
                                <Key className="w-8 h-8 opacity-80 group-hover:rotate-12 transition-transform" />
                            </div>
                        </Link>
                        <h1 className="text-2xl font-bold text-tactile-text tracking-tight uppercase">Access Node</h1>
                        <p className="text-sm text-tactile-leaf mt-2 font-medium">Verify your Sovereign Identity</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* 🧱 CONCAVE INPUT: Handle */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-tactile-leaf uppercase tracking-[0.2em] ml-2">Handle</label>
                            <input
                                {...register("email")}
                                className="input-tactile py-4 font-medium"
                                placeholder="identity@mesh.net"
                            />
                            {errors.email && <p className="text-red-500 text-xs ml-2">{errors.email.message}</p>}
                        </div>

                        {/* 🧱 CONCAVE INPUT: Password */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-[10px] font-black text-tactile-leaf uppercase tracking-[0.2em]">Master Key</label>
                                <Link href="/recover" className="text-[10px] font-black text-tactile-leaf uppercase tracking-wider hover:text-tactile-text transition-colors">Lost?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    className="input-tactile py-4 font-medium pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-tactile-leaf hover:text-tactile-text transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs ml-2">{errors.password.message}</p>}
                        </div>

                        {/* 🧱 CONVEX BUTTON (Tactile Press) */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-tactile w-full py-4 mt-4 bg-white text-tactile-text font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 relative overflow-hidden group shadow-convex disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isSubmitting ? "DECRYPTING..." : "ENTER MESH"}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </motion.button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-xs text-tactile-leaf font-bold uppercase tracking-widest">
                            New Ghost? <Link href="/signup" className="text-tactile-text border-b border-tactile-text/20 hover:border-tactile-text transition-all">Forge Identity</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
