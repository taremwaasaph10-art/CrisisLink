<?php

use App\Enums\ReportStatus;

test('each status can only move to the next step of the workflow', function (ReportStatus $from, ?ReportStatus $to) {
    foreach (ReportStatus::cases() as $candidate) {
        expect($from->canTransitionTo($candidate))->toBe($candidate === $to);
    }
})->with([
    'submitted' => [ReportStatus::Submitted, ReportStatus::UnderReview],
    'under review' => [ReportStatus::UnderReview, ReportStatus::Verified],
    'verified' => [ReportStatus::Verified, ReportStatus::Assigned],
    'assigned' => [ReportStatus::Assigned, ReportStatus::InProgress],
    'in progress' => [ReportStatus::InProgress, ReportStatus::Resolved],
    'resolved' => [ReportStatus::Resolved, null],
]);

test('every status except resolved is active', function () {
    expect(ReportStatus::active())->not->toContain(ReportStatus::Resolved)
        ->and(ReportStatus::active())->toHaveCount(5);
});
