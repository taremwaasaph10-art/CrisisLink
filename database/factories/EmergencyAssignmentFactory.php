<?php

namespace Database\Factories;

use App\Models\EmergencyAssignment;
use App\Models\EmergencyReport;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmergencyAssignment>
 */
class EmergencyAssignmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'emergency_report_id' => EmergencyReport::factory(),
            'responder_id' => User::factory()->responder(),
            'assigned_at' => now(),
            'notes' => null,
        ];
    }
}
