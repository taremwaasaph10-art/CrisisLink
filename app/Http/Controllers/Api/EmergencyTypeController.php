<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmergencyTypeResource;
use App\Models\EmergencyType;
use Illuminate\Http\JsonResponse;

class EmergencyTypeController extends Controller
{
    public function index(): JsonResponse
    {
        return $this->success(EmergencyTypeResource::collection(
            EmergencyType::query()->orderBy('id')->get(),
        ));
    }
}
