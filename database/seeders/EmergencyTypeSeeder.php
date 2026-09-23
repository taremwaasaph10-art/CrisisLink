<?php

namespace Database\Seeders;

use App\Models\EmergencyType;
use Illuminate\Database\Seeder;

class EmergencyTypeSeeder extends Seeder
{
    /**
     * The emergency categories a citizen can choose from, in display order.
     *
     * @var list<array{name: string, slug: string, icon: string, description: string}>
     */
    public const array TYPES = [
        ['name' => 'Flood', 'slug' => 'flood', 'icon' => 'waves', 'description' => 'Rising water, flooded homes or people trapped by water.'],
        ['name' => 'Fire', 'slug' => 'fire', 'icon' => 'flame', 'description' => 'A building, vehicle or wildfire.'],
        ['name' => 'Medical', 'slug' => 'medical', 'icon' => 'heart-pulse', 'description' => 'Injury, illness or someone who needs urgent care.'],
        ['name' => 'Evacuation', 'slug' => 'evacuation', 'icon' => 'door-open', 'description' => 'Help leaving a dangerous area.'],
        ['name' => 'Food/Water', 'slug' => 'food-water', 'icon' => 'utensils', 'description' => 'No access to food or safe drinking water.'],
        ['name' => 'Shelter', 'slug' => 'shelter', 'icon' => 'tent', 'description' => 'Home destroyed or unsafe and a place to stay is needed.'],
        ['name' => 'Other', 'slug' => 'other', 'icon' => 'triangle-alert', 'description' => 'Any other emergency.'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::TYPES as $type) {
            EmergencyType::query()->updateOrCreate(['slug' => $type['slug']], $type);
        }
    }
}
