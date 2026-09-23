import { EmergencyCard } from '@/components/emergency-card';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { useApiQuery } from '@/hooks/use-api-query';
import { emergencyReportService } from '@/services/emergency-reports';
import type { EmergencyType } from '@/types';

export function TypeStep({
    selected,
    onSelect,
}: {
    selected: EmergencyType | null;
    onSelect: (type: EmergencyType) => void;
}) {
    const types = useApiQuery(() => emergencyReportService.types(), []);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    What is happening?
                </h1>
                <p className="mt-1 text-slate-600">
                    Choose the type of emergency.
                </p>
            </div>

            {types.isLoading && !types.data && (
                <LoadingState label="Loading emergency types…" />
            )}
            {types.error && !types.data && (
                <ErrorState
                    message={types.error.message}
                    onRetry={types.reload}
                />
            )}

            {types.data && (
                <div className="grid grid-cols-2 gap-3">
                    {types.data.map((type) => (
                        <EmergencyCard
                            key={type.id}
                            type={type}
                            selected={selected?.id === type.id}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
