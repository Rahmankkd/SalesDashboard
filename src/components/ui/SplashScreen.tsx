'use client';
import { motion } from 'framer-motion';

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center">
            {/* 3D Spinning Cube */}
            <motion.div
                className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/20 mb-8"
                animate={{
                    rotateX: [0, 180, 360],
                    rotateY: [0, 180, 360],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 3,
                    ease: "linear",
                    repeat: Infinity,
                }}
            />

            {/* Loading Text */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-black text-white tracking-widest uppercase"
            >
                Sales<span className="text-blue-500">Tracker</span>
            </motion.h1>
            <motion.div
                className="mt-2 h-1 w-32 bg-slate-800 rounded-full overflow-hidden"
            >
                <motion.div
                    className="h-full bg-blue-500"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                />
            </motion.div>
        </div>
    );
}
