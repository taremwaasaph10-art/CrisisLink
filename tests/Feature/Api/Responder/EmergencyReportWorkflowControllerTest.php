<?php

use App\Enums\ReportPriority;
use App\Enums\ReportStatus;
use App\Models\EmergencyReport;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('takes a request from submitted to resolved and keeps the citizen informed', function () {
    $citizen = User::factory()->citizen()->create();
    $dutyOfficer = User::factory()->responder()->create();
    $fieldResponder = User::factory()->responder()->create(['name' => 'Yacine Haddad']);
    $report = EmergencyReport::factory()->for($citizen, 'reporter')->create();
    $url = "/api/responder/emergency-reports/{$report->id}";
    Sanctum::actingAs($dutyOfficer);

    $this->patchJson("{$url}/status", ['status' => 'under_review'])
        ->assertOk()
        ->assertJsonPath('data.status', 'under_review');

    $this->patchJson("{$url}/verify", ['priority' => 'critical'])
        ->assertOk()
        ->assertJsonPath('data.status', 'verified')
        ->assertJsonPath('data.priority', 'critical');

    $this->patchJson("{$url}/assign", ['responder_id' => $fieldResponder->id, 'notes' => 'Bring a boat.'])
        ->assertOk()
        ->assertJsonPath('message', 'Yacine Haddad has been assigned.')
        ->assertJsonPath('data.assignment.responder.name', 'Yacine Haddad')
        ->assertJsonPath('data.assignment.notes', 'Bring a boat.');

    $this->patchJson("{$url}/status", ['status' => 'in_progress'])->assertOk();

    $this->patchJson("{$url}/status", ['status' => 'resolved'])
        ->assertOk()
        ->assertJsonPath('data.status', 'resolved')
        ->assertJsonPath('data.next_status', null)
        ->assertJsonCount(5, 'data.timeline');

    $report->refresh();
    expect($report->status)->toBe(ReportStatus::Resolved)
        ->and($report->currentAssignment->completed_at)->not->toBeNull();

    expect($citizen->notifications()->oldest('id')->pluck('title')->all())->toBe([
        'Request under review',
        'Request verified',
        'Responder assigned',
        'Help is on the way',
        'Request resolved',
    ]);
    expect($fieldResponder->notifications()->sole()->title)->toBe('New assignment');
});

it('rejects verifying a request that has not been reviewed yet', function () {
    $report = EmergencyReport::factory()->create();
    Sanctum::actingAs(User::factory()->responder()->create());

    $this->patchJson("/api/responder/emergency-reports/{$report->id}/verify")
        ->assertUnprocessable()
        ->assertJsonPath('errors.status.0', 'This request is Submitted and cannot be marked as Verified.');

    expect($report->refresh()->status)->toBe(ReportStatus::Submitted);
});

it('rejects resolving a request that was never assigned', function () {
    $report = EmergencyReport::factory()->status(ReportStatus::Verified)->create();
    Sanctum::actingAs(User::factory()->responder()->create());

    $this->patchJson("/api/responder/emergency-reports/{$report->id}/status", ['status' => 'resolved'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.status.0', 'This request is Verified and cannot be marked as Resolved.');
});

it('rejects statuses that have their own endpoint', function (string $status) {
    $report = EmergencyReport::factory()->status(ReportStatus::UnderReview)->create();
    Sanctum::actingAs(User::factory()->responder()->create());

    $this->patchJson("/api/responder/emergency-reports/{$report->id}/status", ['status' => $status])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('status');
})->with(['verified', 'assigned', 'submitted']);

it('rejects assigning someone who is not a responder', function () {
    $report = EmergencyReport::factory()->status(ReportStatus::Verified)->create();
    $citizen = User::factory()->citizen()->create();
    Sanctum::actingAs(User::factory()->responder()->create());

    $this->patchJson("/api/responder/emergency-reports/{$report->id}/assign", ['responder_id' => $citizen->id])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['responder_id' => 'Please choose a valid responder.']);

    expect($report->assignments()->count())->toBe(0);
});

it('changes the priority of an active request', function () {
    $report = EmergencyReport::factory()->create();
    Sanctum::actingAs(User::factory()->responder()->create());

    $this->patchJson("/api/responder/emergency-reports/{$report->id}/priority", ['priority' => 'critical'])
        ->assertOk()
        ->assertJsonPath('message', 'Priority set to Critical.');

    expect($report->refresh()->priority)->toBe(ReportPriority::Critical);
});

it('rejects changing the priority of a resolved request', function () {
    $report = EmergencyReport::factory()->status(ReportStatus::Resolved)->create();
    Sanctum::actingAs(User::factory()->responder()->create());

    $this->patchJson("/api/responder/emergency-reports/{$report->id}/priority", ['priority' => 'low'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['priority' => 'The priority of a resolved request cannot be changed.']);
});

it('forbids citizens from using triage actions with 403', function (string $action, array $payload) {
    $citizen = User::factory()->citizen()->create();
    $report = EmergencyReport::factory()->for($citizen, 'reporter')->create();
    Sanctum::actingAs($citizen);

    $this->patchJson("/api/responder/emergency-reports/{$report->id}/{$action}", $payload)
        ->assertForbidden();

    expect($report->refresh()->status)->toBe(ReportStatus::Submitted);
})->with([
    'verify' => ['verify', []],
    'assign' => ['assign', ['responder_id' => 1]],
    'status' => ['status', ['status' => 'under_review']],
    'priority' => ['priority', ['priority' => 'low']],
]);

it('lets admins triage requests', function () {
    $report = EmergencyReport::factory()->create();
    Sanctum::actingAs(User::factory()->admin()->create());

    $this->patchJson("/api/responder/emergency-reports/{$report->id}/status", ['status' => 'under_review'])
        ->assertOk();
});
