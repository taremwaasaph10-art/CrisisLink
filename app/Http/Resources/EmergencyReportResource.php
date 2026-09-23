<?php

namespace App\Http\Resources;

use App\Models\EmergencyReport;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin EmergencyReport
 */
class EmergencyReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * The reporter's contact details are only shared with responders.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $viewerCanRespond = (bool) $request->user()?->canRespond();

        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
            'type' => EmergencyTypeResource::make($this->whenLoaded('emergencyType')),
            'description' => $this->description,
            'people_affected' => $this->people_affected,
            'location' => [
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
                'description' => $this->location_description,
            ],
            'priority' => $this->priority->value,
            'status' => $this->status->value,
            'next_status' => $this->status->next()?->value,
            'photo_url' => $this->photoUrl(),
            'reported_at' => $this->reported_at->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'assignment' => EmergencyAssignmentResource::make($this->whenLoaded('currentAssignment')),
            'timeline' => EmergencyStatusUpdateResource::collection($this->whenLoaded('statusUpdates')),
            'reporter' => $this->when(
                $viewerCanRespond && $this->relationLoaded('reporter'),
                fn () => [
                    'id' => $this->reporter->id,
                    'name' => $this->reporter->name,
                    'phone' => $this->reporter->phone,
                    'email' => $this->reporter->email,
                ],
            ),
        ];
    }

    /**
     * A signed, expiring link to the private photo. The expiry is pinned to
     * the hour so the URL stays stable while the frontend polls for updates.
     */
    private function photoUrl(): ?string
    {
        if ($this->photo_path === null) {
            return null;
        }

        return Storage::temporaryUrl($this->photo_path, now()->startOfHour()->addHours(2));
    }
}
