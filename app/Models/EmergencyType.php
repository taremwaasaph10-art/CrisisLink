<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\EmergencyTypeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string $icon
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable(['name', 'slug', 'description', 'icon'])]
class EmergencyType extends Model
{
    /** @use HasFactory<EmergencyTypeFactory> */
    use HasFactory;

    /**
     * @return HasMany<EmergencyReport, $this>
     */
    public function emergencyReports(): HasMany
    {
        return $this->hasMany(EmergencyReport::class);
    }
}
