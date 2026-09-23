<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\EmergencyReport;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class EmergencyReportPolicy
{
    /**
     * Citizens may only see their own requests. Anyone else's request is
     * reported as missing so its existence is not revealed.
     */
    public function view(User $user, EmergencyReport $emergencyReport): Response
    {
        return $user->canRespond() || $emergencyReport->user_id === $user->id
            ? Response::allow()
            : Response::denyAsNotFound();
    }

    /**
     * Only citizens raise emergency requests.
     */
    public function create(User $user): bool
    {
        return $user->hasRole(UserRole::Citizen);
    }

    /**
     * Triage actions: review, verify, prioritise, assign and resolve.
     */
    public function manage(User $user, ?EmergencyReport $emergencyReport = null): bool
    {
        return $user->canRespond();
    }
}
