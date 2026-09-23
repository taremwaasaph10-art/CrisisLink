import { Camera, Minus, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { EmergencyTypeIcon } from '@/components/emergency-type-icon';
import { Field, Textarea } from '@/components/input';
import type { SosDraft } from '@/pages/citizen/sos/draft';
import { GENERIC_PHRASES, QUICK_PHRASES } from '@/utils/emergency';

export function DetailsStep({
    draft,
    onChange,
    onChangeType,
    onNext,
}: {
    draft: SosDraft;
    onChange: (changes: Partial<SosDraft>) => void;
    onChangeType: () => void;
    onNext: () => void;
}) {
    const [error, setError] = useState<string | null>(null);
    const phrases =
        (draft.type && QUICK_PHRASES[draft.type.slug]) || GENERIC_PHRASES;

    const addPhrase = (phrase: string) => {
        const current = draft.description.trim();
        onChange({ description: current ? `${current} ${phrase}` : phrase });
        setError(null);
    };

    const next = () => {
        if (draft.description.trim().length < 3) {
            setError('Please describe what is happening.');

            return;
        }

        onNext();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Tell us what you need
                </h1>
                <p className="mt-1 text-slate-600">A few words are enough.</p>
            </div>

            {draft.type && (
                <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    <EmergencyTypeIcon
                        icon={draft.type.icon}
                        slug={draft.type.slug}
                    />
                    <span className="flex-1 font-bold text-slate-900">
                        {draft.type.name}
                    </span>
                    <Button variant="ghost" size="sm" onClick={onChangeType}>
                        Change
                    </Button>
                </div>
            )}

            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800">
                    Tap to add
                </p>
                <div className="flex flex-wrap gap-2">
                    {phrases.map((phrase) => (
                        <button
                            key={phrase}
                            type="button"
                            onClick={() => addPhrase(phrase)}
                            className="rounded-full bg-white px-3.5 py-2 text-sm font-medium text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50 active:bg-slate-100"
                        >
                            + {phrase}
                        </button>
                    ))}
                </div>
            </div>

            <Field label="What is happening?" error={error ?? undefined}>
                {(props) => (
                    <Textarea
                        {...props}
                        value={draft.description}
                        onChange={(event) => {
                            onChange({ description: event.target.value });
                            setError(null);
                        }}
                        placeholder="e.g. There are four people trapped inside the house."
                        maxLength={2000}
                        rows={4}
                    />
                )}
            </Field>

            <div className="space-y-2">
                <p
                    id="people-label"
                    className="text-sm font-semibold text-slate-800"
                >
                    How many people need help?
                </p>
                <div
                    className="flex items-center gap-3"
                    role="group"
                    aria-labelledby="people-label"
                >
                    <button
                        type="button"
                        onClick={() =>
                            onChange({ people: Math.max(1, draft.people - 1) })
                        }
                        disabled={draft.people <= 1}
                        className="grid size-14 place-items-center rounded-2xl bg-white text-slate-900 ring-1 ring-slate-300 disabled:text-slate-300"
                        aria-label="One person fewer"
                    >
                        <Minus className="size-6" />
                    </button>
                    <output
                        aria-live="polite"
                        className="min-w-16 text-center text-4xl font-bold text-slate-900 tabular-nums"
                    >
                        {draft.people}
                    </output>
                    <button
                        type="button"
                        onClick={() =>
                            onChange({
                                people: Math.min(10000, draft.people + 1),
                            })
                        }
                        className="grid size-14 place-items-center rounded-2xl bg-white text-slate-900 ring-1 ring-slate-300"
                        aria-label="One person more"
                    >
                        <Plus className="size-6" />
                    </button>
                    <span className="text-slate-600">
                        {draft.people === 1 ? 'person' : 'people'}
                    </span>
                </div>
            </div>

            <PhotoPicker
                photo={draft.photo}
                onChange={(photo) => onChange({ photo })}
            />

            <Button variant="danger" size="xl" fullWidth onClick={next}>
                Next: confirm location
            </Button>
        </div>
    );
}

function PhotoPicker({
    photo,
    onChange,
}: {
    photo: File | null;
    onChange: (photo: File | null) => void;
}) {
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!photo) {
            setPreview(null);

            return;
        }

        const url = URL.createObjectURL(photo);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [photo]);

    return (
        <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-800">
                Photo{' '}
                <span className="font-normal text-slate-500">(optional)</span>
            </p>
            {preview ? (
                <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-200">
                    <img
                        src={preview}
                        alt="Selected photo of the emergency"
                        className="max-h-56 w-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-slate-950/70 text-white"
                        aria-label="Remove photo"
                    >
                        <X className="size-5" />
                    </button>
                </div>
            ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-5 font-semibold text-slate-700 hover:border-slate-400">
                    <Camera className="size-5" aria-hidden />
                    Add a photo
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            event.target.value = '';

                            if (file && file.size > 5 * 1024 * 1024) {
                                setError(
                                    'The photo must be smaller than 5 MB.',
                                );

                                return;
                            }

                            setError(null);
                            onChange(file);
                        }}
                    />
                </label>
            )}
            {error && (
                <p className="text-sm font-medium text-sos-700">{error}</p>
            )}
        </div>
    );
}
