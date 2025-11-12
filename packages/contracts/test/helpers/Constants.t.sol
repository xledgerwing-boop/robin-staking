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
        address resolver;
        bytes32 questionId;
        string slug;
    }

    address internal constant UNDERLYING_USD = address(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174); // e.g., USDC on Polygon
    address internal constant WCOL = address(0x3A3BD7bb9528E159577F7C2e685CC81A765002E2); // WCOL on Polygon
    address internal constant NEG_RISK_ADAPTER = address(0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296); // Polymarket WCOL adapter
    address internal constant NEG_RISK_CTF_EXCHANGE = address(0xC5d563A36AE78145C45a50134d48A1215220f80a); // Polymarket NegRisk CTF exchange
    address internal constant CTF_EXCHANGE = address(0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E); // Polymarket CTF exchange
    address internal constant AAVE_POOL = address(0x794a61358D6845594F94dc1DB02A252b5b4814aD); // Aave v3 Pool
    address internal constant DATA_PROVIDER = address(0x14496b405D62c24F91f04Cda1c69Dc526D56fDE5); // Aave v3 ProtocolDataProvider-like
    address internal constant CTF = address(0x4D97DCd97eC945f40cF65F87097ACe5EA0476045); // Polymarket CTF
    address internal constant USDC_WHALE = CTF;
    address internal constant SAFE_PROXY_FACTORY = address(0xaacFeEa03eb1561C4e67d661e40682Bd20E3541b);

    uint256 constant PROTOCOL_FEE_BPS = 1000;
    uint256 internal constant FORK_BLOCK = 76163124;

    BettingMarketInfo internal resolvedMarket =
        BettingMarketInfo({
            slug: 'what-will-trump-say-during-events-with-polish-president-on-september-3',
            conditionId: bytes32(0xaab02139315db94c3eadc03d846432500a8c247f0e13553e8cbc46bc59cf2338),
            yesPositionId: 84177889493814827752048113132929065253932784708123699844884859860864739198441,
            noPositionId: 8421620629043347250979721875320061590510585209845808126965481249038797546560,
            winningPosition: RobinStakingVault.WinningPosition.NO,
            negRisk: false,
            collateral: UNDERLYING_USD,
            resolver: address(0),
            questionId: bytes32(0)
        });

    BettingMarketInfo internal resolvedNegRiskMarket =
        BettingMarketInfo({
            slug: 'golden-lion-2025-winner', //father-mother-sister-brother
            conditionId: bytes32(0x92c26cb6d2a6f5044040c38cc7d1662339b26570b9ff3d984599eadda1315780),
            yesPositionId: 103306951930268658448774978679962063472511045246347594041010803592626050310864,
            noPositionId: 38857608965718404405359738602509975769823110055188690843037274362076932890539,
            winningPosition: RobinStakingVault.WinningPosition.YES,
            negRisk: true,
            collateral: WCOL,
            resolver: address(0),
            questionId: bytes32(0)
        });

    BettingMarketInfo internal runningMarket =
        BettingMarketInfo({
            slug: 'super-bowl-champion-2026-731',
            conditionId: bytes32(0xc319ae3e39f6a0b441fd02d37058ee8af4133967a205c88c9243972deceddbee),
            yesPositionId: 42334954850219754195241248003172889699504912694714162671145392673031415571339,
            noPositionId: 36712164784060438704997454837621402414428053497881693129968518217985319932773,
            winningPosition: RobinStakingVault.WinningPosition.UNRESOLVED, //irrelevant for running market
            negRisk: true,
            collateral: WCOL,
            resolver: address(0x2F5e3684cb1F318ec51b00Edba38d79Ac2c0aA9d),
            questionId: bytes32(0x6a0d290c8ce1536fba41988277acb17f5ee59df82f0ce52c4565c02e37bc4d00)
        });

    BettingMarketInfo internal toBeEqualOutcomeMarket =
        BettingMarketInfo({
            slug: 'trump-out-as-president-in-2025',
            conditionId: bytes32(0xea3c3d537c0495872754400b9ab59755a932d3e2b6115e309d62ed236ee1b612),
            yesPositionId: 771091131480745826809132163593948943294877272624819871397844180591143904374,
            noPositionId: 109342148962194322677424721433862881148913445275846383703231873439210710890308,
            winningPosition: RobinStakingVault.WinningPosition.BOTH, //irrelevant for running market
            negRisk: false,
            collateral: UNDERLYING_USD,
            resolver: address(0x157Ce2d672854c848c9b79C49a8Cc6cc89176a49),
            questionId: bytes32(0x0a53960ccc651fdfaa5d777291d7bba4f76b7ede811a515cb5ff91bf1695e11d)
        });

    // ---------- Promotion vault test constants ----------
    struct PromotionMarketInfo {
        bytes32 conditionId;
        uint256 yesPositionId;
        uint256 noPositionId;
        bool extraEligible;
        bool negRisk;
        address collateral;
        string slug;
    }

    uint256 internal constant PROMOTION_FORK_BLOCK = 78926976;
    PromotionMarketInfo internal firstEligible =
        PromotionMarketInfo({
            conditionId: bytes32(0x0f49db97f71c68b1e42a6d16e3de93d85dbf7d4148e3f018eb79e88554be9f75),
            yesPositionId: 54533043819946592547517511176940999955633860128497669742211153063842200957669,
            noPositionId: 87854174148074652060467921081181402357467303721471806610111179101805869578687,
            extraEligible: true,
            negRisk: true,
            collateral: WCOL,
            slug: 'will-gavin-newsom-win-the-2028-democratic-presidential-nomination-568'
        });
    PromotionMarketInfo internal firstNonEligible =
        PromotionMarketInfo({
            conditionId: bytes32(0x8ee2f1640386310eb5e7ffa596ba9335f2d324e303d21b0dfea6998874445791),
            yesPositionId: 15974786252393396629980467963784550802583781222733347534844974829144359265969,
            noPositionId: 42351579455604873042957090441032286075880144797259231030267680078160718556927,
            extraEligible: false,
            negRisk: false,
            collateral: UNDERLYING_USD,
            slug: 'russia-x-ukraine-ceasefire-in-2025'
        });

    PromotionMarketInfo internal secondNonEligible =
        PromotionMarketInfo({
            conditionId: bytes32(0x05af636e0989accb08334a74f69e5368e0aa28fe498fd16a3ca991e6dc5ae2cc),
            yesPositionId: 11661882248425579028730127122226588074844109517532906275870117904036267401870,
            noPositionId: 61032109452954507190234229613640921045186796600337553837681909605067067778814,
            extraEligible: false,
            negRisk: true,
            collateral: WCOL,
            slug: 'will-2-fed-rate-cuts-happen-in-2025'
        });

    // PromotionMarketInfo[] internal promotionMarkets = [
    //     firstEligible,
    //     firstNonEligible,
    //     secondNonEligible,
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0xd8b9ff369452daebce1ac8cb6a29d6817903e85168356c72812317f38e317613),
    //         yesPositionId: 112540911653160777059655478391259433595972605218365763034134019729862917878641,
    //         noPositionId: 72957845969259179114974336105989648762775384471357386872640167050913336248574,
    //         extraEligible: false,
    //         negRisk: false,
    //         collateral: UNDERLYING_USD,
    //         slug: 'will-bitcoin-reach-1000000-by-december-31-2025'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0x08c8fffc2fb962e36d835621b82434b941a8a124f47558454d8eb666eeed59f9),
    //         yesPositionId: 107516807630292044096997874487388103106064958463700149740608855411786327728317,
    //         noPositionId: 24392063984627190307257767585691140245716045207914817527470093499518405056967,
    //         extraEligible: false,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-wicked-for-good-be-the-top-grossing-movie-of-2025'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0xd8fb9e7567f1d4d9cbcf9c31ea3461181fab7299d7483d019a911c6c056ad0e1),
    //         yesPositionId: 80438094594097678965318816351501632248243631678145790440985260136814389130635,
    //         noPositionId: 20460470065238694355342479102612119660444867108692975826045667264704084823317,
    //         extraEligible: false,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-lando-norris-be-the-2025-drivers-champion'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0x1d395b8dea9dd429fbce85f8b8cbd5aa85ec8a2e8980755756be3eec03da5b9a),
    //         yesPositionId: 11584273833068499329017832956188664326032555278943683999231427554688326830185,
    //         noPositionId: 53459551166014752936660975821953116185386685262626945530676156366058725390297,
    //         extraEligible: false,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-the-kansas-city-chiefs-win-super-bowl-2026'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0xaa5041ca3ea8400325d726e0fb44b85180c4d6211dea960d7a3fb4600d5d6c76),
    //         yesPositionId: 57527508293969725929016010432598810481282998125631347013024726997019637985331,
    //         noPositionId: 4589745821222679801714536143948817055789206104581183883296167003774519971663,
    //         extraEligible: false,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-jos-antonio-kast-win-the-chilean-presidential-election'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0xffcdfe69121723210a5dfa24041fce6f4b99469fc434afc99bb3ff7a270d7fb3),
    //         yesPositionId: 38542318937261713370768373938243567843770050349388714685967041824824000126702,
    //         noPositionId: 58465007764880967406704595497733164034979499062658878053853649531633348875657,
    //         extraEligible: false,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-ciprian-ciucu-be-the-next-mayor-of-bucharest'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0xf2ce8d3897ac5009a131637d3575f1f91c579bd08eecce6ae2b2da0f32bbe6f1),
    //         yesPositionId: 114304586861386186441621124384163963092522056897081085884483958561365015034812,
    //         noPositionId: 112744882674787019048577842008042029962234998947364561417955402912669471494485,
    //         extraEligible: false,
    //         negRisk: false,
    //         collateral: UNDERLYING_USD,
    //         slug: 'xi-jinping-out-in-2025'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0x22e7b5e35423e76842dd3a5e1a21d13793811080d5e7b2896d0c001bd5e97d54),
    //         yesPositionId: 49500299856831034491021962156746701298730459370557900271970866855042624695770,
    //         noPositionId: 44914465637297319816681463234953032477919413063019359633128421605039733545953,
    //         extraEligible: false,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-the-oklahoma-city-thunder-win-the-2026-nba-finals'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0x7ad403c3508f8e3912940fd1a913f227591145ca0614074208e0b962d5fcc422),
    //         yesPositionId: 16040015440196279900485035793550429453516625694844857319147506590755961451627,
    //         noPositionId: 94476829201604408463453426454480212459887267917122244941405244686637914508323,
    //         extraEligible: true,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-jd-vance-win-the-2028-us-presidential-election'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0x18b1c135d0a40c5894da9412e77311827d9caf16cf4cd6591b247a34730af919),
    //         yesPositionId: 40081275558852222228080198821361202017557872256707631666334039001378518619916,
    //         noPositionId: 78633590736077251574794513664747155551297291244492840448622550955320930591622,
    //         extraEligible: true,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-jd-vance-win-the-2028-republican-presidential-nomination'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0xd5d9fc47718bd553592d126b1fa5e87183d27f3936975b0c04cc0f2dec1f1bb4),
    //         yesPositionId: 83247781037352156539108067944461291821683755894607244160607042790356561625563,
    //         noPositionId: 33156410999665902694791064431724433042010245771106314074312009703157423879038,
    //         extraEligible: true,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-the-democratic-party-control-the-house-after-the-2026-midterm-elections'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0x8df5a4256840dee05851250c0490da7593597faff3a7f9a156ccbbda7fec76f8),
    //         yesPositionId: 76184513907290761912636659055080401703643418316153242056949287928791438454394,
    //         noPositionId: 40207448075213637709805668474726325753733020974923638056549809058860608450985,
    //         extraEligible: false,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-arsenal-win-the-202526-champions-league'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0xcba24842ceac7a40d2a8b9adde1f4407999b6505193b9fd68156ae76fbffa706),
    //         yesPositionId: 71634047218945647363395171891674404459556716906851450020664198669471161667814,
    //         noPositionId: 110702402419434606997240498590139657923776420245193392095489394526960556962226,
    //         extraEligible: false,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-arsenal-win-the-202526-english-premier-league'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0x6903b766f5fda3d5b02f4472a6b4154419e78b7fd126c0b29ce17bb8e20b20cc),
    //         yesPositionId: 74018646712472971445258547247048869505144598783748525202442089895996249694683,
    //         noPositionId: 21489772516410038586556744342392982044189999368638682594741395650226594484811,
    //         extraEligible: false,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'fed-decreases-interest-rates-by-50-bps-after-december-2025-meeting'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0xc837ff11818d6271645b7af1f0a984b3bdf16d0f6dc24eaa6a287dc8b696ff22),
    //         yesPositionId: 87465994109109230689755920239997642064510123799777585030369776561210565990316,
    //         noPositionId: 1964307014191467955381881535589646795852045131352239138442813025218441330703,
    //         extraEligible: false,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-sam-soverel-win-the-2025-national-heads-up-poker-championship'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0xfe8911cbf25e9e359396faf1c0fcd31a9f2a3c3bb35d299e83f1cd200063cf34),
    //         yesPositionId: 90554604925549679441302051030677964177792034527604913227687950640465230372217,
    //         noPositionId: 76075952955566711408313096825347524981701914077987481813797868934320564431506,
    //         extraEligible: false,
    //         negRisk: false,
    //         collateral: UNDERLYING_USD,
    //         slug: 'will-ethereum-hit-17000-by-december-31'
    //     }),
    //     PromotionMarketInfo({
    //         conditionId: bytes32(0x55a469ea12fc89bf6b12c38fc764e35c05b4b520485adf4c8716d6369b38ad8a),
    //         yesPositionId: 7045107161367241233811523851106536676632348173555291268726302515224841822187,
    //         noPositionId: 11828276974295999282054898543853393297431941262132325975885109999438587110416,
    //         extraEligible: false,
    //         negRisk: true,
    //         collateral: WCOL,
    //         slug: 'will-the-government-shutdown-end-november-12-15'
    //     })
    // ];
}
