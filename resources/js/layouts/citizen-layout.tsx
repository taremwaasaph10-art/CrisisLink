import { Bell, ClipboardList, House, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router';
import { Logo } from '@/components/logo';
import { UnreadBadge } from '@/components/unread-badge';
import { useUnreadCount } from '@/hooks/use-unread-count';
import { cn } from '@/utils/cn';

type NavItem = { to: string; label: string; icon: LucideIcon; badge?: number };

/** Mobile-first shell for citizens: slim header, content, bottom tab bar. */
export function CitizenLayout() {
    const unread = useUnreadCount();

    const items: NavItem[] = [
        { to: '/home', label: 'Home', icon: House },
        { to: '/my-requests', label: 'My Requests', icon: ClipboardList },
        {
            to: '/notifications',
            label: 'Notifications',
            icon: Bell,
            badge: unread,
        },
        { to: '/profile', label: 'Profile', icon: UserRound },
    ];

    return (
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-slate-50 sm:border-x sm:border-slate-200">
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
                <Link to="/home" aria-label="CrisisLink home">
                    <Logo />
                </Link>
                <Link
                    to="/notifications"
                    className="relative rounded-full p-2 text-slate-700 hover:bg-slate-100"
                    aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
                >
                    <Bell className="size-6" />
                    <UnreadBadge
                        count={unread}
                        className="absolute -top-0.5 -right-0.5"
                    />
                </Link>
            </header>

            <main className="flex-1 px-4 pt-5 pb-28">
                <Outlet />
            </main>

            <nav
                aria-label="Main"
                className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]"
            >
                <div className="mx-auto grid max-w-lg grid-cols-4">
                    {items.map(({ to, label, icon: Icon, badge }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                cn(
                                    'relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold',
                                    isActive
                                        ? 'text-sos-700'
                                        : 'text-slate-500 hover:text-slate-900',
                                )
                            }
                        >
                            <Icon className="size-6" aria-hidden />
                            {label}
                            {badge ? (
                                <UnreadBadge
                                    count={badge}
                                    className="absolute top-1 left-[calc(50%+6px)]"
                                />
                            ) : null}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
}
