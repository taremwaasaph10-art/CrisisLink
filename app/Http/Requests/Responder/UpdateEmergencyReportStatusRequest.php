<?php

namespace App\Http\Requests\Responder;

use App\Enums\ReportStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmergencyReportStatusRequest extends FormRequest
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
     * Verification and assignment carry extra data, so they have their own
     * endpoints; this one handles the remaining workflow steps.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => [
                'required',
                Rule::enum(ReportStatus::class)->only([
                    ReportStatus::UnderReview,
                    ReportStatus::InProgress,
                    ReportStatus::Resolved,
                ]),
            ],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
