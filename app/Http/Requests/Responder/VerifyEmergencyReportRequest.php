<?php

namespace App\Http\Requests\Responder;

use App\Enums\ReportPriority;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerifyEmergencyReportRequest extends FormRequest
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
            'priority' => ['nullable', Rule::enum(ReportPriority::class)],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
