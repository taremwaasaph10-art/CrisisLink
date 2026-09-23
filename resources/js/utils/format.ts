const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
});

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: 'auto',
});

export function formatDateTime(iso: string | null | undefined): string {
    return iso ? dateTimeFormatter.format(new Date(iso)) : '—';
}

export function formatTime(iso: string | null | undefined): string {
    return iso ? timeFormatter.format(new Date(iso)) : '—';
}

/** "5 minutes ago", "yesterday", … */
export function timeAgo(iso: string | null | undefined): string {
    if (!iso) {
        return '—';
    }

    const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
    const absolute = Math.abs(seconds);

    if (absolute < 45) {
        return 'just now';
    }

    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['minute', 60],
        ['hour', 3600],
        ['day', 86400],
        ['week', 604800],
    ];

    for (let index = units.length - 1; index >= 0; index--) {
        const [unit, size] = units[index];

        if (absolute >= size) {
            return relativeFormatter.format(Math.round(seconds / size), unit);
        }
    }

    return relativeFormatter.format(Math.round(seconds / 60), 'minute');
}

export function pluralize(count: number, singular: string, plural: string) {
    return `${count} ${count === 1 ? singular : plural}`;
}

export function formatCoordinates(
    latitude: number | null,
    longitude: number | null,
): string {
    if (latitude === null || longitude === null) {
        return 'No GPS coordinates';
    }

    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
