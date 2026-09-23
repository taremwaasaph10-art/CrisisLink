<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\EmergencyAssignmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $emergency_report_id
 * @property int $responder_id
 * @property int|null $assigned_by
 * @property CarbonImmutable $assigned_at
 * @property CarbonImmutable|null $completed_at
 * @property string|null $notes
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable(['responder_id', 'assigned_by', 'assigned_at', 'completed_at', 'notes'])]
class EmergencyAssignment extends Model
{
    /** @use HasFactory<EmergencyAssignmentFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<EmergencyReport, $this>
     */
    public function emergencyReport(): BelongsTo
    {
        return $this->belongsTo(EmergencyReport::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function responder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responder_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
