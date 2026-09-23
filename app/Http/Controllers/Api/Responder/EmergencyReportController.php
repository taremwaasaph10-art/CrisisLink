<?php

namespace App\Http\Controllers\Api\Responder;

use App\Http\Controllers\Controller;
use App\Http\Requests\Responder\IndexEmergencyReportRequest;
use App\Http\Resources\EmergencyReportResource;
use App\Models\EmergencyReport;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

/**
 * Every citizen's emergency requests, as seen by responders.
 */
class EmergencyReportController extends Controller
{
    public function index(IndexEmergencyReportRequest $request): JsonResponse
    {
        $filters = $request->validated();

        $reports = EmergencyReport::query()
            ->with(['emergencyType', 'currentAssignment.responder'])
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->whereIn(
                'status',
                IndexEmergencyReportRequest::STATUS_GROUPS[$status] ?? [$status],
            ))
            ->when($filters['priority'] ?? null, fn (Builder $query, string $priority) => $query->where('priority', $priority))
            ->when($filters['emergency_type_id'] ?? null, fn (Builder $query, int|string $typeId) => $query->where('emergency_type_id', $typeId))
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(
                fn (Builder $query) => $query
                    ->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('location_description', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%"),
            ))
            ->orderByUrgency()
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();

        return $this->success(EmergencyReportResource::collection($reports));
    }

    public function show(EmergencyReport $emergencyReport): JsonResponse
    {
        Gate::authorize('manage', $emergencyReport);

        return $this->success(EmergencyReportResource::make(
            $emergencyReport->load(EmergencyReport::DETAIL_RELATIONS),
        ));
    }
}
