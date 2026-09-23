<?php

use App\Enums\UserRole;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('lets an admin create a responder account', function () {
    Sanctum::actingAs(User::factory()->admin()->create());

    $this->postJson('/api/admin/responders', [
        'name' => 'Nadia Bouzid',
        'email' => 'nadia@example.com',
        'phone' => '+213555445566',
        'password' => 'field-team-2026',
    ])
        ->assertCreated()
        ->assertJsonPath('data.role', 'responder');

    expect(User::query()->where('email', 'nadia@example.com')->value('role'))->toBe(UserRole::Responder);
});

it('forbids responders from creating accounts with 403', function () {
    Sanctum::actingAs(User::factory()->responder()->create());

    $this->postJson('/api/admin/responders', [
        'name' => 'Someone',
        'email' => 'someone@example.com',
        'password' => 'field-team-2026',
    ])->assertForbidden();

    expect(User::query()->where('email', 'someone@example.com')->exists())->toBeFalse();
});

it('lists responders with their open assignment count', function () {
    User::factory()->responder()->create(['name' => 'Yacine Haddad']);
    User::factory()->citizen()->create();
    Sanctum::actingAs(User::factory()->admin()->create());

    $this->getJson('/api/responder/responders')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Yacine Haddad')
        ->assertJsonPath('data.0.active_assignments_count', 0);
});
