import type { Coordinates } from '@/types';

/**
 * Turn coordinates into a short, human-readable place name using
 * OpenStreetMap's Nominatim service. This is a convenience only: any failure
 * resolves to null and the citizen can type the location themselves.
 */
export async function describeLocation({
    latitude,
    longitude,
}: Coordinates): Promise<string | null> {
    const url =
        'https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=17' +
        `&lat=${latitude.toFixed(6)}&lon=${longitude.toFixed(6)}`;

    try {
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            return null;
        }

        const place = (await response.json()) as { display_name?: string };

        return (
            place.display_name
                ?.split(',')
                .slice(0, 3)
                .map((part) => part.trim())
                .join(', ') ?? null
        );
    } catch {
        return null;
    }
}
