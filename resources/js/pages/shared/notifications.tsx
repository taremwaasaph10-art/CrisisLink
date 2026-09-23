import { BellOff, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { NotificationItem } from '@/components/notification-item';
import { useAuth } from '@/context/auth-context';
import { useApiQuery } from '@/hooks/use-api-query';
import { announceNotificationsChanged } from '@/hooks/use-unread-count';
import { notificationService } from '@/services/notifications';
import type { AppNotification } from '@/types';

export function NotificationsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const { data, error, isLoading, reload, setData } = useApiQuery(
        () => notificationService.list(),
        [],
        {
            pollInterval: 15000,
        },
    );

    const unread =
        data?.filter((notification) => notification.read_at === null).length ??
        0;

    const open = async (notification: AppNotification) => {
        if (notification.read_at === null) {
            setData(
                (data ?? []).map((item) =>
                    item.id === notification.id
                        ? { ...item, read_at: new Date().toISOString() }
                        : item,
                ),
            );
            await notificationService
                .markAsRead(notification.id)
                .catch(() => undefined);
            announceNotificationsChanged();
        }

        if (notification.emergency_report_id) {
            void navigate(
                user?.role === 'citizen'
                    ? `/emergency/${notification.emergency_report_id}`
                    : `/responder/requests/${notification.emergency_report_id}`,
            );
        }
    };

    const markAll = async () => {
        setIsMarkingAll(true);

        try {
            await notificationService.markAllAsRead();
            announceNotificationsChanged();
            reload();
        } finally {
            setIsMarkingAll(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Notifications
                    </h1>
                    {data && (
                        <p className="text-sm text-slate-500">
                            {unread} unread
                        </p>
                    )}
                </div>
                {unread > 0 && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={markAll}
                        isLoading={isMarkingAll}
                    >
                        {!isMarkingAll && (
                            <CheckCheck className="size-4" aria-hidden />
                        )}
                        Mark all as read
                    </Button>
                )}
            </div>

            {isLoading && !data && (
                <LoadingState label="Loading notifications…" />
            )}
            {error && !data && (
                <ErrorState message={error.message} onRetry={reload} />
            )}
            {data && data.length === 0 && (
                <EmptyState
                    icon={BellOff}
                    title="No notifications yet."
                    description="Updates about requests will appear here."
                />
            )}
            {data && data.length > 0 && (
                <Card className="divide-y divide-slate-100 overflow-hidden">
                    {data.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onOpen={open}
                        />
                    ))}
                </Card>
            )}
        </div>
    );
}
