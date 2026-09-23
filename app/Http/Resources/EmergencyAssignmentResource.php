<?php

namespace App\Http\Resources;

use App\Models\EmergencyAssignment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin EmergencyAssignment
 */
class EmergencyAssignmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * Citizens see who is helping them; contact details and internal notes
     * stay with responders.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $viewerCanRespond = (bool) $request->user()?->canRespond();

        return [
            'id' => $this->id,
            'responder' => $this->whenLoaded('responder', fn () => [
                'id' => $this->responder->id,
                'name' => $this->responder->name,
                'phone' => $this->when($viewerCanRespond, $this->responder->phone),
            ]),
            'assigned_at' => $this->assigned_at->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'notes' => $this->when($viewerCanRespond, $this->notes),
        ];
    }
}
