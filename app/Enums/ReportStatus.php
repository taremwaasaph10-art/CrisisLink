<?php

namespace App\Enums;

enum ReportStatus: string
{
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case Verified = 'verified';
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';

    public function label(): string
    {
        return match ($this) {
            self::Submitted => 'Submitted',
            self::UnderReview => 'Under Review',
            self::Verified => 'Verified',
            self::Assigned => 'Assigned',
            self::InProgress => 'In Progress',
            self::Resolved => 'Resolved',
        };
    }

    /**
     * The only status a request may move to from this one.
     *
     * The workflow is strictly linear so a request cannot skip verification
     * or assignment on its way to being resolved.
     */
    public function next(): ?self
    {
        return match ($this) {
            self::Submitted => self::UnderReview,
            self::UnderReview => self::Verified,
            self::Verified => self::Assigned,
            self::Assigned => self::InProgress,
            self::InProgress => self::Resolved,
            self::Resolved => null,
        };
    }

    public function canTransitionTo(self $status): bool
    {
        return $this->next() === $status;
    }

    public function isActive(): bool
    {
        return $this !== self::Resolved;
    }

    /**
     * Statuses that still need a responder's attention.
     *
     * @return list<self>
     */
    public static function active(): array
    {
        return array_values(array_filter(self::cases(), fn (self $status) => $status->isActive()));
    }

    /**
     * @return list<self>
     */
    public static function pendingVerification(): array
    {
        return [self::Submitted, self::UnderReview];
    }

    /**
     * @return list<self>
     */
    public static function withResponder(): array
    {
        return [self::Assigned, self::InProgress];
    }
}
