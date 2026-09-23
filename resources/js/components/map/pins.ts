import L from 'leaflet';
import type { ReportPriority } from '@/types';

type PinVariant = ReportPriority | 'you';

const icons = new Map<PinVariant, L.DivIcon>();

/**
 * A teardrop pin coloured by priority (styles live in app.css). Using a
 * divIcon avoids Leaflet's default image markers, which break under bundlers.
 */
export function pinIcon(variant: PinVariant): L.DivIcon {
    let icon = icons.get(variant);

    if (!icon) {
        icon = L.divIcon({
            className: '',
            html: `<span class="map-pin map-pin--${variant}"></span>`,
            iconSize: [30, 30],
            iconAnchor: [15, 36],
            popupAnchor: [0, -32],
        });
        icons.set(variant, icon);
    }

    return icon;
}
