'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20, rotateX: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ perspective: 1000, transformStyle: "preserve-3d" }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
}
