import { LogOut, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { useAuth } from '@/context/auth-context';

const ROLE_LABELS = {
    citizen: 'Citizen',
    responder: 'Responder',
    admin: 'Administrator',
} as const;

export function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSigningOut, setIsSigningOut] = useState(false);

    if (!user) {
        return null;
    }

    const signOut = async () => {
        setIsSigningOut(true);
        await logout();
        void navigate('/login', { replace: true });
    };

    const initials = user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="mx-auto max-w-xl space-y-5">
            <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
            <Card className="p-5">
                <div className="flex items-center gap-4">
                    <span className="grid size-16 place-items-center rounded-full bg-slate-900 text-xl font-bold text-white">
                        {initials}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-slate-900">
                            {user.name}
                        </p>
                        <p className="inline-flex items-center gap-1 text-sm font-medium text-slate-500">
                            <ShieldCheck className="size-4" aria-hidden />
                            {ROLE_LABELS[user.role]}
                        </p>
                    </div>
                </div>
                <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                    <div className="flex items-center gap-3">
                        <Mail className="size-4 text-slate-400" aria-hidden />
                        <dt className="sr-only">Email</dt>
                        <dd className="text-slate-900">{user.email}</dd>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="size-4 text-slate-400" aria-hidden />
                        <dt className="sr-only">Phone</dt>
                        <dd className="text-slate-900">
                            {user.phone ?? 'No phone number'}
                        </dd>
                    </div>
                </dl>
            </Card>
            <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={signOut}
                isLoading={isSigningOut}
            >
                {!isSigningOut && <LogOut className="size-5" aria-hidden />}
                Sign out
            </Button>
        </div>
    );
}
