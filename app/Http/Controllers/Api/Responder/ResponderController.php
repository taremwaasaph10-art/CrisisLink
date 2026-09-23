<?php

namespace App\Http\Controllers\Api\Responder;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\EmergencyReport;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

/**
 * The field responders a request can be assigned to, with their current workload.
 */
class ResponderController extends Controller
{
    public function index(): JsonResponse
    {
        Gate::authorize('manage', EmergencyReport::class);

        $responders = User::query()
            ->responders()
            ->withCount(['assignments as active_assignments_count' => fn (Builder $query) => $query->whereNull('completed_at')])
            ->orderBy('name')
            ->get();

        return $this->success(UserResource::collection($responders));
    }
}
