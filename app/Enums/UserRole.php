<?php

namespace App\Enums;

enum UserRole: string
{
    case Citizen = 'citizen';
    case Responder = 'responder';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Citizen => 'Citizen',
            self::Responder => 'Responder',
            self::Admin => 'Administrator',
        };
    }

    /**
     * Whether this role can triage and manage emergency requests.
     */
    public function canRespond(): bool
    {
        return $this === self::Responder || $this === self::Admin;
    }
}
