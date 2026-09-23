import { useId } from 'react';
import type {
    InputHTMLAttributes,
    ReactElement,
    ReactNode,
    TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/utils/cn';

export const controlClasses =
    'block w-full rounded-xl border-0 bg-white px-3.5 py-3 text-base text-slate-900 ring-1 ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 aria-invalid:ring-2 aria-invalid:ring-sos-500 sm:text-sm';

type FieldProps = {
    label: ReactNode;
    error?: string;
    hint?: ReactNode;
    className?: string;
    children: (props: {
        id: string;
        'aria-invalid'?: boolean;
        'aria-describedby'?: string;
    }) => ReactElement;
};

/** Label, hint and error text wired to a single form control. */
export function Field({ label, error, hint, className, children }: FieldProps) {
    const id = useId();
    const messageId = `${id}-message`;

    return (
        <div className={cn('space-y-1.5', className)}>
            <label
                htmlFor={id}
                className="block text-sm font-semibold text-slate-800"
            >
                {label}
            </label>
            {children({
                id,
                'aria-invalid': error ? true : undefined,
                'aria-describedby': error || hint ? messageId : undefined,
            })}
            {error ? (
                <p id={messageId} className="text-sm font-medium text-sos-700">
                    {error}
                </p>
            ) : (
                hint && (
                    <p id={messageId} className="text-sm text-slate-500">
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}

export function Input({
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return <input className={cn(controlClasses, className)} {...props} />;
}

export function Textarea({
    className,
    ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className={cn(controlClasses, 'min-h-28 resize-y', className)}
            {...props}
        />
    );
}
