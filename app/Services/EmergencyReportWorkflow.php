<?php

namespace App\Services;

use App\Enums\ReportPriority;
use App\Enums\ReportStatus;
use App\Models\EmergencyReport;
use App\Models\User;
use Closure;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * Owns the life of an emergency request: submission and every status change
 * along the linear path submitted → under_review → verified → assigned →
 * in_progress → resolved. Each change is recorded on the timeline and the
 * citizen is notified.
 */
class EmergencyReportWorkflow
{
    public function __construct(private InAppNotifier $notifier) {}

    /**
     * @param  array{emergency_type_id: int, description: string, people_affected: int, latitude: float|null, longitude: float|null, location_description: string|null}  $attributes
     */
    public function submit(User $citizen, array $attributes, ?UploadedFile $photo = null): EmergencyReport
    {
        $photoPath = $photo?->store('emergency-photos');

        try {
            return DB::transaction(function () use ($citizen, $attributes, $photoPath) {
                $report = new EmergencyReport($attributes);
                $report->photo_path = $photoPath ?: null;
                $report->reported_at = now();
                $report->reporter()->associate($citizen);
                $report->save();

                $report->reference_number = EmergencyReport::referenceFor($report->id);
                $report->save();

                $report->statusUpdates()->create([
                    'user_id' => $citizen->id,
                    'to_status' => ReportStatus::Submitted,
                ]);

                $report->load('emergencyType');

                $this->notifier->notify(
                    $citizen,
                    'Request received',
                    "Your request {$report->reference_number} has been received. A responder will review it shortly.",
                    $report,
                );

                $this->notifier->notifyResponders(
                    'New emergency request',
                    "{$report->reference_number} · {$report->emergencyType->name} · {$report->people_affected} ".str('person')->plural($report->people_affected).' affected',
                    $report,
                );

                return $report;
            });
        } catch (Throwable $exception) {
            if ($photoPath) {
                Storage::delete($photoPath);
            }

            throw $exception;
        }
    }

    public function startReview(EmergencyReport $report, User $responder, ?string $note = null): EmergencyReport
    {
        return $this->transition($report, ReportStatus::UnderReview, $responder, $note);
    }

    public function verify(EmergencyReport $report, User $responder, ?ReportPriority $priority = null, ?string $note = null): EmergencyReport
    {
        return $this->transition($report, ReportStatus::Verified, $responder, $note, function (EmergencyReport $report) use ($priority) {
            if ($priority !== null) {
                $report->priority = $priority;
            }
        });
    }

    public function assign(EmergencyReport $report, User $assignee, User $assignedBy, ?string $notes = null): EmergencyReport
    {
        return $this->transition($report, ReportStatus::Assigned, $assignedBy, $notes, function (EmergencyReport $report) use ($assignee, $assignedBy, $notes) {
            $report->assignments()->create([
                'responder_id' => $assignee->id,
                'assigned_by' => $assignedBy->id,
                'assigned_at' => now(),
                'notes' => $notes,
            ]);

            $this->notifier->notify(
                $assignee,
                'New assignment',
                "You have been assigned to {$report->reference_number}. Please respond as soon as possible.",
                $report,
            );
        });
    }

    public function markInProgress(EmergencyReport $report, User $responder, ?string $note = null): EmergencyReport
    {
        return $this->transition($report, ReportStatus::InProgress, $responder, $note);
    }

    public function resolve(EmergencyReport $report, User $responder, ?string $note = null): EmergencyReport
    {
        return $this->transition($report, ReportStatus::Resolved, $responder, $note, function (EmergencyReport $report) {
            $report->assignments()->whereNull('completed_at')->update(['completed_at' => now()]);
        });
    }

    /**
     * Move the request along its workflow via the matching named step.
     */
    public function advanceTo(EmergencyReport $report, ReportStatus $status, User $responder, ?string $note = null): EmergencyReport
    {
        return match ($status) {
            ReportStatus::UnderReview => $this->startReview($report, $responder, $note),
            ReportStatus::InProgress => $this->markInProgress($report, $responder, $note),
            ReportStatus::Resolved => $this->resolve($report, $responder, $note),
            default => throw ValidationException::withMessages([
                'status' => "Use the dedicated action to mark a request as {$status->label()}.",
            ]),
        };
    }

    public function changePriority(EmergencyReport $report, ReportPriority $priority): EmergencyReport
    {
        if (! $report->status->isActive()) {
            throw ValidationException::withMessages([
                'priority' => 'The priority of a resolved request cannot be changed.',
            ]);
        }

        $report->priority = $priority;
        $report->save();

        return $report;
    }

    /**
     * @param  (Closure(EmergencyReport): void)|null  $alongside  extra writes made in the same transaction
     */
    private function transition(EmergencyReport $report, ReportStatus $to, User $actor, ?string $note = null, ?Closure $alongside = null): EmergencyReport
    {
        return DB::transaction(function () use ($report, $to, $actor, $note, $alongside) {
            $locked = EmergencyReport::query()->whereKey($report->id)->lockForUpdate()->firstOrFail();
            $from = $locked->status;

            if (! $from->canTransitionTo($to)) {
                throw ValidationException::withMessages([
                    'status' => "This request is {$from->label()} and cannot be marked as {$to->label()}.",
                ]);
            }

            $locked->status = $to;

            if ($alongside !== null) {
                $alongside($locked);
            }

            $locked->save();

            $locked->statusUpdates()->create([
                'user_id' => $actor->id,
                'from_status' => $from,
                'to_status' => $to,
                'note' => $note,
            ]);

            $this->notifyCitizen($locked, $to);

            return $locked;
        });
    }

    private function notifyCitizen(EmergencyReport $report, ReportStatus $status): void
    {
        $reference = $report->reference_number;

        [$title, $message] = match ($status) {
            ReportStatus::UnderReview => ['Request under review', "A responder is now reviewing your request {$reference}."],
            ReportStatus::Verified => ['Request verified', "Your request {$reference} has been verified."],
            ReportStatus::Assigned => ['Responder assigned', "A responder has been assigned to your request {$reference}."],
            ReportStatus::InProgress => ['Help is on the way', "A responder is now working on your request {$reference}."],
            ReportStatus::Resolved => ['Request resolved', "Your emergency request {$reference} has been resolved. Stay safe."],
            ReportStatus::Submitted => ['Request received', "Your request {$reference} has been received."],
        };

        $report->loadMissing('reporter');

        $this->notifier->notify($report->reporter, $title, $message, $report);
    }
}
