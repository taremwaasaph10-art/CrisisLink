import { api } from '@/services/api';
import type { AppNotification } from '@/types';

export const notificationService = {
    async list(): Promise<AppNotification[]> {
        return (await api.get<AppNotification[]>('/notifications')).data;
    },

    async unreadCount(): Promise<number> {
        return (
            await api.get<{ unread_count: number }>(
                '/notifications/unread-count',
            )
        ).data.unread_count;
    },

    async markAsRead(id: number): Promise<void> {
        await api.patch(`/notifications/${id}/read`);
    },

    async markAllAsRead(): Promise<void> {
        await api.patch('/notifications/read-all');
    },
};
