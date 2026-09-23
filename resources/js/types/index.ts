export type UserRole = 'citizen' | 'responder' | 'admin';

export type User = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    active_assignments_count?: number;
    created_at: string | null;
};

export type ReportStatus =
    | 'submitted'
    | 'under_review'
    | 'verified'
    | 'assigned'
    | 'in_progress'
    | 'resolved';

export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';

export type EmergencyType = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string;
};

export type ReportLocation = {
    latitude: number | null;
    longitude: number | null;
    description: string | null;
};

export type Assignment = {
    id: number;
    responder?: { id: number; name: string; phone?: string | null };
    assigned_at: string;
    completed_at: string | null;
    notes?: string | null;
};

export type StatusUpdate = {
    id: number;
    status: ReportStatus;
    from_status: ReportStatus | null;
    created_at: string;
    note?: string | null;
    actor?: string | null;
};

export type EmergencyReport = {
    id: number;
    reference_number: string;
    type?: EmergencyType;
    description: string;
    people_affected: number;
    location: ReportLocation;
    priority: ReportPriority;
    status: ReportStatus;
    next_status: ReportStatus | null;
    photo_url: string | null;
    reported_at: string;
    updated_at: string | null;
    assignment?: Assignment | null;
    timeline?: StatusUpdate[];
    reporter?: {
        id: number;
        name: string;
        phone: string | null;
        email: string;
    };
};

export type AppNotification = {
    id: number;
    title: string;
    message: string;
    emergency_report_id: number | null;
    read_at: string | null;
    created_at: string;
};

export type AlertSeverity = 'info' | 'warning' | 'danger';

export type EmergencyAlert = {
    id: number;
    title: string;
    message: string;
    severity: AlertSeverity;
    area: string | null;
    created_at: string;
};

export type DashboardStats = {
    active: number;
    critical: number;
    pending_verification: number;
    assigned: number;
    resolved: number;
};

export type DashboardData = {
    stats: DashboardStats;
    active_requests: EmergencyReport[];
};

export type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

export type Paginated<T> = {
    data: T[];
    meta: PaginationMeta;
};

export type Coordinates = {
    latitude: number;
    longitude: number;
};
