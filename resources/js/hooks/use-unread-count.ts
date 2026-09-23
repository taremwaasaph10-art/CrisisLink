import { useEffect } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import { notificationService } from '@/services/notifications';

const CHANGED_EVENT = 'crisislink:notifications-changed';

/** Tell every unread badge to refresh, e.g. after marking notifications read. */
export function announceNotificationsChanged(): void {
    window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function useUnreadCount(): number {
    const { data, reload } = useApiQuery(
        () => notificationService.unreadCount(),
        [],
        { pollInterval: 15000 },
    );

    useEffect(() => {
        window.addEventListener(CHANGED_EVENT, reload);

        return () => window.removeEventListener(CHANGED_EVENT, reload);
    }, [reload]);

    return data ?? 0;
}
