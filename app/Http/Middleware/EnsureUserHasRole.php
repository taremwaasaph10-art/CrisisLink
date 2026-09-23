<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Only let users holding one of the given roles through, e.g. `role:responder,admin`.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $allowedRoles = array_map(fn (string $role) => UserRole::from($role), $roles);

        abort_unless($request->user()?->hasRole(...$allowedRoles), Response::HTTP_FORBIDDEN);

        return $next($request);
    }
}
