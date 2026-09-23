import { Navigate, Outlet, useLocation } from 'react-router';
import { LoadingState } from '@/components/loading-state';
import { homePathFor, useAuth } from '@/context/auth-context';
import type { UserRole } from '@/types';

function BootScreen() {
    return (
        <LoadingState label="Connecting to CrisisLink…" className="min-h-dvh" />
    );
}

/** Only signed-in users with one of `roles`; others are sent to their own home. */
export function RequireAuth({ roles }: { roles: UserRole[] }) {
    const { user, isBooting } = useAuth();
    const location = useLocation();

    if (isBooting) {
        return <BootScreen />;
    }

    if (user === null) {
        return (
            <Navigate to="/login" replace state={{ from: location.pathname }} />
        );
    }

    if (!roles.includes(user.role)) {
        return <Navigate to={homePathFor(user.role)} replace />;
    }

    return <Outlet />;
}

/** Login and registration are only for signed-out visitors. */
export function GuestOnly() {
    const { user, isBooting } = useAuth();

    if (isBooting) {
        return <BootScreen />;
    }

    return user ? <Navigate to={homePathFor(user.role)} replace /> : <Outlet />;
}

export function RootRedirect() {
    const { user, isBooting } = useAuth();

    if (isBooting) {
        return <BootScreen />;
    }

    return <Navigate to={user ? homePathFor(user.role) : '/login'} replace />;
}
