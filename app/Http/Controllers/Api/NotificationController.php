<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->latest('id')
            ->limit(50)
            ->get();

        return $this->success(
            NotificationResource::collection($notifications)->additional([
                'meta' => ['unread_count' => $request->user()->notifications()->unread()->count()],
            ]),
        );
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return $this->success([
            'unread_count' => $request->user()->notifications()->unread()->count(),
        ]);
    }

    public function markAsRead(Notification $notification): JsonResponse
    {
        Gate::authorize('update', $notification);

        $notification->markAsRead();

        return $this->success(NotificationResource::make($notification), 'Notification marked as read.');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->notifications()->unread()->update(['read_at' => now()]);

        return $this->success(null, 'All notifications marked as read.');
    }
}
