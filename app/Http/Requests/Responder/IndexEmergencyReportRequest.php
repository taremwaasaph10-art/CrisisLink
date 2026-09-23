<?php

namespace App\Http\Requests\Responder;

use App\Enums\ReportPriority;
use App\Enums\ReportStatus;
use App\Models\EmergencyReport;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexEmergencyReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('manage', EmergencyReport::class) ?? false;
    }

    /**
     * Status groups matching the dashboard's summary cards.
     *
     * @var array<string, list<ReportStatus>>
     */
    public const array STATUS_GROUPS = [
        'active' => [ReportStatus::Submitted, ReportStatus::UnderReview, ReportStatus::Verified, ReportStatus::Assigned, ReportStatus::InProgress],
        'pending_verification' => [ReportStatus::Submitted, ReportStatus::UnderReview],
        'with_responder' => [ReportStatus::Assigned, ReportStatus::InProgress],
    ];

    /**
     * Get the validation rules that apply to the request.
     *
     * `status` accepts a single status or one of the STATUS_GROUPS.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['nullable', 'string', Rule::in([...array_keys(self::STATUS_GROUPS), ...array_column(ReportStatus::cases(), 'value')])],
            'priority' => ['nullable', Rule::enum(ReportPriority::class)],
            'emergency_type_id' => ['nullable', 'integer'],
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:200'],
        ];
    }
}
