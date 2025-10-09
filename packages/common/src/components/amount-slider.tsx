import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn, formatUnits } from '../lib/utils';
import { formatUnits as viemFormatUnits } from 'viem';
import { UNDERYLING_DECIMALS } from '../constants';

export type AmountSliderProps = {
    amount: string;
    max: bigint;
    onAmountChange: (nextAmount: string) => void;
    decimals?: number;
    disabled?: boolean;
    className?: string;
    stickyPercents?: number[]; // e.g. [25, 50, 75]
    stickyThreshold?: number; // +/- percentage points within which to snap (legacy)
    showMax?: boolean;
};

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function toCompactNumberString(value: string, maxFractionDigits = UNDERYLING_DECIMALS) {
    const n = Number(value);
    if (!isFinite(n)) return value;
    return n.toLocaleString(undefined, { maximumFractionDigits: maxFractionDigits });
}

function toOneDecimalIfNecessary(value: string) {
    const n = Number(value);
    if (!isFinite(n)) return value;
    const rounded = Math.round(n * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function AmountSlider({
    amount,
    max,
    onAmountChange,
    decimals = UNDERYLING_DECIMALS,
    disabled,
    className,
    stickyPercents = [25, 50, 75],
    stickyThreshold = 1.5,
    showMax = true,
}: AmountSliderProps) {
    // Percent from amount/max (integer percent for a clean UI)
    const percent = React.useMemo(() => {
        const maxFloat = Number(formatUnits(max, decimals));
        const amountFloat = amount ? Number(amount) : 0;
        if (!isFinite(maxFloat) || maxFloat <= 0) return 0;
        if (!isFinite(amountFloat) || amountFloat <= 0) return 0;
        return clamp(Math.round((amountFloat / maxFloat) * 100), 0, 100);
    }, [amount, max, decimals]);

    const [internalPercent, setInternalPercent] = React.useState<number>(percent);

    // Keep internal state in sync with derived percent from amount/max
    React.useEffect(() => {
        setInternalPercent(percent);
    }, [percent]);

    const handleValueChange = (values: number[]) => {
        let next = values[0] ?? 0;
        // Snap while dragging
        const sticky = stickyPercents.find(p => Math.abs(p - next) <= stickyThreshold);
        if (typeof sticky === 'number') next = sticky;
        setInternalPercent(next);
        // Update amount continuously while dragging for responsive UI

        const amountUnits = (max * BigInt(Math.round(next))) / 100n; // integer percent of max
        const amountStr = viemFormatUnits(amountUnits, decimals);
        const finalStr = next === 100 ? amountStr : toOneDecimalIfNecessary(amountStr);
        onAmountChange(finalStr);
    };

    const handleValueCommit = (values: number[]) => {
        let next = values[0] ?? 0;
        // Snap to sticky percents with a slightly larger commit threshold for a stronger feel
        const sticky = stickyPercents.find(p => Math.abs(p - next) <= stickyThreshold);
        if (typeof sticky === 'number') {
            next = sticky;
            setInternalPercent(sticky);
        }
        const amountUnits = (max * BigInt(Math.round(next))) / 100n;
        const amountStr = viemFormatUnits(amountUnits, decimals);
        const finalStr = next === 100 ? amountStr : toOneDecimalIfNecessary(amountStr);
        onAmountChange(finalStr);
    };

    const handleMaxClick = () => {
        if (disabled) return;
        onAmountChange(viemFormatUnits(max, decimals));
    };

    const formattedBalance = React.useMemo(() => toCompactNumberString(formatUnits(max, decimals)), [max, decimals]);

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <SliderPrimitive.Root
                value={[internalPercent]}
                onValueChange={handleValueChange}
                onValueCommit={handleValueCommit}
                max={100}
                step={1}
                disabled={disabled}
                className={cn('relative flex w-full touch-none select-none items-center', disabled ? 'opacity-50' : '')}
            >
                {/* Track */}
                <SliderPrimitive.Track className="cursor-pointer relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
                    <SliderPrimitive.Range className="absolute h-full bg-primary" />
                </SliderPrimitive.Track>
                {/* Sticky marks */}
                {stickyPercents.map(p => (
                    <div key={p} className="pointer-events-none absolute top-1/2 -translate-y-1/2" style={{ left: `${p}%` }}>
                        <div className="h-3 w-[2px] bg-primary/50" />
                    </div>
                ))}
                {/* Thumb + tooltip on hover */}
                <SliderPrimitive.Thumb className="cursor-pointer group relative block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    <div className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 select-none text-[10px] leading-none opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="rounded bg-primary px-1 py-[2px] text-background shadow">{internalPercent}%</div>
                    </div>
                </SliderPrimitive.Thumb>
            </SliderPrimitive.Root>
            {showMax && (
                <div
                    role="button"
                    onClick={handleMaxClick}
                    className={`cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                        disabled ? 'opacity-50 pointer-events-none' : ''
                    } [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-5 px-2 py-2`}
                >
                    Max: {formattedBalance}
                </div>
            )}
        </div>
    );
}

AmountSlider.displayName = 'AmountSlider';

export default AmountSlider;
