<?php

use App\Http\Controllers\Api\Admin\ResponderController as AdminResponderController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmergencyAlertController;
use App\Http\Controllers\Api\EmergencyReportController;
use App\Http\Controllers\Api\EmergencyTypeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Responder\DashboardController;
use App\Http\Controllers\Api\Responder\EmergencyReportController as ResponderEmergencyReportController;
use App\Http\Controllers\Api\Responder\EmergencyReportWorkflowController;
use App\Http\Controllers\Api\Responder\ResponderController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('login');
    Route::post('register', [AuthController::class, 'register'])->name('register');
});

Route::get('emergency-types', [EmergencyTypeController::class, 'index'])->name('emergency-types.index');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('user', [AuthController::class, 'user'])->name('user');

    Route::get('alerts', [EmergencyAlertController::class, 'index'])->name('alerts.index');

    Route::get('emergency-reports', [EmergencyReportController::class, 'index'])->name('emergency-reports.index');
    Route::post('emergency-reports', [EmergencyReportController::class, 'store'])
        ->middleware('throttle:sos')
        ->name('emergency-reports.store');
    Route::get('emergency-reports/{emergencyReport}', [EmergencyReportController::class, 'show'])->name('emergency-reports.show');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    Route::middleware('role:responder,admin')->prefix('responder')->name('responder.')->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('responders', [ResponderController::class, 'index'])->name('responders.index');

        Route::get('emergency-reports', [ResponderEmergencyReportController::class, 'index'])->name('emergency-reports.index');
        Route::get('emergency-reports/{emergencyReport}', [ResponderEmergencyReportController::class, 'show'])->name('emergency-reports.show');

        Route::controller(EmergencyReportWorkflowController::class)
            ->prefix('emergency-reports/{emergencyReport}')
            ->name('emergency-reports.')
            ->group(function () {
                Route::patch('verify', 'verify')->name('verify');
                Route::patch('assign', 'assign')->name('assign');
                Route::patch('status', 'updateStatus')->name('status');
                Route::patch('priority', 'updatePriority')->name('priority');
            });
    });

    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::post('responders', [AdminResponderController::class, 'store'])->name('responders.store');
    });
});
