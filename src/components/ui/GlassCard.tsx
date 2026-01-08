import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
    return (
        <div
            className={`
        bg-white/10 backdrop-blur-xl border border-white/20 
        shadow-2xl shadow-green-900/50 
        hover:scale-[1.02] hover:-translate-y-1 
        transition-all duration-500 
        rounded-2xl p-6 ${className}
      `}
        >
            {children}
        </div>
    );
}
