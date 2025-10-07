'use client';

import { Market } from '@robin-pm-staking/common/types/market';
import { Activity } from '@robin-pm-staking/common/types/activity';
import {
    DepositedEvent,
    HarvestedProtocolYieldEvent,
    HarvestedYieldEvent,
    MarketFinalizedEvent,
    RedeemedWinningForUSDEvent,
    VaultEvent,
    winningPositionToString,
    WithdrawnEvent,
    YieldUnlockedEvent,
    YieldUnlockProgressEvent,
} from '@robin-pm-staking/common/types/conract-events';
import { eventInfoFromDb, formatUnits } from '@robin-pm-staking/common/lib/utils';
import { UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';

export function ActivityInfo({ activity, market }: { activity: Activity; market: Market }) {
    switch (activity.type) {
        case VaultEvent.Deposited:
            return <DepositedInfo activity={activity} market={market} />;
        case VaultEvent.Withdrawn:
            return <WithdrawnInfo activity={activity} market={market} />;
        case VaultEvent.MarketFinalized:
            return <MarketFinalizedInfo activity={activity} market={market} />;
        case VaultEvent.YieldUnlockStarted:
            return <YieldUnlockStartedInfo activity={activity} market={market} />;
        case VaultEvent.YieldUnlockProgress:
            return <YieldUnlockProgressInfo activity={activity} market={market} />;
        case VaultEvent.YieldUnlocked:
            return <YieldUnlockedInfo activity={activity} market={market} />;
        case VaultEvent.HarvestedYield:
            return <HarvestedYieldInfo activity={activity} market={market} />;
        case VaultEvent.RedeemedWinningForUSD:
            return <RedeemedWinningForUSDInfo activity={activity} market={market} />;
        case VaultEvent.HarvestedProtocolYield:
            return <HarvestedProtocolYieldInfo activity={activity} market={market} />;
        default:
            return <div>{activity.userAddress}</div>;
    }
}

function DepositedInfo({ activity, market }: { activity: Activity; market: Market }) {
    const info = eventInfoFromDb(activity.info) as DepositedEvent;
    return (
        <div className="text-xs">
            Deposited {formatUnits(info.amount, UNDERYLING_DECIMALS)} {info.isYes ? market.outcomes[0] : market.outcomes[1]}
        </div>
    );
}

function WithdrawnInfo({ activity, market }: { activity: Activity; market: Market }) {
    const info = eventInfoFromDb(activity.info) as WithdrawnEvent;
    return (
        <div className="text-xs">
            Withdrew {formatUnits(info.yesAmount, UNDERYLING_DECIMALS)} {market.outcomes[0]} and {formatUnits(info.noAmount, UNDERYLING_DECIMALS)}{' '}
            {market.outcomes[1]}
        </div>
    );
}

function MarketFinalizedInfo({ activity, market }: { activity: Activity; market: Market }) {
    const info = eventInfoFromDb(activity.info) as MarketFinalizedEvent;
    return <div className="text-xs">Market Finalized to {winningPositionToString(info.winningPosition, market).toUpperCase()}</div>;
}

function YieldUnlockStartedInfo({ activity, market }: { activity: Activity; market: Market }) {
    return <div className="text-xs">Yield Unlock Started</div>;
}

function YieldUnlockProgressInfo({ activity, market }: { activity: Activity; market: Market }) {
    const info = eventInfoFromDb(activity.info) as YieldUnlockProgressEvent;
    return (
        <div className="text-xs">
            Yield Unlock Progress: ${formatUnits(info.cumulativeWithdrawn, UNDERYLING_DECIMALS)} of $
            {formatUnits(info.remainingInStrategy, UNDERYLING_DECIMALS)} withdrawn
        </div>
    );
}

function YieldUnlockedInfo({ activity, market }: { activity: Activity; market: Market }) {
    const info = eventInfoFromDb(activity.info) as YieldUnlockedEvent;
    return (
        <div className="text-xs">
            Yield Unlocked: ${formatUnits(info.totalWithdrawnUsd, UNDERYLING_DECIMALS)} principal and $
            {formatUnits(info.totalYield, UNDERYLING_DECIMALS)} yield
        </div>
    );
}

function HarvestedYieldInfo({ activity, market }: { activity: Activity; market: Market }) {
    const info = eventInfoFromDb(activity.info) as HarvestedYieldEvent;
    return <div className="text-xs">Harvested ${formatUnits(info.amount, UNDERYLING_DECIMALS)} yield</div>;
}

function RedeemedWinningForUSDInfo({ activity, market }: { activity: Activity; market: Market }) {
    const info = eventInfoFromDb(activity.info) as RedeemedWinningForUSDEvent;
    return <div className="text-xs">Redeemed ${formatUnits(info.usdPaid, UNDERYLING_DECIMALS)}</div>;
}

function HarvestedProtocolYieldInfo({ activity, market }: { activity: Activity; market: Market }) {
    const info = eventInfoFromDb(activity.info) as HarvestedProtocolYieldEvent;
    return <div className="text-xs">Harvested ${formatUnits(info.amount, UNDERYLING_DECIMALS)} protocol yield</div>;
}
