import { CircleCheck, XCircle } from 'lucide-react';

export default function OutcomeToken({ isYes, className }: { isYes: boolean; className?: string }) {
    return (
        <div className={`flex items-center gap-2 font-bold ${isYes ? 'text-emerald-600' : 'text-red-600'} ${className}`}>
            {isYes ? <CircleCheck className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
            <span className="capitalize">{isYes ? 'Yes' : 'No'}</span>
        </div>
    );
}
