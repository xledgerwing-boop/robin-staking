import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { FEEDBACK_SECTIONS, type FeedbackSection, type FeedbackQuestion } from '@/lib/feedback-schema';
import { FEEDBACK_SUBMISSIONS_TABLE } from '@robin-pm-staking/common/lib/rewards';

type OptionCount = { value: string; label: string; count: number };
type TextEntry = { submissionId: string; userAddress: string; proxyAddress: string | null; createdAt: string; answer: string };
type NumericEntry = TextEntry & { value: number };

type QuestionSummary = {
    id: string;
    label: string;
    sectionId: string;
    sectionTitle: string;
    type: FeedbackQuestion['type'];
    totalResponses: number;
    otherLabel?: string;
    optionCounts?: OptionCount[];
    textResponses?: TextEntry[];
    otherEntries?: TextEntry[];
    numericValues?: NumericEntry[];
    numericStats?: { min: number; max: number; avg: number };
};

type InternalQuestionSummary = QuestionSummary & {
    optionCountMap?: Map<string, OptionCount>;
};

type SubmissionRow = {
    id: string;
    userAddress: string;
    proxyAddress: string | null;
    answers: unknown;
    createdAt: string;
};

function isAuthorized(req: NextRequest): boolean {
    const header = req.headers.get('x-admin-password') || '';
    const envPass = process.env.REWARDS_ADMIN_PASSWORD || '';
    return !!envPass && header === envPass;
}

function buildQuestionSummaries(sections: FeedbackSection[]): Map<string, InternalQuestionSummary> {
    const map = new Map<string, InternalQuestionSummary>();
    sections.forEach(section => {
        section.questions.forEach(question => {
            const optionCountMap =
                question.type === 'select' || question.type === 'multi-select'
                    ? new Map(question.options.map(opt => [opt.value, { value: opt.value, label: opt.label, count: 0 } satisfies OptionCount]))
                    : undefined;
            map.set(question.id, {
                id: question.id,
                label: question.label,
                sectionId: section.id,
                sectionTitle: section.title,
                type: question.type,
                totalResponses: 0,
                otherLabel: 'supportsOther' in question && question.supportsOther ? question.otherLabel ?? 'Other' : undefined,
                optionCounts: optionCountMap ? Array.from(optionCountMap.values()) : undefined,
                optionCountMap,
                textResponses: question.type === 'text' ? [] : undefined,
                otherEntries: 'supportsOther' in question && question.supportsOther ? [] : undefined,
                numericValues: question.type === 'number' ? [] : undefined,
            });
        });
    });
    return map;
}

function normalizeAnswers(raw: unknown): Record<string, unknown> {
    if (!raw) return {};
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw) as Record<string, unknown>;
        } catch {
            return {};
        }
    }
    if (typeof raw === 'object') return raw as Record<string, unknown>;
    return {};
}

function ensureOtherOption(summary: InternalQuestionSummary) {
    if (!summary.optionCountMap || summary.optionCountMap.has('other')) return;
    const entry: OptionCount = { value: 'other', label: summary.otherLabel ?? 'Other', count: 0 };
    summary.optionCountMap.set('other', entry);
    summary.optionCounts?.push(entry);
}

export async function GET(req: NextRequest) {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const db = await getDb();
        const submissions = (await db(FEEDBACK_SUBMISSIONS_TABLE).orderBy('createdAt', 'desc')) as SubmissionRow[];
        const summaries = buildQuestionSummaries(FEEDBACK_SECTIONS);

        submissions.forEach(submission => {
            const answers = normalizeAnswers(submission.answers);
            Object.entries(answers).forEach(([questionId, value]) => {
                const summary = summaries.get(questionId);
                if (!summary) return;
                switch (summary.type) {
                    case 'text': {
                        const str = typeof value === 'string' ? value.trim() : '';
                        if (!str) return;
                        summary.totalResponses += 1;
                        summary.textResponses?.push({
                            submissionId: submission.id,
                            userAddress: submission.userAddress,
                            proxyAddress: submission.proxyAddress,
                            createdAt: submission.createdAt,
                            answer: str,
                        });
                        break;
                    }
                    case 'number': {
                        const num = Number(value);
                        if (!Number.isFinite(num)) return;
                        summary.totalResponses += 1;
                        summary.numericValues?.push({
                            submissionId: submission.id,
                            userAddress: submission.userAddress,
                            proxyAddress: submission.proxyAddress,
                            createdAt: submission.createdAt,
                            answer: num.toString(),
                            value: num,
                        });
                        break;
                    }
                    case 'select': {
                        if (value && typeof value === 'object' && !Array.isArray(value)) {
                            const obj = value as { value?: string; otherText?: string };
                            if (obj.value === 'other' && obj.otherText) {
                                ensureOtherOption(summary);
                                const otherEntry = summary.optionCountMap?.get('other');
                                if (otherEntry) otherEntry.count += 1;
                                summary.otherEntries?.push({
                                    submissionId: submission.id,
                                    userAddress: submission.userAddress,
                                    proxyAddress: submission.proxyAddress,
                                    createdAt: submission.createdAt,
                                    answer: obj.otherText.trim(),
                                });
                                summary.totalResponses += 1;
                                return;
                            }
                        }
                        const str = typeof value === 'string' ? value : null;
                        if (!str) return;
                        const entry = summary.optionCountMap?.get(str);
                        if (!entry) return;
                        entry.count += 1;
                        summary.totalResponses += 1;
                        break;
                    }
                    case 'multi-select': {
                        let selections: string[] = [];
                        let otherText: string | null = null;
                        if (Array.isArray(value)) {
                            selections = value.filter((v): v is string => typeof v === 'string');
                        } else if (value && typeof value === 'object') {
                            const obj = value as { values?: unknown; otherText?: string };
                            if (Array.isArray(obj.values)) {
                                selections = obj.values.filter((v): v is string => typeof v === 'string');
                            }
                            if (typeof obj.otherText === 'string' && obj.otherText.trim()) {
                                otherText = obj.otherText.trim();
                            }
                        }
                        if (!selections.length && !otherText) return;
                        summary.totalResponses += 1;
                        const uniqueSelections = [...new Set(selections)];
                        uniqueSelections.forEach(sel => {
                            const entry = summary.optionCountMap?.get(sel);
                            if (entry) entry.count += 1;
                        });
                        if (otherText) {
                            ensureOtherOption(summary);
                            const otherEntry = summary.optionCountMap?.get('other');
                            if (otherEntry) otherEntry.count += 1;
                            summary.otherEntries?.push({
                                submissionId: submission.id,
                                userAddress: submission.userAddress,
                                proxyAddress: submission.proxyAddress,
                                createdAt: submission.createdAt,
                                answer: otherText,
                            });
                        }
                        break;
                    }
                    default:
                        break;
                }
            });
        });

        const questions = Array.from(summaries.values()).map(({ optionCountMap, numericValues, ...rest }) => {
            const numericStats =
                numericValues && numericValues.length
                    ? {
                          min: Math.min(...numericValues.map(n => n.value)),
                          max: Math.max(...numericValues.map(n => n.value)),
                          avg: numericValues.reduce((acc, curr) => acc + curr.value, 0) / numericValues.length,
                      }
                    : undefined;
            return {
                ...rest,
                optionCounts: rest.optionCounts,
                numericValues,
                numericStats,
            } satisfies QuestionSummary;
        });

        const normalizedSubmissions = submissions.map(sub => ({
            ...sub,
            answers: normalizeAnswers(sub.answers),
        }));

        return NextResponse.json({
            totalSubmissions: submissions.length,
            sections: FEEDBACK_SECTIONS,
            questions,
            submissions: normalizedSubmissions,
        });
    } catch (e) {
        console.error('Failed to load feedback summary', e);
        return NextResponse.json({ error: 'Failed to load feedback summary' }, { status: 500 });
    }
}
