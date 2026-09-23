<?php

namespace App\Models;

use App\Enums\ReportStatus;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $emergency_report_id
 * @property int|null $user_id
 * @property ReportStatus|null $from_status
 * @property ReportStatus $to_status
 * @property string|null $note
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable(['user_id', 'from_status', 'to_status', 'note'])]
class EmergencyStatusUpdate extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'from_status' => ReportStatus::class,
            'to_status' => ReportStatus::class,
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
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
