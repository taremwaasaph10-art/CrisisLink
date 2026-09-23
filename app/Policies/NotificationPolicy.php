<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class NotificationPolicy
{
    public function update(User $user, Notification $notification): Response
    {
        return $notification->user_id === $user->id
            ? Response::allow()
            : Response::denyAsNotFound();
    }
}
