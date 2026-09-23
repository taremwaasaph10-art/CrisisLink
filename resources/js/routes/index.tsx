import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { CitizenLayout } from '@/layouts/citizen-layout';
import { ResponderLayout } from '@/layouts/responder-layout';
import { LoginPage } from '@/pages/auth/login';
import { RegisterPage } from '@/pages/auth/register';
import { CitizenHomePage } from '@/pages/citizen/home';
import { MyRequestsPage } from '@/pages/citizen/my-requests';
import { RequestStatusPage } from '@/pages/citizen/request-status';
import { SosPage } from '@/pages/citizen/sos';
import { NotFoundPage } from '@/pages/not-found';
import { NotificationsPage } from '@/pages/shared/notifications';
import { ProfilePage } from '@/pages/shared/profile';
import { GuestOnly, RequireAuth, RootRedirect } from '@/routes/guards';

/*
 * Responder and admin screens are split into their own chunks so citizens on
 * slow mobile connections only download what the SOS journey needs.
 */
const DashboardPage = lazy(() =>
    import('@/pages/responder/dashboard').then((module) => ({
        default: module.DashboardPage,
    })),
);
const RequestsPage = lazy(() =>
    import('@/pages/responder/requests').then((module) => ({
        default: module.RequestsPage,
    })),
);
const RequestDetailPage = lazy(() =>
    import('@/pages/responder/request-detail').then((module) => ({
        default: module.RequestDetailPage,
    })),
);
const CrisisMapPage = lazy(() =>
    import('@/pages/responder/crisis-map').then((module) => ({
        default: module.CrisisMapPage,
    })),
);
const RespondersPage = lazy(() =>
    import('@/pages/admin/responders').then((module) => ({
        default: module.RespondersPage,
    })),
);

export function AppRoutes() {
    return (
        <Routes>
            <Route index element={<RootRedirect />} />

            <Route element={<GuestOnly />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireAuth roles={['citizen']} />}>
                <Route path="emergency/new" element={<SosPage />} />
                <Route element={<CitizenLayout />}>
                    <Route path="home" element={<CitizenHomePage />} />
                    <Route path="my-requests" element={<MyRequestsPage />} />
                    <Route
                        path="emergency/:id"
                        element={<RequestStatusPage />}
                    />
                    <Route
                        path="notifications"
                        element={<NotificationsPage />}
                    />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>
            </Route>

            <Route element={<RequireAuth roles={['responder', 'admin']} />}>
                <Route element={<ResponderLayout />}>
                    <Route
                        path="responder/dashboard"
                        element={<DashboardPage />}
                    />
                    <Route
                        path="responder/requests"
                        element={<RequestsPage />}
                    />
                    <Route
                        path="responder/requests/:id"
                        element={<RequestDetailPage />}
                    />
                    <Route path="responder/map" element={<CrisisMapPage />} />
                    <Route
                        path="responder/notifications"
                        element={<NotificationsPage />}
                    />
                    <Route path="responder/profile" element={<ProfilePage />} />

                    <Route element={<RequireAuth roles={['admin']} />}>
                        <Route
                            path="admin/responders"
                            element={<RespondersPage />}
                        />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
