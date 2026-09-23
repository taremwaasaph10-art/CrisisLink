<?php

use App\Enums\ReportPriority;
use App\Enums\ReportStatus;
use App\Models\EmergencyReport;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('summarises requests by stage', function () {
    EmergencyReport::factory()->status(ReportStatus::Submitted)->priority(ReportPriority::Critical)->create();
    EmergencyReport::factory()->status(ReportStatus::UnderReview)->create();
    EmergencyReport::factory()->status(ReportStatus::Verified)->create();
    EmergencyReport::factory()->status(ReportStatus::Assigned)->create();
    EmergencyReport::factory()->status(ReportStatus::InProgress)->priority(ReportPriority::Critical)->create();
    EmergencyReport::factory()->count(2)->status(ReportStatus::Resolved)->priority(ReportPriority::Critical)->create();
    Sanctum::actingAs(User::factory()->responder()->create());

    $this->getJson('/api/responder/dashboard')
        ->assertOk()
        ->assertJsonPath('data.stats', [
            'active' => 5,
            'critical' => 2,
            'pending_verification' => 2,
            'assigned' => 2,
            'resolved' => 2,
        ])
        ->assertJsonCount(5, 'data.active_requests');
});

it('forbids citizens with 403', function () {
    Sanctum::actingAs(User::factory()->citizen()->create());

    $this->getJson('/api/responder/dashboard')->assertForbidden();
});
