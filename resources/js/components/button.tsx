import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router';
import type { LinkProps } from 'react-router';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'danger' | 'secondary' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const VARIANTS: Record<Variant, string> = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400',
    danger: 'bg-sos-600 text-white hover:bg-sos-700 disabled:bg-sos-500/60',
    success:
        'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400',
    secondary:
        'bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 disabled:text-slate-400',
    ghost: 'text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
};

const SIZES: Record<Size, string> = {
    sm: 'h-9 gap-1.5 rounded-lg px-3 text-sm',
    md: 'h-11 gap-2 rounded-xl px-4 text-sm',
    lg: 'h-13 gap-2 rounded-xl px-5 text-base',
    xl: 'h-16 gap-3 rounded-2xl px-6 text-lg',
};

export function buttonClasses({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
}: {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
    className?: string;
} = {}): string {
    return cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
    );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
    isLoading?: boolean;
};

export function Button({
    variant,
    size,
    fullWidth,
    isLoading = false,
    className,
    children,
    disabled,
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            aria-busy={isLoading || undefined}
            className={buttonClasses({ variant, size, fullWidth, className })}
            {...props}
        >
            {isLoading && (
                <LoaderCircle className="size-5 animate-spin" aria-hidden />
            )}
            {children}
        </button>
    );
}

type ButtonLinkProps = LinkProps & {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
};

export function ButtonLink({
    variant,
    size,
    fullWidth,
    className,
    ...props
}: ButtonLinkProps) {
    return (
        <Link
            className={buttonClasses({
                variant,
                size,
                fullWidth,
                className: className as string | undefined,
            })}
            {...props}
        />
    );
}
