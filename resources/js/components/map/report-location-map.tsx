import { Marker } from 'react-leaflet';
import { BaseMap } from '@/components/map/base-map';
import { pinIcon } from '@/components/map/pins';
import type { ReportPriority } from '@/types';

/** A single request's position, read-only. */
export function ReportLocationMap({
    latitude,
    longitude,
    priority,
    className,
}: {
    latitude: number;
    longitude: number;
    priority: ReportPriority;
    className?: string;
}) {
    return (
        <BaseMap
            center={[latitude, longitude]}
            zoom={16}
            scrollWheelZoom={false}
            className={className}
        >
            <Marker position={[latitude, longitude]} icon={pinIcon(priority)} />
        </BaseMap>
    );
}
