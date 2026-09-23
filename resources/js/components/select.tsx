import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import { controlClasses } from '@/components/input';
import { cn } from '@/utils/cn';

type Option = { value: string | number; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    options: Option[];
    placeholder?: string;
};

export function Select({
    options,
    placeholder,
    className,
    ...props
}: SelectProps) {
    return (
        <div className={cn('relative', className)}>
            <select
                className={cn(controlClasses, 'appearance-none pr-10')}
                {...props}
            >
                {placeholder !== undefined && (
                    <option value="">{placeholder}</option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500"
                aria-hidden
            />
        </div>
    );
}
