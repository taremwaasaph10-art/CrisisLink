<?php

namespace App\Http\Resources;

use App\Models\EmergencyAlert;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin EmergencyAlert
 */
class EmergencyAlertResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->message,
            'severity' => $this->severity->value,
            'area' => $this->area,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
