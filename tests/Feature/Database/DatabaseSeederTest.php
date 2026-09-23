<?php

use App\Enums\UserRole;
use App\Models\EmergencyReport;
use App\Models\EmergencyType;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

it('seeds the emergency types, demo accounts and sample requests', function () {
    $this->seed(DatabaseSeeder::class);

    expect(EmergencyType::query()->pluck('name')->all())
        ->toBe(['Flood', 'Fire', 'Medical', 'Evacuation', 'Food/Water', 'Shelter', 'Other']);

    expect(User::query()->where('email', 'citizen@example.com')->value('role'))->toBe(UserRole::Citizen)
        ->and(User::query()->where('email', 'responder@example.com')->value('role'))->toBe(UserRole::Responder)
        ->and(User::query()->where('email', 'admin@example.com')->value('role'))->toBe(UserRole::Admin);

    expect(EmergencyReport::query()->active()->count())->toBeGreaterThan(0)
        ->and(EmergencyReport::query()->whereNull('reference_number')->count())->toBe(0);
});
