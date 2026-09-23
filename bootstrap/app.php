<?php

use App\Http\Middleware\EnsureUserHasRole;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            [$status, $message, $errors] = match (true) {
                $e instanceof ValidationException => [$e->status, $e->getMessage(), $e->errors()],
                $e instanceof AuthenticationException => [401, 'Your session has expired. Please log in again.', []],
                $e instanceof HttpExceptionInterface => [$e->getStatusCode(), match ($e->getStatusCode()) {
                    403 => 'You do not have permission to perform this action.',
                    404 => 'The requested resource was not found.',
                    429 => 'Too many attempts. Please wait a moment and try again.',
                    default => $e->getMessage() ?: 'The request could not be completed.',
                }, []],
                default => [500, config('app.debug') ? $e->getMessage() : 'Something went wrong. Please try again.', []],
            };

            return response()->json([
                'success' => false,
                'message' => $message,
                'errors' => (object) $errors,
            ], $status);
        });
    })->create();
