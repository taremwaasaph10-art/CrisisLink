<?php

namespace App\Enums;

enum AlertSeverity: string
{
    case Info = 'info';
    case Warning = 'warning';
    case Danger = 'danger';
}
