'use client';

import { Market } from '@robin-pm-staking/common/types/market';
import { Activity } from '@robin-pm-staking/common/types/activity';
import { DepositedEvent, VaultEvent } from '@robin-pm-staking/common/types/conract-events';
import { eventInfoFromDb, formatUnits } from '@robin-pm-staking/common/lib/utils';
import { UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';

export function ActivityInfo({ activity, market }: { activity: Activity; market: Market }) {
    switch (activity.type) {
        case VaultEvent.Deposited:
            return <DepositedInfo activity={activity} market={market} />;
        default:
            return <div>{activity.userAddress}</div>;
    }
}

function DepositedInfo({ activity, market }: { activity: Activity; market: Market }) {
    const info = eventInfoFromDb(activity.info) as DepositedEvent;
    return <div>{formatUnits(info.amount, UNDERYLING_DECIMALS)}</div>;
}
