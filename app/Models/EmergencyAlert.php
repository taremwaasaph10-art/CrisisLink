<?php

namespace App\Models;

use App\Enums\AlertSeverity;
use Carbon\CarbonImmutable;
use Database\Factories\EmergencyAlertFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A public warning broadcast to citizens, such as a flood alert for an area.
 *
 * @property int $id
 * @property string $title
 * @property string $message
 * @property AlertSeverity $severity
 * @property string|null $area
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable(['title', 'message', 'severity', 'area', 'is_active'])]
class EmergencyAlert extends Model
{
    /** @use HasFactory<EmergencyAlertFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'severity' => AlertSeverity::class,
            'is_active' => 'boolean',
        ];
    }

    /**
     * @param  Builder<EmergencyAlert>  $query
     */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('is_active', true);
    }
}
