import { Variants } from "framer-motion";

/**
 * 🏎️ TACTILE JUICE: THE PHYSICS ENGINE
 * 
 * 🎓 MISSION: Provide a consistent, premium, and "milled" motion feel.
 * 
 * DESIGN PRINCIPLE: "Spring over Easing."
 * We avoid generic cubic-bezier curves. Instead, we use spring physics
 * (stiffness, damping, mass) to make the UI feel like real hardware.
 */

export const TACTILE_SPRING = {
    stiffness: 400,
    damping: 30,
    mass: 1,
};

export const TACTILE_BOUNCE = {
    type: "spring",
    stiffness: 500,
    damping: 15,
};

export const TACTILE_GLIDE = {
    type: "spring",
    stiffness: 100,
    damping: 20,
};

/**
 * 🎭 VARIANTS: High-fidelity motion presets
 */

export const TACTILE_VARIANTS: Record<string, Variants> = {
    // Convex / Concave transitions
    milled: {
        initial: { scale: 0.98, opacity: 0 },
        animate: {
            scale: 1,
            opacity: 1,
            transition: TACTILE_SPRING
        },
        exit: {
            scale: 0.98,
            opacity: 0,
            transition: { duration: 0.2 }
        }
    },

    // Light-catching slide
    slideUp: {
        initial: { y: 20, opacity: 0 },
        animate: {
            y: 0,
            opacity: 1,
            transition: TACTILE_SPRING
        }
    },

    // Micro-interaction: Press
    press: {
        rest: { scale: 1 },
        tap: { scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 20 } },
        hover: { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 20 } }
    },

    // Ghost Shard float
    float: {
        initial: { y: 0 },
        animate: {
            y: [0, -10, 0],
            rotate: [0, 2, 0, -2, 0],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    },

    // Reactor Pulse
    pulse: {
        initial: { scale: 1, opacity: 0.8 },
        animate: {
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "linear"
            }
        }
    }
};

/**
 * 🧱 CONVEX & CONCAVE HELPERS
 * CSS Shadow layers for the "Tactile" look.
 */
export const TACTILE_SHADOWS = {
    convex: "4px 4px 10px rgba(0, 0, 0, 0.4), -2px -2px 10px rgba(255, 255, 255, 0.02)",
    concave: "inset 4px 4px 10px rgba(0, 0, 0, 0.6), inset -2px -2px 10px rgba(255, 255, 255, 0.01)",
    levitate: "10px 10px 30px rgba(0, 0, 0, 0.5), -5px -5px 30px rgba(255, 255, 255, 0.02)",
};

/**
 * 🏎️ FULL UI INTEGRATION: Stagger + Card + Input + Modal + Toast
 * These variants ensure EVERY UI element in Nandix has physics-based motion.
 */

// Stagger container for list animations
export const STAGGER_CONTAINER: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

export const STAGGER_ITEM: Variants = {
    initial: { opacity: 0, y: 12 },
    animate: {
        opacity: 1,
        y: 0,
        transition: TACTILE_SPRING,
    },
};

// Card interaction (hover lift + shadow grow)
export const CARD_INTERACTION: Variants = {
    rest: {
        y: 0,
        boxShadow: TACTILE_SHADOWS.convex,
    },
    hover: {
        y: -6,
        boxShadow: TACTILE_SHADOWS.levitate,
        transition: TACTILE_SPRING,
    },
    tap: {
        y: -2,
        boxShadow: TACTILE_SHADOWS.concave,
        transition: { type: "spring", stiffness: 600, damping: 25 },
    },
};

// Modal entrance
export const MODAL_VARIANTS: Variants = {
    initial: { scale: 0.95, opacity: 0, y: 10 },
    animate: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: { ...TACTILE_SPRING, stiffness: 300 },
    },
    exit: {
        scale: 0.95,
        opacity: 0,
        y: 10,
        transition: { duration: 0.15 },
    },
};

// Toast notification slide-in
export const TOAST_VARIANTS: Variants = {
    initial: { x: 300, opacity: 0 },
    animate: {
        x: 0,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 500, damping: 15 },
    },
    exit: {
        x: 300,
        opacity: 0,
        transition: { duration: 0.2 },
    },
};

// Data shard shimmer (for loading states)
export const SHARD_SHIMMER: Variants = {
    initial: { opacity: 0.5 },
    animate: {
        opacity: [0.5, 1, 0.5],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};
