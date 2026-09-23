import type { ReactNode } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { cn } from '@/utils/cn';

/** OpenStreetMap base layer shared by every map in the app. */
export function BaseMap({
    center,
    zoom = 14,
    scrollWheelZoom = true,
    className,
    children,
}: {
    center: [number, number];
    zoom?: number;
    scrollWheelZoom?: boolean;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={scrollWheelZoom}
            className={cn('isolate z-0 h-full w-full bg-slate-100', className)}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
            />
            {children}
        </MapContainer>
    );
}
