<?php

use App\Enums\ReportStatus;
use App\Models\EmergencyReport;
use App\Models\EmergencyType;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

describe('store', function () {
    it('creates a request with a reference number and notifies the citizen and responders', function () {
        $citizen = User::factory()->citizen()->create();
        $responder = User::factory()->responder()->create();
        $flood = EmergencyType::factory()->create(['name' => 'Flood']);
        Sanctum::actingAs($citizen);

        $response = $this->postJson('/api/emergency-reports', [
            'emergency_type_id' => $flood->id,
            'description' => 'There are four people trapped inside the house.',
            'people_affected' => 4,
            'latitude' => 36.365,
            'longitude' => 6.6147,
            'location_description' => 'Rue Larbi Ben M\'hidi, Constantine',
        ]);

        $report = EmergencyReport::query()->sole();

        $response->assertCreated()
            ->assertJsonPath('message', 'Emergency request created successfully.')
            ->assertJsonPath('data.reference_number', sprintf('CRS-%06d', $report->id))
            ->assertJsonPath('data.status', 'submitted')
            ->assertJsonPath('data.type.name', 'Flood')
            ->assertJsonPath('data.timeline.0.status', 'submitted');

        expect($report->user_id)->toBe($citizen->id)
            ->and($report->people_affected)->toBe(4)
            ->and($report->status)->toBe(ReportStatus::Submitted);

        expect($citizen->notifications()->sole()->message)
            ->toBe("Your request {$report->reference_number} has been received. A responder will review it shortly.");
        expect($responder->notifications()->sole()->title)->toBe('New emergency request');
    });

    it('stores the photo on the private disk and returns a link to it', function () {
        Storage::fake('local');
        Sanctum::actingAs(User::factory()->citizen()->create());

        $response = $this->post('/api/emergency-reports', [
            'emergency_type_id' => EmergencyType::factory()->create()->id,
            'description' => 'Water is rising.',
            'people_affected' => 2,
            'location_description' => 'Near the old bridge',
            'photo' => UploadedFile::fake()->image('flood.jpg'),
        ], ['Accept' => 'application/json']);

        $response->assertCreated();

        $path = EmergencyReport::query()->sole()->photo_path;
        Storage::disk('local')->assertExists($path);
        expect($response->json('data.photo_url'))->toContain($path);
    });

    it('accepts a written location when GPS is unavailable', function () {
        Sanctum::actingAs(User::factory()->citizen()->create());

        $this->postJson('/api/emergency-reports', [
            'emergency_type_id' => EmergencyType::factory()->create()->id,
            'description' => 'Road is blocked by water.',
            'people_affected' => 1,
            'location_description' => 'Behind the central market',
        ])->assertCreated()
            ->assertJsonPath('data.location.latitude', null);
    });

    it('rejects a request with neither coordinates nor a written location', function () {
        Sanctum::actingAs(User::factory()->citizen()->create());

        $this->postJson('/api/emergency-reports', [
            'emergency_type_id' => EmergencyType::factory()->create()->id,
            'description' => 'Help needed.',
            'people_affected' => 1,
        ])->assertUnprocessable()
            ->assertJsonPath('errors.latitude.0', 'Please share your location or describe where you are.');

        expect(EmergencyReport::query()->count())->toBe(0);
    });

    it('rejects an empty request with a message for each required field', function () {
        Sanctum::actingAs(User::factory()->citizen()->create());

        $this->postJson('/api/emergency-reports', [])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors([
                'emergency_type_id' => 'Please choose the type of emergency.',
                'description' => 'Please describe what is happening.',
                'people_affected',
            ]);
    });

    it('rejects a non-image upload', function () {
        Sanctum::actingAs(User::factory()->citizen()->create());

        $this->postJson('/api/emergency-reports', [
            'emergency_type_id' => EmergencyType::factory()->create()->id,
            'description' => 'Water is rising.',
            'people_affected' => 1,
            'location_description' => 'Near the bridge',
            'photo' => UploadedFile::fake()->create('script.php', 10, 'application/x-php'),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['photo' => 'The photo must be a JPG, PNG or WebP image.']);
    });

    it('forbids responders from raising requests with 403', function () {
        Sanctum::actingAs(User::factory()->responder()->create());

        $this->postJson('/api/emergency-reports', [
            'emergency_type_id' => EmergencyType::factory()->create()->id,
            'description' => 'Test',
            'people_affected' => 1,
            'location_description' => 'Somewhere',
        ])->assertForbidden()
            ->assertJsonPath('message', 'You do not have permission to perform this action.');
    });
});

describe('index', function () {
    it('lists only the citizen\'s own requests', function () {
        $citizen = User::factory()->citizen()->create();
        $own = EmergencyReport::factory()->for($citizen, 'reporter')->create();
        EmergencyReport::factory()->create();
        Sanctum::actingAs($citizen);

        $this->getJson('/api/emergency-reports')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $own->id);
    });

    it('returns 401 without a token', function () {
        $this->getJson('/api/emergency-reports')->assertUnauthorized();
    });
});

describe('show', function () {
    it('shows the citizen their request without the reporter\'s contact details', function () {
        $citizen = User::factory()->citizen()->create();
        $report = EmergencyReport::factory()->for($citizen, 'reporter')->create();
        Sanctum::actingAs($citizen);

        $this->getJson("/api/emergency-reports/{$report->id}")
            ->assertOk()
            ->assertJsonPath('data.reference_number', $report->reference_number)
            ->assertJsonMissingPath('data.reporter');
    });

    it('returns 404 for another citizen\'s request', function () {
        $report = EmergencyReport::factory()->create();
        Sanctum::actingAs(User::factory()->citizen()->create());

        $this->getJson("/api/emergency-reports/{$report->id}")->assertNotFound();
    });
});
