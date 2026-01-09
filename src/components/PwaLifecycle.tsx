'use client';

import { useEffect } from 'react';

export default function PwaLifecycle() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Unregister existing ones first to force update if needed (optional, but good for debugging)
            // navigator.serviceWorker.getRegistrations().then(registrations => {
            //   for(let registration of registrations) {
            //      registration.unregister();
            //   }
            // });

            // Explicitly register the SW
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('SW Registered:', registration);
                    // Optional: Communicate success to the UI via a custom event or localStorage for debugging
                    localStorage.setItem('sw_status', 'registered');
                })
                .catch((error) => {
                    console.error('SW Registration failed:', error);
                    localStorage.setItem('sw_status', 'failed: ' + error.message);
                });
        }
    }, []);

    return null;
}
