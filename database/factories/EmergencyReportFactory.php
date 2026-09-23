<?php

namespace Database\Factories;

use App\Enums\ReportPriority;
use App\Enums\ReportStatus;
use App\Models\EmergencyReport;
use App\Models\EmergencyType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmergencyReport>
 */
class EmergencyReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'emergency_type_id' => EmergencyType::factory(),
            'description' => fake()->sentence(12),
            'people_affected' => fake()->numberBetween(1, 8),
            'latitude' => fake()->latitude(36.33, 36.39),
            'longitude' => fake()->longitude(6.58, 6.65),
            'location_description' => fake()->streetAddress(),
            'priority' => ReportPriority::Medium,
            'status' => ReportStatus::Submitted,
            'reported_at' => now(),
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (EmergencyReport $report) {
            if ($report->reference_number === null) {
                $report->forceFill(['reference_number' => EmergencyReport::referenceFor($report->id)])->save();
            }
        });
    }

    public function status(ReportStatus $status): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => $status,
        ]);
    }

    public function priority(ReportPriority $priority): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => $priority,
        ]);
    }

    public function withoutCoordinates(): static
    {
        return $this->state(fn (array $attributes) => [
            'latitude' => null,
            'longitude' => null,
        ]);
    }
}
