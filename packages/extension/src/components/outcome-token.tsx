import { Outcome } from '@/types/types';
import { CircleCheck, XCircle } from 'lucide-react';

export default function OutcomeToken({ outcome, className }: { outcome: Outcome; className?: string }) {
    return (
        <div className={`flex items-center gap-2 font-bold ${outcome === Outcome.Yes ? 'text-emerald-600' : 'text-red-600'} ${className}`}>
            {outcome === Outcome.Yes ? <CircleCheck className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
            <span className="capitalize">{outcome === Outcome.Yes ? 'Yes' : 'No'}</span>
        </div>
    );
}
