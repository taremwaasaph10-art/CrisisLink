import { ArrowLeft, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useGeolocation } from '@/hooks/use-geolocation';
import { announceNotificationsChanged } from '@/hooks/use-unread-count';
import { DetailsStep } from '@/pages/citizen/sos/details-step';
import { EMPTY_DRAFT, STEPS } from '@/pages/citizen/sos/draft';
import type { SosDraft, SosStep } from '@/pages/citizen/sos/draft';
import { LocationStep } from '@/pages/citizen/sos/location-step';
import { ReviewModal } from '@/pages/citizen/sos/review-modal';
import { TypeStep } from '@/pages/citizen/sos/type-step';
import { toApiError } from '@/services/api';
import type { ApiError } from '@/services/api';
import { emergencyReportService } from '@/services/emergency-reports';
import { describeLocation } from '@/services/geocoding';
import { cn } from '@/utils/cn';

const STEP_TITLES: Record<SosStep, string> = {
    type: 'Emergency type',
    details: 'Details',
    location: 'Location',
};

/**
 * The SOS flow: type → details → location → confirm → submitted.
 *
 * The step lives in the URL so the phone's back button steps backwards
 * instead of abandoning the report. Location capture starts immediately so
 * the position is usually ready by the time the citizen reaches that step.
 */
export function SosPage() {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const geolocation = useGeolocation();
    const [draft, setDraft] = useState<SosDraft>(EMPTY_DRAFT);
    const [isReviewing, setIsReviewing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<ApiError | null>(null);

    const requestedStep = params.get('step') as SosStep | null;
    const step: SosStep =
        draft.type && requestedStep && STEPS.includes(requestedStep)
            ? requestedStep
            : 'type';
    const stepIndex = STEPS.indexOf(step);

    const coordinates = draft.pinned ?? geolocation.coordinates;
    const latitude = coordinates?.latitude;
    const longitude = coordinates?.longitude;

    const { locate } = geolocation;

    useEffect(() => {
        locate();
    }, [locate]);

    // Suggest a readable place name for the pin until the citizen types their own.
    useEffect(() => {
        if (
            latitude === undefined ||
            longitude === undefined ||
            draft.locationEdited
        ) {
            return;
        }

        let cancelled = false;
        const timer = window.setTimeout(async () => {
            const place = await describeLocation({ latitude, longitude });

            if (!cancelled && place) {
                setDraft((current) =>
                    current.locationEdited
                        ? current
                        : { ...current, locationDescription: place },
                );
            }
        }, 700);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [latitude, longitude, draft.locationEdited]);

    const update = (changes: Partial<SosDraft>) =>
        setDraft((current) => ({ ...current, ...changes }));

    const goTo = (next: SosStep) => {
        setParams({ step: next });
        window.scrollTo({ top: 0 });
    };

    const back = () => (stepIndex === 0 ? navigate('/home') : navigate(-1));

    const submit = async () => {
        if (!draft.type) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const report = await emergencyReportService.submit({
                emergency_type_id: draft.type.id,
                description: draft.description.trim(),
                people_affected: draft.people,
                latitude: coordinates?.latitude ?? null,
                longitude: coordinates?.longitude ?? null,
                location_description: draft.locationDescription.trim(),
                photo: draft.photo,
            });

            announceNotificationsChanged();
            void navigate(`/emergency/${report.id}?submitted=1`, {
                replace: true,
            });
        } catch (error) {
            setSubmitError(toApiError(error));
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-slate-50 sm:border-x sm:border-slate-200">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="flex items-center gap-2 px-2 py-2">
                    <button
                        type="button"
                        onClick={back}
                        className="rounded-full p-2.5 text-slate-700 hover:bg-slate-100"
                        aria-label={
                            stepIndex === 0 ? 'Back to home' : 'Previous step'
                        }
                    >
                        <ArrowLeft className="size-6" />
                    </button>
                    <div className="flex-1 text-center">
                        <p className="text-sm font-bold text-sos-700 uppercase">
                            SOS · Emergency report
                        </p>
                        <p className="text-xs text-slate-500">
                            Step {stepIndex + 1} of {STEPS.length}:{' '}
                            {STEP_TITLES[step]}
                        </p>
                    </div>
                    <Link
                        to="/home"
                        className="rounded-full p-2.5 text-slate-700 hover:bg-slate-100"
                        aria-label="Cancel report"
                    >
                        <X className="size-6" />
                    </Link>
                </div>
                <div className="grid grid-cols-3 gap-1 px-4 pb-3" aria-hidden>
                    {STEPS.map((item, index) => (
                        <span
                            key={item}
                            className={cn(
                                'h-1.5 rounded-full',
                                index <= stepIndex
                                    ? 'bg-sos-600'
                                    : 'bg-slate-200',
                            )}
                        />
                    ))}
                </div>
            </header>

            <main className="flex-1 px-4 pt-5 pb-10">
                {step === 'type' && (
                    <TypeStep
                        selected={draft.type}
                        onSelect={(type) => {
                            update({ type });
                            goTo('details');
                        }}
                    />
                )}
                {step === 'details' && (
                    <DetailsStep
                        draft={draft}
                        onChange={update}
                        onChangeType={() => navigate(-1)}
                        onNext={() => goTo('location')}
                    />
                )}
                {step === 'location' && (
                    <LocationStep
                        draft={draft}
                        coordinates={coordinates}
                        geolocation={geolocation}
                        onChange={update}
                        onReview={() => {
                            setSubmitError(null);
                            setIsReviewing(true);
                        }}
                    />
                )}
            </main>

            <ReviewModal
                open={isReviewing}
                draft={draft}
                coordinates={coordinates}
                isSubmitting={isSubmitting}
                error={submitError}
                onClose={() => setIsReviewing(false)}
                onConfirm={submit}
            />
        </div>
    );
}
