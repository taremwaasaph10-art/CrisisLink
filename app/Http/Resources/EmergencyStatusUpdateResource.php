<?php

namespace App\Http\Resources;

use App\Models\EmergencyStatusUpdate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin EmergencyStatusUpdate
 */
class EmergencyStatusUpdateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $viewerCanRespond = (bool) $request->user()?->canRespond();

        return [
            'id' => $this->id,
            'status' => $this->to_status->value,
            'from_status' => $this->from_status?->value,
            'created_at' => $this->created_at?->toIso8601String(),
            'note' => $this->when($viewerCanRespond, $this->note),
            'actor' => $this->when(
                $viewerCanRespond && $this->relationLoaded('user'),
                fn () => $this->user?->name,
            ),
        ];
    }
}
