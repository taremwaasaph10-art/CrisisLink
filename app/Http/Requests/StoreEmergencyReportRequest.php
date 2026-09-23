<?php

namespace App\Http\Requests;

use App\Models\EmergencyReport;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmergencyReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', EmergencyReport::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Either GPS coordinates or a written location is required, so a citizen
     * whose device cannot share its position can still ask for help.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'emergency_type_id' => ['required', 'integer', Rule::exists('emergency_types', 'id')],
            'description' => ['required', 'string', 'min:3', 'max:2000'],
            'people_affected' => ['required', 'integer', 'min:1', 'max:10000'],
            'latitude' => ['nullable', 'required_with:longitude', 'required_without:location_description', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'required_with:latitude', 'numeric', 'between:-180,180'],
            'location_description' => ['nullable', 'required_without:latitude', 'string', 'max:255'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    /**
     * The validated report fields, typed for the workflow.
     *
     * @return array{emergency_type_id: int, description: string, people_affected: int, latitude: float|null, longitude: float|null, location_description: string|null}
     */
    public function reportAttributes(): array
    {
        $hasCoordinates = $this->filled(['latitude', 'longitude']);

        return [
            'emergency_type_id' => $this->integer('emergency_type_id'),
            'description' => $this->string('description')->trim()->toString(),
            'people_affected' => $this->integer('people_affected'),
            'latitude' => $hasCoordinates ? $this->float('latitude') : null,
            'longitude' => $hasCoordinates ? $this->float('longitude') : null,
            'location_description' => $this->filled('location_description')
                ? $this->string('location_description')->trim()->toString()
                : null,
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'emergency_type_id.required' => 'Please choose the type of emergency.',
            'emergency_type_id.exists' => 'Please choose a valid type of emergency.',
            'description.required' => 'Please describe what is happening.',
            'people_affected.min' => 'At least one person must be affected.',
            'latitude.required_without' => 'Please share your location or describe where you are.',
            'location_description.required_without' => 'Please share your location or describe where you are.',
            'photo.max' => 'The photo must be smaller than 5 MB.',
            'photo.image' => 'The photo must be a JPG, PNG or WebP image.',
            'photo.mimes' => 'The photo must be a JPG, PNG or WebP image.',
        ];
    }
}
