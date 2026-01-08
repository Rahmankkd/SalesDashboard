'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { SaaSConfig } from '@/types';

const ConfigContext = createContext<SaaSConfig | null>(null);

export function ConfigProvider({
    children,
    config
}: {
    children: ReactNode;
    config: SaaSConfig | null
}) {
    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    return useContext(ConfigContext);
}
