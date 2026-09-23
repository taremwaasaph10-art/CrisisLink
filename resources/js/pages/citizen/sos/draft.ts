import type { Coordinates, EmergencyType } from '@/types';

/** Everything the citizen has entered so far in the SOS flow. */
export type SosDraft = {
    type: EmergencyType | null;
    description: string;
    people: number;
    photo: File | null;
    /** Set when the citizen taps the map or drags the pin, overriding GPS. */
    pinned: Coordinates | null;
    locationDescription: string;
    /** Once the citizen types a location we stop filling it in for them. */
    locationEdited: boolean;
};

export const EMPTY_DRAFT: SosDraft = {
    type: null,
    description: '',
    people: 1,
    photo: null,
    pinned: null,
    locationDescription: '',
    locationEdited: false,
};

export type SosStep = 'type' | 'details' | 'location';

export const STEPS: SosStep[] = ['type', 'details', 'location'];
