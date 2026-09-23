<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreResponderRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ResponderController extends Controller
{
    public function store(StoreResponderRequest $request): JsonResponse
    {
        $responder = new User($request->safe()->only(['name', 'email', 'phone', 'password']));
        $responder->role = UserRole::Responder;
        $responder->save();

        return $this->success(UserResource::make($responder), 'Responder account created.', 201);
    }
}
