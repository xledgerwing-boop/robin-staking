export interface RewardActivityRow {
    id: string;
    userAddress: string; // connected wallet address (lowercase)
    points: number; // integer points
    type: string; // free-text type e.g., "Staking Feedback"
    createdAt: string; // ms since epoch as string
    details?: string | null; // optional JSON metadata
}

export interface RewardActivity {
    id: string;
    userAddress: string;
    points: number;
    type: string;
    createdAt: number;
    details?: Record<string, unknown> | null;
}
