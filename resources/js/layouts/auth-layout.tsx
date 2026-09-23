import type { ReactNode } from 'react';
import { Logo } from '@/components/logo';

export function AuthLayout({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-dvh flex-col bg-slate-50">
            <div className="bg-slate-950 px-6 pt-10 pb-24 text-center">
                <Logo inverted className="justify-center [&_span]:text-2xl" />
                <p className="mx-auto mt-3 max-w-xs text-sm text-slate-300">
                    Connecting People to Help When Every Second Matters.
                </p>
            </div>
            <div className="-mt-16 flex flex-1 justify-center px-4 pb-10">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {title}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {subtitle}
                        </p>
                        <div className="mt-6">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
