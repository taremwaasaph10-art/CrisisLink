<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmergencyReportRequest;
use App\Http\Resources\EmergencyReportResource;
use App\Models\EmergencyReport;
use App\Services\EmergencyReportWorkflow;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * A citizen's own emergency requests.
 */
class EmergencyReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reports = $request->user()
            ->emergencyReports()
            ->with(['emergencyType', 'currentAssignment.responder'])
            ->latest('reported_at')
            ->latest('id')
            ->get();

        return $this->success(EmergencyReportResource::collection($reports));
    }

    public function store(StoreEmergencyReportRequest $request, EmergencyReportWorkflow $workflow): JsonResponse
    {
        $report = $workflow->submit(
            $request->user(),
            $request->reportAttributes(),
            $request->file('photo'),
        );

        return $this->success(
            EmergencyReportResource::make($report->load(EmergencyReport::DETAIL_RELATIONS)),
            'Emergency request created successfully.',
            201,
        );
    }

    public function show(EmergencyReport $emergencyReport): JsonResponse
    {
        Gate::authorize('view', $emergencyReport);

        return $this->success(EmergencyReportResource::make(
            $emergencyReport->load(EmergencyReport::DETAIL_RELATIONS),
        ));
    }
}
