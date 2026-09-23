<?php

namespace App\Http\Controllers\Api;

use App\Enums\AlertSeverity;
use App\Http\Controllers\Controller;
use App\Http\Resources\EmergencyAlertResource;
use App\Models\EmergencyAlert;
use Illuminate\Http\JsonResponse;

class EmergencyAlertController extends Controller
{
    /**
     * Active alerts, most severe first so a flood warning is never buried.
     */
    public function index(): JsonResponse
    {
        return $this->success(EmergencyAlertResource::collection(
            EmergencyAlert::query()
                ->active()
                ->orderByRaw('CASE severity WHEN ? THEN 0 WHEN ? THEN 1 ELSE 2 END', [AlertSeverity::Danger->value, AlertSeverity::Warning->value])
                ->latest()
                ->latest('id')
                ->limit(10)
                ->get(),
        ));
    }
}
