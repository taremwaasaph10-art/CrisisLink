import { useCallback, useState } from 'react';
import type { Coordinates } from '@/types';
import { LOCATION_UNAVAILABLE_MESSAGE } from '@/utils/emergency';

type GeolocationState = {
    status: 'idle' | 'locating' | 'found' | 'failed';
    coordinates: Coordinates | null;
    /** Accuracy radius in metres. */
    accuracy: number | null;
    error: string | null;
};

export function useGeolocation() {
    const [state, setState] = useState<GeolocationState>({
        status: 'idle',
        coordinates: null,
        accuracy: null,
        error: null,
    });

    const locate = useCallback(() => {
        if (!('geolocation' in navigator) || !window.isSecureContext) {
            setState((current) => ({
                ...current,
                status: 'failed',
                error: LOCATION_UNAVAILABLE_MESSAGE,
            }));

            return;
        }

        setState((current) => ({
            ...current,
            status: 'locating',
            error: null,
        }));

        navigator.geolocation.getCurrentPosition(
            (position) =>
                setState({
                    status: 'found',
                    coordinates: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    },
                    accuracy: Math.round(position.coords.accuracy),
                    error: null,
                }),
            () =>
                setState((current) => ({
                    ...current,
                    status: 'failed',
                    error: LOCATION_UNAVAILABLE_MESSAGE,
                })),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
        );
    }, []);

    return { ...state, locate };
}
