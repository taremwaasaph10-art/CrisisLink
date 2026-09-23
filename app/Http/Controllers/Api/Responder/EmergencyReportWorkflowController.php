<?php

namespace App\Http\Controllers\Api\Responder;

use App\Enums\ReportPriority;
use App\Enums\ReportStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Responder\AssignEmergencyReportRequest;
use App\Http\Requests\Responder\UpdateEmergencyReportPriorityRequest;
use App\Http\Requests\Responder\UpdateEmergencyReportStatusRequest;
use App\Http\Requests\Responder\VerifyEmergencyReportRequest;
use App\Http\Resources\EmergencyReportResource;
use App\Models\EmergencyReport;
use App\Models\User;
use App\Services\EmergencyReportWorkflow;
use Illuminate\Http\JsonResponse;

/**
 * The responder's triage actions on a single emergency request.
 */
class EmergencyReportWorkflowController extends Controller
{
    public function __construct(private EmergencyReportWorkflow $workflow) {}

    public function verify(VerifyEmergencyReportRequest $request, EmergencyReport $emergencyReport): JsonResponse
    {
        $report = $this->workflow->verify(
            $emergencyReport,
            $request->user(),
            $request->enum('priority', ReportPriority::class),
            $request->validated('note'),
        );

        return $this->respondWith($report, 'Request verified.');
    }

    public function assign(AssignEmergencyReportRequest $request, EmergencyReport $emergencyReport): JsonResponse
    {
        $assignee = User::query()->findOrFail($request->integer('responder_id'));

        $report = $this->workflow->assign($emergencyReport, $assignee, $request->user(), $request->validated('notes'));

        return $this->respondWith($report, "{$assignee->name} has been assigned.");
    }

    public function updateStatus(UpdateEmergencyReportStatusRequest $request, EmergencyReport $emergencyReport): JsonResponse
    {
        $status = $request->enum('status', ReportStatus::class);

        $report = $this->workflow->advanceTo($emergencyReport, $status, $request->user(), $request->validated('note'));

        return $this->respondWith($report, "Request marked as {$status->label()}.");
    }

    public function updatePriority(UpdateEmergencyReportPriorityRequest $request, EmergencyReport $emergencyReport): JsonResponse
    {
        $priority = $request->enum('priority', ReportPriority::class);

        $report = $this->workflow->changePriority($emergencyReport, $priority);

        return $this->respondWith($report, "Priority set to {$priority->label()}.");
    }

    private function respondWith(EmergencyReport $report, string $message): JsonResponse
    {
        return $this->success(
            EmergencyReportResource::make($report->load(EmergencyReport::DETAIL_RELATIONS)),
            $message,
        );
    }
}
