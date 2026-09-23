<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->string('email')->lower()->toString())->first();

        if ($user === null || ! Hash::check($request->string('password')->toString(), $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        return $this->success(
            $this->tokenPayload($user, $request->input('device_name')),
            'Logged in successfully.',
        );
    }

    /**
     * Public sign-up is for citizens only; responder accounts are created by an admin.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = new User($request->safe()->only(['name', 'email', 'phone', 'password']));
        $user->role = UserRole::Citizen;
        $user->save();

        return $this->success($this->tokenPayload($user), 'Account created successfully.', 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully.');
    }

    public function user(Request $request): JsonResponse
    {
        return $this->success(UserResource::make($request->user()));
    }

    /**
     * @return array{token: string, user: UserResource}
     */
    private function tokenPayload(User $user, ?string $deviceName = null): array
    {
        return [
            'token' => $user->createToken($deviceName ?: 'crisislink-web')->plainTextToken,
            'user' => UserResource::make($user),
        ];
    }
}
