<?php

use App\Enums\UserRole;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('issues a token and returns the role when credentials are valid', function () {
    $responder = User::factory()->responder()->create(['email' => 'duty@example.com']);

    $response = $this->postJson('/api/login', [
        'email' => 'duty@example.com',
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.id', $responder->id)
        ->assertJsonPath('data.user.role', 'responder');

    expect($response->json('data.token'))->toBeString()->not->toBeEmpty();
    expect($responder->tokens()->count())->toBe(1);
});

it('returns 422 with the standard error envelope when the password is wrong', function () {
    User::factory()->create(['email' => 'lina@example.com']);

    $this->postJson('/api/login', ['email' => 'lina@example.com', 'password' => 'wrong-password'])
        ->assertUnprocessable()
        ->assertJsonPath('success', false)
        ->assertJsonPath('errors.email.0', 'These credentials do not match our records.');
});

it('registers new accounts as citizens even when another role is requested', function () {
    $this->postJson('/api/register', [
        'name' => 'Omar Kaci',
        'email' => 'omar@example.com',
        'password' => 'secret-pass-123',
        'password_confirmation' => 'secret-pass-123',
        'role' => 'responder',
    ])
        ->assertCreated()
        ->assertJsonPath('data.user.role', 'citizen');

    expect(User::query()->where('email', 'omar@example.com')->value('role'))->toBe(UserRole::Citizen);
});

it('returns 401 in the standard error envelope when no token is provided', function () {
    $this->getJson('/api/user')
        ->assertUnauthorized()
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'Your session has expired. Please log in again.');
});

it('revokes the current token on logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $this->withToken($token)->postJson('/api/logout')->assertOk();

    expect($user->tokens()->count())->toBe(0);
});

it('returns the authenticated user', function () {
    $user = User::factory()->citizen()->create();
    Sanctum::actingAs($user);

    $this->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('data.email', $user->email)
        ->assertJsonMissingPath('data.password');
});
