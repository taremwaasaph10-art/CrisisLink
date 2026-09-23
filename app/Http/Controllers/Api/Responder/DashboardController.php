<?php

namespace App\Http\Controllers\Api\Responder;

use App\Enums\ReportPriority;
use App\Enums\ReportStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\EmergencyReportResource;
use App\Models\EmergencyReport;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        Gate::authorize('manage', EmergencyReport::class);

        $counts = EmergencyReport::query()
            ->selectRaw('status, priority, COUNT(*) as aggregate')
            ->groupBy('status', 'priority')
            ->get();

        $total = fn (Closure $matches): int => (int) $counts->filter($matches)->sum('aggregate');

        $activeRequests = EmergencyReport::query()
            ->active()
            ->with(['emergencyType', 'currentAssignment.responder'])
            ->orderByUrgency()
            ->limit(6)
            ->get();

        return $this->success([
            'stats' => [
                'active' => $total(fn (EmergencyReport $row) => $row->status->isActive()),
                'critical' => $total(fn (EmergencyReport $row) => $row->status->isActive() && $row->priority === ReportPriority::Critical),
                'pending_verification' => $total(fn (EmergencyReport $row) => in_array($row->status, ReportStatus::pendingVerification(), true)),
                'assigned' => $total(fn (EmergencyReport $row) => in_array($row->status, ReportStatus::withResponder(), true)),
                'resolved' => $total(fn (EmergencyReport $row) => $row->status === ReportStatus::Resolved),
            ],
            'active_requests' => EmergencyReportResource::collection($activeRequests),
        ]);
    }
}
