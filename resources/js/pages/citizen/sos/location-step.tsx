import {
    CircleCheck,
    LoaderCircle,
    LocateFixed,
    MapPinOff,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/button';
import { Field, Input } from '@/components/input';
import { LocationPicker } from '@/components/map/location-picker';
import type { useGeolocation } from '@/hooks/use-geolocation';
import type { SosDraft } from '@/pages/citizen/sos/draft';
import type { Coordinates } from '@/types';

type Geolocation = ReturnType<typeof useGeolocation>;

export function LocationStep({
    draft,
    coordinates,
    geolocation,
    onChange,
    onReview,
}: {
    draft: SosDraft;
    coordinates: Coordinates | null;
    geolocation: Geolocation;
    onChange: (changes: Partial<SosDraft>) => void;
    onReview: () => void;
}) {
    const [error, setError] = useState<string | null>(null);

    const review = () => {
        if (!coordinates && draft.locationDescription.trim() === '') {
            setError('Please share your location or describe where you are.');

            return;
        }

        onReview();
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Where are you?
                </h1>
                <p className="mt-1 text-slate-600">
                    Responders will use this to find you.
                </p>
            </div>

            <LocationStatus
                geolocation={geolocation}
                isPinned={draft.pinned !== null}
                onRetry={() => {
                    onChange({ pinned: null });
                    geolocation.locate();
                }}
            />

            <div className="space-y-2">
                <div className="h-72 overflow-hidden rounded-2xl ring-1 ring-slate-200">
                    <LocationPicker
                        value={coordinates}
                        gpsFix={geolocation.coordinates}
                        accuracy={draft.pinned ? null : geolocation.accuracy}
                        onChange={(pinned) => {
                            onChange({ pinned });
                            setError(null);
                        }}
                    />
                </div>
                <p className="text-sm text-slate-500">
                    Tap the map or drag the pin if your position is not exact.
                </p>
            </div>

            <Field
                label="Describe your location"
                hint="A street, building, landmark or floor helps responders find you."
                error={error ?? undefined}
            >
                {(props) => (
                    <Input
                        {...props}
                        value={draft.locationDescription}
                        onChange={(event) => {
                            onChange({
                                locationDescription: event.target.value,
                                locationEdited: true,
                            });
                            setError(null);
                        }}
                        placeholder="e.g. Blue house next to the mosque, 2nd floor"
                        maxLength={255}
                    />
                )}
            </Field>

            <Button variant="danger" size="xl" fullWidth onClick={review}>
                Review and send SOS
            </Button>
        </div>
    );
}

function LocationStatus({
    geolocation,
    isPinned,
    onRetry,
}: {
    geolocation: Geolocation;
    isPinned: boolean;
    onRetry: () => void;
}) {
    if (isPinned) {
        return (
            <div className="flex items-center gap-3 rounded-2xl bg-blue-50 p-3 text-blue-900 ring-1 ring-blue-200">
                <CircleCheck className="size-5 shrink-0" aria-hidden />
                <p className="flex-1 text-sm font-semibold">
                    Location set on the map.
                </p>
                <Button variant="ghost" size="sm" onClick={onRetry}>
                    <LocateFixed className="size-4" aria-hidden />
                    Use GPS
                </Button>
            </div>
        );
    }

    if (geolocation.status === 'found') {
        return (
            <div
                role="status"
                className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 text-emerald-900 ring-1 ring-emerald-200"
            >
                <CircleCheck className="size-5 shrink-0" aria-hidden />
                <p className="flex-1 text-sm font-semibold">
                    Location captured
                    {geolocation.accuracy !== null && (
                        <span className="font-normal">
                            {' '}
                            (within about {geolocation.accuracy} m)
                        </span>
                    )}
                </p>
            </div>
        );
    }

    if (geolocation.status === 'failed') {
        return (
            <div
                role="alert"
                className="space-y-2 rounded-2xl bg-amber-50 p-3 text-amber-950 ring-1 ring-amber-300"
            >
                <p className="flex items-start gap-3 text-sm font-semibold">
                    <MapPinOff className="mt-0.5 size-5 shrink-0" aria-hidden />
                    {geolocation.error}
                </p>
                <Button variant="secondary" size="sm" onClick={onRetry}>
                    <LocateFixed className="size-4" aria-hidden />
                    Try again
                </Button>
            </div>
        );
    }

    return (
        <div
            role="status"
            className="flex items-center gap-3 rounded-2xl bg-white p-3 text-slate-700 ring-1 ring-slate-200"
        >
            <LoaderCircle
                className="size-5 shrink-0 animate-spin text-sos-600"
                aria-hidden
            />
            <p className="text-sm font-semibold">Finding your location…</p>
        </div>
    );
}
