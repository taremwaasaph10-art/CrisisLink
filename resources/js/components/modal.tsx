import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
};

/**
 * Built on the native <dialog> element, which traps focus, closes on Escape
 * and returns focus to the trigger without extra code.
 */
export function Modal({
    open,
    onClose,
    title,
    children,
    footer,
    className,
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target === dialogRef.current) {
                    onClose();
                }
            }}
            className={cn(
                'm-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm',
                className,
            )}
        >
            {open && (
                <div className="flex max-h-[85dvh] flex-col">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
                        <h2 className="text-lg font-bold">{title}</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="-mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                    <div className="overflow-y-auto px-5 py-4">{children}</div>
                    {footer && (
                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
                            {footer}
                        </div>
                    )}
                </div>
            )}
        </dialog>
    );
}
