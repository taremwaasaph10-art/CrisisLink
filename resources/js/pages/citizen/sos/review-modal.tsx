import { Send } from 'lucide-react';
import { Button } from '@/components/button';
import { InlineError } from '@/components/error-state';
import { Modal } from '@/components/modal';
import type { SosDraft } from '@/pages/citizen/sos/draft';
import type { ApiError } from '@/services/api';
import type { Coordinates } from '@/types';
import { formatCoordinates, pluralize } from '@/utils/format';

export function ReviewModal({
    open,
    draft,
    coordinates,
    isSubmitting,
    error,
    onClose,
    onConfirm,
}: {
    open: boolean;
    draft: SosDraft;
    coordinates: Coordinates | null;
    isSubmitting: boolean;
    error: ApiError | null;
    onClose: () => void;
    onConfirm: () => void;
}) {
    const rows: [string, string][] = [
        ['Emergency', draft.type?.name ?? '—'],
        ['What is happening', draft.description.trim()],
        ['People', pluralize(draft.people, 'person', 'people')],
        [
            'Location',
            [
                draft.locationDescription.trim(),
                coordinates
                    ? formatCoordinates(
                          coordinates.latitude,
                          coordinates.longitude,
                      )
                    : 'No GPS position',
            ]
                .filter(Boolean)
                .join(' · '),
        ],
        ['Photo', draft.photo ? 'Attached' : 'None'],
    ];

    const validationMessages = error ? Object.values(error.errors).flat() : [];

    return (
        <Modal
            open={open}
            onClose={isSubmitting ? () => undefined : onClose}
            title="Send this SOS?"
            footer={
                <>
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="danger"
                        size="lg"
                        onClick={onConfirm}
                        isLoading={isSubmitting}
                    >
                        {!isSubmitting && (
                            <Send className="size-5" aria-hidden />
                        )}
                        {isSubmitting ? 'Sending…' : 'Send SOS now'}
                    </Button>
                </>
            }
        >
            <dl className="divide-y divide-slate-100">
                {rows.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-3 gap-3 py-2.5">
                        <dt className="text-sm font-medium text-slate-500">
                            {label}
                        </dt>
                        <dd className="col-span-2 text-sm font-semibold break-words text-slate-900">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>

            {error && (
                <div className="mt-4 space-y-2">
                    <InlineError message="Your request could not be submitted. Please try again." />
                    {(validationMessages.length > 0
                        ? validationMessages
                        : [error.message]
                    ).map((message) => (
                        <p key={message} className="text-sm text-sos-800">
                            • {message}
                        </p>
                    ))}
                </div>
            )}
        </Modal>
    );
}
