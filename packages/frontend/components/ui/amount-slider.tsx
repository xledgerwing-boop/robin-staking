'use client';

import { AmountSlider as CommonAmountSlider, AmountSliderProps } from '@robin-pm-staking/common/components/amount-slider';
import { UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';

export function AmountSlider({
    amount,
    max,
    onAmountChange,
    decimals = UNDERYLING_DECIMALS,
    disabled,
    className,
    stickyPercents = [25, 50, 75],
    stickyThreshold = 1.5,
}: AmountSliderProps) {
    return (
        <CommonAmountSlider
            amount={amount}
            max={max}
            onAmountChange={onAmountChange}
            decimals={decimals}
            disabled={disabled}
            className={className}
            stickyPercents={stickyPercents}
            stickyThreshold={stickyThreshold}
        />
    );
}
