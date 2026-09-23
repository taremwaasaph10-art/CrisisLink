<?php

namespace Database\Factories;

use App\Enums\AlertSeverity;
use App\Models\EmergencyAlert;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmergencyAlert>
 */
class EmergencyAlertFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'message' => fake()->sentence(15),
            'severity' => AlertSeverity::Warning,
            'area' => fake()->city(),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
