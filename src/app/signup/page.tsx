"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// 🛡️ Validation Schema
const signUpSchema = z.object({
    fullName: z.string().min(2, "Name required."),
    email: z.string().email("Invalid handle."),
    password: z.string().min(8, "Key too short."),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema)
    });

    const onSubmit = async (data: SignUpFormValues) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("Identity Forged.");
        router.push("/nandix");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            {/* Ambient Light Source (Top Left) */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* 🧱 CLAY CARD (Levitating) */}
                <div className="bg-[#F3F4F7] rounded-[32px] p-8 shadow-levitate border border-white/50 relative overflow-hidden">
                    {/* Frosted Glass Header Overlay */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-tactile-sage/20 to-transparent pointer-events-none" />

                    <div className="relative z-10 text-center mb-10">
                        <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-[#F3F4F7] shadow-convex mb-4 text-tactile-text">
                            <Shield className="w-8 h-8 opacity-80" />
                        </div>
                        <h1 className="text-2xl font-bold text-tactile-text tracking-tight">Create Account</h1>
                        <p className="text-sm text-gray-500 mt-2">Join the Sovereign Mesh</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* 🧱 CONCAVE INPUT: Full Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Full Name</label>
                            <input
                                {...register("fullName")}
                                className="w-full bg-[#F3F4F7] rounded-xl px-4 py-4 shadow-concave text-tactile-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tactile-sage/50 transition-all font-medium"
                                placeholder="Satoshi"
                            />
                            {errors.fullName && <p className="text-red-500 text-xs ml-2">{errors.fullName.message}</p>}
                        </div>

                        {/* 🧱 CONCAVE INPUT: Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Handle</label>
                            <input
                                {...register("email")}
                                className="w-full bg-[#F3F4F7] rounded-xl px-4 py-4 shadow-concave text-tactile-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tactile-sage/50 transition-all font-medium"
                                placeholder="identity@mesh.net"
                            />
                            {errors.email && <p className="text-red-500 text-xs ml-2">{errors.email.message}</p>}
                        </div>

                        {/* 🧱 CONCAVE INPUT: Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Master Key</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    className="w-full bg-[#F3F4F7] rounded-xl px-4 py-4 shadow-concave text-tactile-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tactile-sage/50 transition-all font-medium pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-tactile-text transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs ml-2">{errors.password.message}</p>}
                        </div>

                        {/* 🧱 CONVEX BUTTON (Tactile Press) */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 mt-4 bg-tactile-sage text-tactile-text font-bold rounded-xl shadow-[0_10px_20px_-5px_rgba(212,225,149,0.5)] border-t border-white/60 flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isSubmitting ? "FORGING..." : "SIGN UP"}
                                <ArrowRight className="w-4 h-4" />
                            </span>
                            {/* Glossy sheen */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-50" />
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Already initialized? <Link href="/login" className="text-tactile-text font-bold hover:underline">Log In</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
