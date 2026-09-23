import { Bell } from 'lucide-react';
import type { AppNotification } from '@/types';
import { cn } from '@/utils/cn';
import { timeAgo } from '@/utils/format';

export function NotificationItem({
    notification,
    onOpen,
}: {
    notification: AppNotification;
    onOpen: (notification: AppNotification) => void;
}) {
    const isUnread = notification.read_at === null;

    return (
        <button
            type="button"
            onClick={() => onOpen(notification)}
            className={cn(
                'flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50',
                isUnread && 'bg-sos-50/60',
            )}
        >
            <span
                className={cn(
                    'mt-0.5 grid size-9 shrink-0 place-items-center rounded-full',
                    isUnread
                        ? 'bg-sos-600 text-white'
                        : 'bg-slate-100 text-slate-500',
                )}
                aria-hidden
            >
                <Bell className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                    <span
                        className={cn(
                            'text-sm text-slate-900',
                            isUnread ? 'font-bold' : 'font-semibold',
                        )}
                    >
                        {notification.title}
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">
                        {timeAgo(notification.created_at)}
                    </span>
                </span>
                <span className="mt-0.5 block text-sm text-slate-600">
                    {notification.message}
                </span>
            </span>
            {isUnread && <span className="sr-only">Unread</span>}
        </button>
    );
}
