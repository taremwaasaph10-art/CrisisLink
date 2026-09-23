<?php

use App\Models\Notification;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('lists the user\'s own notifications with the unread count', function () {
    $user = User::factory()->create();
    Notification::factory()->for($user)->create();
    Notification::factory()->for($user)->read()->create();
    Notification::factory()->create();
    Sanctum::actingAs($user);

    $this->getJson('/api/notifications')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.unread_count', 1);
});

it('returns the unread count', function () {
    $user = User::factory()->create();
    Notification::factory()->for($user)->count(3)->create();
    Sanctum::actingAs($user);

    $this->getJson('/api/notifications/unread-count')
        ->assertOk()
        ->assertJsonPath('data.unread_count', 3);
});

it('marks a notification as read', function () {
    $user = User::factory()->create();
    $notification = Notification::factory()->for($user)->create();
    Sanctum::actingAs($user);

    $this->patchJson("/api/notifications/{$notification->id}/read")->assertOk();

    expect($notification->refresh()->read_at)->not->toBeNull();
});

it('returns 404 when marking another user\'s notification as read', function () {
    $notification = Notification::factory()->create();
    Sanctum::actingAs(User::factory()->create());

    $this->patchJson("/api/notifications/{$notification->id}/read")->assertNotFound();

    expect($notification->refresh()->read_at)->toBeNull();
});

it('marks all of the user\'s notifications as read', function () {
    $user = User::factory()->create();
    Notification::factory()->for($user)->count(2)->create();
    $someoneElses = Notification::factory()->create();
    Sanctum::actingAs($user);

    $this->patchJson('/api/notifications/read-all')->assertOk();

    expect($user->notifications()->unread()->count())->toBe(0)
        ->and($someoneElses->refresh()->read_at)->toBeNull();
});
