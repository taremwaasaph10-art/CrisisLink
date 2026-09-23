<?php

use App\Enums\ReportPriority;
use App\Enums\ReportStatus;
use App\Models\EmergencyReport;
use App\Models\EmergencyType;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('lists open requests before resolved ones, most urgent first', function () {
    $resolved = EmergencyReport::factory()->status(ReportStatus::Resolved)->priority(ReportPriority::Critical)->create();
    $medium = EmergencyReport::factory()->priority(ReportPriority::Medium)->create();
    $critical = EmergencyReport::factory()->priority(ReportPriority::Critical)->create();
    Sanctum::actingAs(User::factory()->responder()->create());

    $this->getJson('/api/responder/emergency-reports')
        ->assertOk()
        ->assertJsonPath('data.*.id', [$critical->id, $medium->id, $resolved->id])
        ->assertJsonPath('meta.total', 3);
});

it('filters requests', function (array $query, string $expected) {
    $flood = EmergencyType::factory()->create();
    $reports = [
        'active-flood' => EmergencyReport::factory()->for($flood)->create(),
        'resolved' => EmergencyReport::factory()->status(ReportStatus::Resolved)->create(),
        'critical' => EmergencyReport::factory()->priority(ReportPriority::Critical)->create(),
    ];
    Sanctum::actingAs(User::factory()->responder()->create());

    $query = array_map(fn ($value) => $value === 'FLOOD_ID' ? $flood->id : $value, $query);

    $this->getJson('/api/responder/emergency-reports?'.http_build_query($query))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $reports[$expected]->id);
})->with([
    'by status' => [['status' => 'resolved'], 'resolved'],
    'by priority' => [['priority' => 'critical'], 'critical'],
    'by type' => [['emergency_type_id' => 'FLOOD_ID'], 'active-flood'],
]);

it('excludes resolved requests from the active filter', function () {
    EmergencyReport::factory()->status(ReportStatus::Resolved)->create();
    $open = EmergencyReport::factory()->status(ReportStatus::InProgress)->create();
    Sanctum::actingAs(User::factory()->responder()->create());

    $this->getJson('/api/responder/emergency-reports?status=active')
        ->assertOk()
        ->assertJsonPath('data.*.id', [$open->id]);
});

it('filters by the dashboard\'s status groups', function (string $group, array $expectedStatuses) {
    foreach (ReportStatus::cases() as $status) {
        EmergencyReport::factory()->status($status)->create();
    }
    Sanctum::actingAs(User::factory()->responder()->create());

    $statuses = $this->getJson("/api/responder/emergency-reports?status={$group}")
        ->assertOk()
        ->json('data.*.status');

    expect($statuses)->toEqualCanonicalizing($expectedStatuses);
})->with([
    'pending verification' => ['pending_verification', ['submitted', 'under_review']],
    'with a responder' => ['with_responder', ['assigned', 'in_progress']],
]);

it('finds a request by its reference number', function () {
    $wanted = EmergencyReport::factory()->create();
    EmergencyReport::factory()->create();
    Sanctum::actingAs(User::factory()->responder()->create());

    $this->getJson("/api/responder/emergency-reports?search={$wanted->reference_number}")
        ->assertOk()
        ->assertJsonPath('data.*.id', [$wanted->id]);
});

it('shows the reporter\'s contact details to responders', function () {
    $citizen = User::factory()->citizen()->create(['phone' => '+213555000111']);
    $report = EmergencyReport::factory()->for($citizen, 'reporter')->create();
    Sanctum::actingAs(User::factory()->responder()->create());

    $this->getJson("/api/responder/emergency-reports/{$report->id}")
        ->assertOk()
        ->assertJsonPath('data.reporter.phone', '+213555000111');
});

it('forbids citizens from the responder list with 403', function () {
    Sanctum::actingAs(User::factory()->citizen()->create());

    $this->getJson('/api/responder/emergency-reports')->assertForbidden();
});
