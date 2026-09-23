<?php

namespace App\Models;

use App\Enums\ReportPriority;
use App\Enums\ReportStatus;
use Carbon\CarbonImmutable;
use Database\Factories\EmergencyReportFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property string|null $reference_number
 * @property int $user_id
 * @property int $emergency_type_id
 * @property string $description
 * @property int $people_affected
 * @property float|null $latitude
 * @property float|null $longitude
 * @property string|null $location_description
 * @property string|null $photo_path
 * @property ReportPriority $priority
 * @property ReportStatus $status
 * @property CarbonImmutable $reported_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable([
    'emergency_type_id',
    'description',
    'people_affected',
    'latitude',
    'longitude',
    'location_description',
    'photo_path',
])]
class EmergencyReport extends Model
{
    /** @use HasFactory<EmergencyReportFactory> */
    use HasFactory;

    /**
     * Relations shown when a single request is opened.
     *
     * @var list<string>
     */
    public const array DETAIL_RELATIONS = [
        'emergencyType',
        'reporter',
        'statusUpdates.user',
        'currentAssignment.responder',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'submitted',
        'priority' => 'medium',
        'people_affected' => 1,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ReportStatus::class,
            'priority' => ReportPriority::class,
            'people_affected' => 'integer',
            'latitude' => 'float',
            'longitude' => 'float',
            'reported_at' => 'datetime',
        ];
    }

    public static function referenceFor(int $id): string
    {
        return sprintf('CRS-%06d', $id);
    }

    public function hasCoordinates(): bool
    {
        return $this->latitude !== null && $this->longitude !== null;
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<EmergencyType, $this>
     */
    public function emergencyType(): BelongsTo
    {
        return $this->belongsTo(EmergencyType::class);
    }

    /**
     * @return HasMany<EmergencyAssignment, $this>
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(EmergencyAssignment::class);
    }

    /**
     * @return HasOne<EmergencyAssignment, $this>
     */
    public function currentAssignment(): HasOne
    {
        return $this->hasOne(EmergencyAssignment::class)->latestOfMany('assigned_at');
    }

    /**
     * @return HasMany<EmergencyStatusUpdate, $this>
     */
    public function statusUpdates(): HasMany
    {
        return $this->hasMany(EmergencyStatusUpdate::class)->oldest()->oldest('id');
    }

    /**
     * @param  Builder<EmergencyReport>  $query
     */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->whereIn('status', ReportStatus::active());
    }

    /**
     * Open requests before resolved ones, most urgent first, then the
     * longest-waiting request first.
     *
     * @param  Builder<EmergencyReport>  $query
     */
    #[Scope]
    protected function orderByUrgency(Builder $query): void
    {
        $mostUrgentFirst = collect(ReportPriority::cases())
            ->sortBy(fn (ReportPriority $priority) => $priority->rank())
            ->map(fn (ReportPriority $priority) => $priority->value)
            ->values()
            ->all();

        $query->orderByRaw('CASE WHEN status = ? THEN 1 ELSE 0 END', [ReportStatus::Resolved->value])
            ->orderByRaw('CASE priority WHEN ? THEN 0 WHEN ? THEN 1 WHEN ? THEN 2 WHEN ? THEN 3 ELSE 4 END', $mostUrgentFirst)
            ->orderBy('reported_at')
            ->orderBy('id');
    }
}
