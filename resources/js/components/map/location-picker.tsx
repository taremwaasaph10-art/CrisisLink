import type L from 'leaflet';
import { useEffect } from 'react';
import { Circle, Marker, useMap, useMapEvents } from 'react-leaflet';
import { BaseMap } from '@/components/map/base-map';
import { pinIcon } from '@/components/map/pins';
import type { Coordinates } from '@/types';
import { DEFAULT_MAP_CENTER } from '@/utils/emergency';

/**
 * Shows the citizen's position and lets them correct it by tapping the map
 * or dragging the pin.
 */
export function LocationPicker({
    value,
    onChange,
    gpsFix,
    accuracy,
    className,
}: {
    value: Coordinates | null;
    onChange: (coordinates: Coordinates) => void;
    /** The latest GPS reading; the map re-centres whenever it changes. */
    gpsFix: Coordinates | null;
    accuracy?: number | null;
    className?: string;
}) {
    const center: [number, number] = value
        ? [value.latitude, value.longitude]
        : DEFAULT_MAP_CENTER;

    return (
        <BaseMap center={center} zoom={value ? 16 : 13} className={className}>
            <PlaceOnTap onPlace={onChange} />
            <FollowGps fix={gpsFix} />
            {value && accuracy && accuracy < 2000 && (
                <Circle
                    center={[value.latitude, value.longitude]}
                    radius={accuracy}
                    pathOptions={{
                        color: '#2563eb',
                        weight: 1,
                        fillOpacity: 0.08,
                    }}
                />
            )}
            {value && (
                <Marker
                    position={[value.latitude, value.longitude]}
                    icon={pinIcon('you')}
                    draggable
                    eventHandlers={{
                        dragend: (event) => {
                            const position = (
                                event.target as L.Marker
                            ).getLatLng();
                            onChange({
                                latitude: position.lat,
                                longitude: position.lng,
                            });
                        },
                    }}
                />
            )}
        </BaseMap>
    );
}

function PlaceOnTap({
    onPlace,
}: {
    onPlace: (coordinates: Coordinates) => void;
}) {
    useMapEvents({
        click: (event) =>
            onPlace({
                latitude: event.latlng.lat,
                longitude: event.latlng.lng,
            }),
    });

    return null;
}

function FollowGps({ fix }: { fix: Coordinates | null }) {
    const map = useMap();

    useEffect(() => {
        if (fix) {
            map.setView(
                [fix.latitude, fix.longitude],
                Math.max(map.getZoom(), 16),
            );
        }
    }, [map, fix]);

    return null;
}
