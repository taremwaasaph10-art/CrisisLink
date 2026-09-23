import { ButtonLink } from '@/components/button';
import { Logo } from '@/components/logo';

export function NotFoundPage() {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
            <Logo />
            <h1 className="text-2xl font-bold text-slate-900">
                Page not found
            </h1>
            <p className="text-slate-600">
                The page you are looking for does not exist.
            </p>
            <ButtonLink to="/">Go to CrisisLink</ButtonLink>
        </div>
    );
}
