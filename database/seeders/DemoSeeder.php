<?php

namespace Database\Seeders;

use App\Enums\AlertSeverity;
use App\Enums\ReportPriority;
use App\Enums\ReportStatus;
use App\Enums\UserRole;
use App\Models\EmergencyAlert;
use App\Models\EmergencyType;
use App\Models\User;
use App\Services\EmergencyReportWorkflow;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Date;

/**
 * Demo accounts and a believable flood scenario in Constantine.
 *
 * Sample requests are pushed through the real workflow so their timelines,
 * assignments and notifications are consistent with what the app produces.
 */
class DemoSeeder extends Seeder
{
    /**
     * Development-only password shared by every demo account.
     */
    public const string DEMO_PASSWORD = 'CrisisLink@2026';

    /**
     * @var list<array{type: string, status: ReportStatus, priority: ReportPriority, people: int, description: string, place: string, lat: float, lng: float, minutes_ago: int, demo_citizen?: bool}>
     */
    private const array REPORTS = [
        ['type' => 'flood', 'status' => ReportStatus::InProgress, 'priority' => ReportPriority::Critical, 'people' => 5, 'description' => 'Water has entered the ground floor. A family of five is waiting on the roof.', 'place' => 'Boumerzoug riverbank, near the old bridge', 'lat' => 36.3515, 'lng' => 6.6260, 'minutes_ago' => 95],
        ['type' => 'flood', 'status' => ReportStatus::Verified, 'priority' => ReportPriority::Critical, 'people' => 2, 'description' => 'Car stuck in the underpass with two people inside. Water is at the windows.', 'place' => 'RN3 underpass, Zouaghi', 'lat' => 36.3265, 'lng' => 6.5975, 'minutes_ago' => 40],
        ['type' => 'medical', 'status' => ReportStatus::UnderReview, 'priority' => ReportPriority::High, 'people' => 1, 'description' => 'Elderly man with chest pain. The road to the hospital is flooded.', 'place' => 'Sidi Mabrouk', 'lat' => 36.3605, 'lng' => 6.6400, 'minutes_ago' => 25],
        ['type' => 'evacuation', 'status' => ReportStatus::Assigned, 'priority' => ReportPriority::High, 'people' => 12, 'description' => 'Street flooding quickly. Twelve residents including children need to evacuate.', 'place' => 'Cité Boussouf, block 14', 'lat' => 36.3480, 'lng' => 6.5790, 'minutes_ago' => 70],
        ['type' => 'fire', 'status' => ReportStatus::InProgress, 'priority' => ReportPriority::High, 'people' => 4, 'description' => 'Electrical fire in a flooded building. Smoke in the stairwell.', 'place' => 'Rue Larbi Ben M\'hidi', 'lat' => 36.3655, 'lng' => 6.6110, 'minutes_ago' => 55],
        ['type' => 'flood', 'status' => ReportStatus::Submitted, 'priority' => ReportPriority::Medium, 'people' => 3, 'description' => 'Water rising in the basement car park. People are trying to move their cars.', 'place' => 'Daksi Abdeslam', 'lat' => 36.3530, 'lng' => 6.6350, 'minutes_ago' => 12],
        ['type' => 'food-water', 'status' => ReportStatus::Submitted, 'priority' => ReportPriority::Medium, 'people' => 30, 'description' => 'No drinking water for two days. About eight families affected.', 'place' => 'Bab El Kantara', 'lat' => 36.3690, 'lng' => 6.6200, 'minutes_ago' => 18],
        ['type' => 'shelter', 'status' => ReportStatus::Submitted, 'priority' => ReportPriority::Medium, 'people' => 6, 'description' => 'House partially collapsed after the storm. Family needs shelter tonight.', 'place' => 'El Gammas', 'lat' => 36.3350, 'lng' => 6.6320, 'minutes_ago' => 8],
        ['type' => 'other', 'status' => ReportStatus::UnderReview, 'priority' => ReportPriority::Low, 'people' => 1, 'description' => 'Fallen power line lying across the street.', 'place' => 'Avenue Aouati Mostefa', 'lat' => 36.3600, 'lng' => 6.6050, 'minutes_ago' => 33],
        ['type' => 'medical', 'status' => ReportStatus::Resolved, 'priority' => ReportPriority::High, 'people' => 1, 'description' => 'My mother fell and hurt her leg. She cannot walk.', 'place' => 'Faubourg Lamy', 'lat' => 36.3730, 'lng' => 6.6040, 'minutes_ago' => 60 * 24 * 6, 'demo_citizen' => true],
        ['type' => 'flood', 'status' => ReportStatus::Resolved, 'priority' => ReportPriority::Critical, 'people' => 4, 'description' => 'Family trapped on the first floor while the water keeps rising.', 'place' => 'Chaab Erssas', 'lat' => 36.3450, 'lng' => 6.6180, 'minutes_ago' => 60 * 20],
        ['type' => 'food-water', 'status' => ReportStatus::Resolved, 'priority' => ReportPriority::Medium, 'people' => 15, 'description' => 'Shelter is running out of bottled water.', 'place' => 'Zouaghi sports hall', 'lat' => 36.3240, 'lng' => 6.6010, 'minutes_ago' => 60 * 30],
        ['type' => 'evacuation', 'status' => ReportStatus::Resolved, 'priority' => ReportPriority::High, 'people' => 9, 'description' => 'Residents of a riverside building need help to leave.', 'place' => 'Bardo', 'lat' => 36.3595, 'lng' => 6.6150, 'minutes_ago' => 60 * 26],
        ['type' => 'fire', 'status' => ReportStatus::Resolved, 'priority' => ReportPriority::Medium, 'people' => 2, 'description' => 'Small kitchen fire, now smoke only.', 'place' => 'Sidi Mabrouk supérieur', 'lat' => 36.3570, 'lng' => 6.6470, 'minutes_ago' => 60 * 48],
    ];

    public function __construct(private EmergencyReportWorkflow $workflow) {}

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $citizen = $this->account('Lina Rahmani', 'citizen@example.com', UserRole::Citizen, '+213 555 10 20 30');
        $dutyOfficer = $this->account('Karim Benali', 'responder@example.com', UserRole::Responder, '+213 555 40 50 60');
        $this->account('Amina Saadi', 'admin@example.com', UserRole::Admin, '+213 555 70 80 90');

        $fieldTeam = collect([
            ['Yacine Haddad', 'yacine.haddad@example.com', '+213 555 11 22 33'],
            ['Nadia Bouzid', 'nadia.bouzid@example.com', '+213 555 44 55 66'],
            ['Sofiane Mansouri', 'sofiane.mansouri@example.com', '+213 555 77 88 99'],
        ])->map(fn (array $responder) => $this->account($responder[0], $responder[1], UserRole::Responder, $responder[2]));

        $this->seedAlerts();

        $otherCitizens = User::factory()->citizen()->count(6)->create();
        $types = EmergencyType::query()->pluck('id', 'slug');
        $seededAt = now();

        try {
            foreach (self::REPORTS as $index => $sample) {
                $reporter = ($sample['demo_citizen'] ?? false) ? $citizen : $otherCitizens[$index % $otherCitizens->count()];
                $assignee = $fieldTeam[$index % $fieldTeam->count()];

                $this->replay($sample, $seededAt->subMinutes($sample['minutes_ago']), $reporter, $dutyOfficer, $assignee, $types[$sample['type']]);
            }
        } finally {
            Date::setTestNow();
        }
    }

    private function account(string $name, string $email, UserRole $role, string $phone): User
    {
        $user = User::query()->firstOrNew(['email' => $email]);
        $user->forceFill([
            'name' => $name,
            'role' => $role,
            'phone' => $phone,
            'password' => self::DEMO_PASSWORD,
            'email_verified_at' => now(),
        ])->save();

        return $user;
    }

    private function seedAlerts(): void
    {
        EmergencyAlert::query()->create([
            'title' => 'Flash flood warning',
            'message' => 'Heavy rain is making the Rhumel and Boumerzoug rivers rise. Avoid riverbanks and low roads, and move to higher ground if water enters your home.',
            'severity' => AlertSeverity::Danger,
            'area' => 'Constantine',
        ]);

        EmergencyAlert::query()->create([
            'title' => 'Roads closed near Boumerzoug',
            'message' => 'Several roads in the Boumerzoug valley are closed because of flooding. Follow instructions from civil protection teams.',
            'severity' => AlertSeverity::Warning,
            'area' => 'Boumerzoug valley',
        ]);

        EmergencyAlert::query()->create([
            'title' => 'Temporary shelter open',
            'message' => 'A shelter with food, water and blankets is open at the Zouaghi sports hall.',
            'severity' => AlertSeverity::Info,
            'area' => 'Zouaghi',
        ]);
    }

    /**
     * Submit a sample request in the past and walk it forward to its target status.
     *
     * @param  array{type: string, status: ReportStatus, priority: ReportPriority, people: int, description: string, place: string, lat: float, lng: float, minutes_ago: int, demo_citizen?: bool}  $sample
     */
    private function replay(array $sample, CarbonImmutable $reportedAt, User $reporter, User $dutyOfficer, User $assignee, int $typeId): void
    {
        $clock = $reportedAt;
        Date::setTestNow($clock);

        $report = $this->workflow->submit($reporter, [
            'emergency_type_id' => $typeId,
            'description' => $sample['description'],
            'people_affected' => $sample['people'],
            'latitude' => $sample['lat'],
            'longitude' => $sample['lng'],
            'location_description' => $sample['place'].', Constantine',
        ]);

        $step = max(1, intdiv($sample['minutes_ago'], 8));
        $status = ReportStatus::Submitted;

        while ($status !== $sample['status'] && ($next = $status->next()) !== null) {
            $clock = $clock->addMinutes($step);
            Date::setTestNow($clock);

            $report = match ($next) {
                ReportStatus::UnderReview => $this->workflow->startReview($report, $dutyOfficer),
                ReportStatus::Verified => $this->workflow->verify($report, $dutyOfficer, $sample['priority']),
                ReportStatus::Assigned => $this->workflow->assign($report, $assignee, $dutyOfficer, 'Contact the family on arrival.'),
                ReportStatus::InProgress => $this->workflow->markInProgress($report, $assignee),
                ReportStatus::Resolved => $this->workflow->resolve($report, $assignee, 'Everyone is safe.'),
                ReportStatus::Submitted => $report,
            };

            $status = $next;
        }

        if ($report->priority !== $sample['priority']) {
            $this->workflow->changePriority($report, $sample['priority']);
        }
    }
}
