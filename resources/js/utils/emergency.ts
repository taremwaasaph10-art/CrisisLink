import type { ReportPriority, ReportStatus } from '@/types';

/** The workflow, in order. The backend enforces the same sequence. */
export const STATUS_FLOW: ReportStatus[] = [
    'submitted',
    'under_review',
    'verified',
    'assigned',
    'in_progress',
    'resolved',
];

type StatusMeta = {
    label: string;
    /** What the step means to a citizen. */
    citizenHint: string;
    badge: string;
    dot: string;
};

export const STATUS_META: Record<ReportStatus, StatusMeta> = {
    submitted: {
        label: 'Submitted',
        citizenHint: 'Your request has been received.',
        badge: 'bg-slate-100 text-slate-700 ring-slate-300',
        dot: 'bg-slate-500',
    },
    under_review: {
        label: 'Under Review',
        citizenHint: 'A responder is reviewing your request.',
        badge: 'bg-amber-50 text-amber-800 ring-amber-300',
        dot: 'bg-amber-500',
    },
    verified: {
        label: 'Verified',
        citizenHint: 'Your request has been confirmed.',
        badge: 'bg-cyan-50 text-cyan-800 ring-cyan-300',
        dot: 'bg-cyan-600',
    },
    assigned: {
        label: 'Assigned',
        citizenHint: 'A responder has been assigned to help you.',
        badge: 'bg-violet-50 text-violet-800 ring-violet-300',
        dot: 'bg-violet-600',
    },
    in_progress: {
        label: 'In Progress',
        citizenHint: 'Help is on the way.',
        badge: 'bg-blue-50 text-blue-800 ring-blue-300',
        dot: 'bg-blue-600',
    },
    resolved: {
        label: 'Resolved',
        citizenHint: 'Your emergency has been resolved.',
        badge: 'bg-emerald-50 text-emerald-800 ring-emerald-300',
        dot: 'bg-emerald-600',
    },
};

export const PRIORITIES: ReportPriority[] = [
    'critical',
    'high',
    'medium',
    'low',
];

export const PRIORITY_META: Record<
    ReportPriority,
    { label: string; badge: string; description: string }
> = {
    critical: {
        label: 'Critical',
        badge: 'bg-red-600 text-white ring-red-700',
        description: 'Life at immediate risk',
    },
    high: {
        label: 'High',
        badge: 'bg-orange-100 text-orange-800 ring-orange-300',
        description: 'Urgent, needs help soon',
    },
    medium: {
        label: 'Medium',
        badge: 'bg-yellow-50 text-yellow-800 ring-yellow-300',
        description: 'Serious but stable',
    },
    low: {
        label: 'Low',
        badge: 'bg-slate-100 text-slate-600 ring-slate-300',
        description: 'Can wait',
    },
};

/** Phrases a citizen can tap to describe the situation quickly. */
export const QUICK_PHRASES: Record<string, string[]> = {
    flood: [
        'People are trapped inside.',
        'Water is rising fast.',
        'We are on the roof.',
        'We need a boat.',
    ],
    fire: [
        'The building is on fire.',
        'People are still inside.',
        'There is thick smoke.',
    ],
    medical: [
        'Someone is badly injured.',
        'Someone is unconscious.',
        'Someone cannot breathe well.',
    ],
    evacuation: [
        'We cannot leave on our own.',
        'There are children and elderly people.',
        'The road is blocked.',
    ],
    'food-water': [
        'We have no drinking water.',
        'We have no food.',
        'There are young children here.',
    ],
    shelter: [
        'Our home is destroyed.',
        'Our home is unsafe.',
        'We need a place to stay tonight.',
    ],
};

export const GENERIC_PHRASES = [
    'People are in danger.',
    'Someone is injured.',
    'We need help quickly.',
];

/** Constantine, Algeria — the demo scenario's city. */
export const DEFAULT_MAP_CENTER: [number, number] = [36.365, 6.6147];

export const LOCATION_UNAVAILABLE_MESSAGE =
    'Unable to get your location. Please enable location services or enter your location manually.';
