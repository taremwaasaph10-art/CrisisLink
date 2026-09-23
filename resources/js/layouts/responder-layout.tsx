import {
    Bell,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Map as MapIcon,
    Menu,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Suspense, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { LoadingState } from '@/components/loading-state';
import { Logo } from '@/components/logo';
import { UnreadBadge } from '@/components/unread-badge';
import { useAuth } from '@/context/auth-context';
import { useUnreadCount } from '@/hooks/use-unread-count';
import { cn } from '@/utils/cn';

type NavItem = { to: string; label: string; icon: LucideIcon; badge?: number };

/** Desktop-first shell for responders: sidebar on large screens, drawer on small ones. */
export function ResponderLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const unread = useUnreadCount();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const items: NavItem[] = [
        {
            to: '/responder/dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
        },
        {
            to: '/responder/requests',
            label: 'Emergency Requests',
            icon: ClipboardList,
        },
        { to: '/responder/map', label: 'Crisis Map', icon: MapIcon },
        {
            to: '/responder/notifications',
            label: 'Notifications',
            icon: Bell,
            badge: unread,
        },
        ...(user?.role === 'admin'
            ? [
                  {
                      to: '/admin/responders',
                      label: 'Responder Team',
                      icon: Users,
                  },
              ]
            : []),
        { to: '/responder/profile', label: 'Profile', icon: UserRound },
    ];

    const signOut = async () => {
        await logout();
        void navigate('/login', { replace: true });
    };

    const sidebar = (
        <div className="flex h-full flex-col bg-slate-950 text-slate-300">
            <div className="flex items-center justify-between px-5 py-5">
                <Logo inverted />
                <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
                    aria-label="Close menu"
                >
                    <X className="size-5" />
                </button>
            </div>
            <p className="px-5 pb-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                Response centre
            </p>
            <nav aria-label="Responder" className="flex-1 space-y-1 px-3">
                {items.map(({ to, label, icon: Icon, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-white text-slate-950'
                                    : 'hover:bg-slate-800 hover:text-white',
                            )
                        }
                    >
                        <Icon className="size-5" aria-hidden />
                        <span className="flex-1">{label}</span>
                        {badge ? <UnreadBadge count={badge} /> : null}
                    </NavLink>
                ))}
            </nav>
            <div className="border-t border-slate-800 p-4">
                <p className="truncate text-sm font-semibold text-white">
                    {user?.name}
                </p>
                <p className="truncate text-xs text-slate-400 capitalize">
                    {user?.role}
                </p>
                <button
                    type="button"
                    onClick={signOut}
                    className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                    <LogOut className="size-4" aria-hidden />
                    Sign out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-dvh bg-slate-100">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
                {sidebar}
            </aside>

            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu"
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-950/60"
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Close menu"
                    />
                    <div className="absolute inset-y-0 left-0 w-72 max-w-[85%]">
                        {sidebar}
                    </div>
                </div>
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 flex items-center gap-3 bg-slate-950 px-4 py-3 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(true)}
                        className="rounded-lg p-2 text-white hover:bg-slate-800"
                        aria-label="Open menu"
                    >
                        <Menu className="size-6" />
                    </button>
                    <Logo inverted />
                    {unread > 0 && (
                        <NavLink
                            to="/responder/notifications"
                            className="ml-auto"
                            aria-label={`${unread} unread notifications`}
                        >
                            <UnreadBadge count={unread} />
                        </NavLink>
                    )}
                </header>
                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <Suspense fallback={<LoadingState />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
