import { Outcome } from '../types/market';
import { CircleCheck, XCircle } from 'lucide-react';

export default function OutcomeToken({
    outcome,
    symbolHolder,
    className,
    noText = false,
}: {
    outcome?: Outcome;
    symbolHolder: {
        outcomes: string[];
    };
    className?: string;
    noText?: boolean;
}) {
    const yesSymbol = symbolHolder.outcomes[0];
    const noSymbol = symbolHolder.outcomes[1];

    if (!outcome) return <span className="capitalize">-</span>;
    return (
        <div
            className={`flex items-center gap-2 font-bold ${
                outcome === Outcome.Yes ? 'text-emerald-600' : outcome === Outcome.No ? 'text-red-600' : 'text-primary'
            } ${className}`}
        >
            {outcome === Outcome.Yes ? (
                <CircleCheck className="w-4 h-4 text-emerald-600" />
            ) : outcome === Outcome.No ? (
                <XCircle className="w-4 h-4 text-red-600" />
            ) : (
                <div className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-emerald-600" />
                    <XCircle className="w-4 h-4 text-red-600" />
                </div>
            )}
            {!noText && <span className="capitalize">{outcome === Outcome.Yes ? yesSymbol : outcome === Outcome.No ? noSymbol : 'Both'}</span>}
        </div>
    );
}
