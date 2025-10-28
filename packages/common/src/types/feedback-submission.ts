export interface FeedbackSubmissionRow {
    id: string;
    userAddress: string; // connected wallet address (lowercase)
    proxyAddress: string | null; // proxy address used on-chain if available
    answers: string; // survey answers
    createdAt: string; // ms since epoch as string
}

export interface FeedbackSubmission {
    id: string;
    userAddress: string;
    proxyAddress: string | null;
    answers: Record<string, unknown>;
    createdAt: number;
}
