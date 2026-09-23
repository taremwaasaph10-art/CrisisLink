<?php

namespace App\Http\Requests\Responder;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignEmergencyReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('manage', $this->route('emergencyReport')) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'responder_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('role', UserRole::Responder->value),
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'responder_id.required' => 'Please choose a responder to assign.',
            'responder_id.exists' => 'Please choose a valid responder.',
        ];
    }
}
