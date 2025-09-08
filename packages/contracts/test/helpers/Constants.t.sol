// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { RobinStakingVault } from '../../src/RobinStakingVault.sol';

abstract contract Constants {
    struct BettingMarketInfo {
        bytes32 conditionId;
        uint256 yesPositionId;
        uint256 noPositionId;
        RobinStakingVault.WinningPosition winningPosition;
        bool negRisk;
        address collateral;
        string slug;
    }

    address internal constant UNDERLYING_USD = address(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174); // e.g., USDC on Polygon
    address internal constant WCOL = address(0x3A3BD7bb9528E159577F7C2e685CC81A765002E2); // WCOL on Polygon
    address internal constant NEG_RISK_ADAPTER = address(0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296); // Polymarket WCOL adapter
    address internal constant AAVE_POOL = address(0x794a61358D6845594F94dc1DB02A252b5b4814aD); // Aave v3 Pool
    address internal constant DATA_PROVIDER = address(0x14496b405D62c24F91f04Cda1c69Dc526D56fDE5); // Aave v3 ProtocolDataProvider-like
    address internal constant CTF = address(0x4D97DCd97eC945f40cF65F87097ACe5EA0476045); // Polymarket CTF
    address internal constant USDC_WHALE = CTF;

    uint256 constant PROTOCOL_FEE_BPS = 1000;

    BettingMarketInfo internal resolvedMarket = BettingMarketInfo({
        slug: 'what-will-trump-say-during-events-with-polish-president-on-september-3',
        conditionId: bytes32(0xaab02139315db94c3eadc03d846432500a8c247f0e13553e8cbc46bc59cf2338),
        yesPositionId: 84177889493814827752048113132929065253932784708123699844884859860864739198441,
        noPositionId: 8421620629043347250979721875320061590510585209845808126965481249038797546560,
        winningPosition: RobinStakingVault.WinningPosition.NO,
        negRisk: false,
        collateral: UNDERLYING_USD
    });

    BettingMarketInfo internal resolvedNegRiskMarket = BettingMarketInfo({
        slug: 'golden-lion-2025-winner', //father-mother-sister-brother
        conditionId: bytes32(0x92c26cb6d2a6f5044040c38cc7d1662339b26570b9ff3d984599eadda1315780),
        yesPositionId: 103306951930268658448774978679962063472511045246347594041010803592626050310864,
        noPositionId: 38857608965718404405359738602509975769823110055188690843037274362076932890539,
        winningPosition: RobinStakingVault.WinningPosition.YES,
        negRisk: true,
        collateral: WCOL
    });

    BettingMarketInfo internal runningMarket = BettingMarketInfo({
        slug: 'super-bowl-champion-2026-731',
        conditionId: bytes32(0xc319ae3e39f6a0b441fd02d37058ee8af4133967a205c88c9243972deceddbee),
        yesPositionId: 42334954850219754195241248003172889699504912694714162671145392673031415571339,
        noPositionId: 36712164784060438704997454837621402414428053497881693129968518217985319932773,
        winningPosition: RobinStakingVault.WinningPosition.UNRESOLVED, //irrelevant for running market
        negRisk: true,
        collateral: WCOL
    });
}
