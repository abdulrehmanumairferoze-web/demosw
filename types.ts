
export interface DepartmentMismatch {
  department: string;
  metric: string;
  plan: number;
  actual: number;
  variance: number;
  unit: string;
  status: 'critical' | 'warning' | 'on-track';
  reasoning?: string;
}

export interface SummaryReport {
  id: string;
  timestamp: string;
  executiveSummary: string;
  mismatches: DepartmentMismatch[];
  actionPoints: string[];
}

export interface ERPConnection {
  system: 'ERP' | 'MREP' | 'FINANCE';
  status: 'connected' | 'disconnected';
  lastFetch: string | null;
}
