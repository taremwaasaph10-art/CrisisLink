<?php

namespace App\Services;

use App\Models\EmergencyReport;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Writes in-app notifications to a user's inbox.
 *
 * Email, SMS and push delivery are future channels; for the MVP every
 * notification is stored and polled by the frontend.
 */
class InAppNotifier
{
    public function notify(User $user, string $title, string $message, ?EmergencyReport $report = null): Notification
    {
        return $user->notifications()->create([
            'title' => $title,
            'message' => $message,
            'emergency_report_id' => $report?->id,
        ]);
    }

    /**
     * @return Collection<int, Notification>
     */
    public function notifyResponders(string $title, string $message, ?EmergencyReport $report = null): Collection
    {
        return User::query()
            ->responders()
            ->get()
            ->map(fn (User $responder) => $this->notify($responder, $title, $message, $report));
    }
}
