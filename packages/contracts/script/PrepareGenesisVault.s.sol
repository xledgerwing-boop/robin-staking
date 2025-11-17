// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import { Constants } from './Constants.s.sol';
import { RobinGenesisVault } from '../src/RobinGenesisVault.sol';

contract PrepareGenesisVault is Script, Constants {
    struct MarketDef {
        bytes32 conditionId;
        uint256 priceA;
        bool extraEligible;
        address collateral;
        string slug;
    }

    function run() external {
        address vaultAddr = 0xA09aBbe3e0d130D1Bc07A8d52Bad32933bBC8AA5;
        uint256 baseRewardPool = 1_000_000;
        uint256 campaignDuration = 1 hours;

        RobinGenesisVault vault = RobinGenesisVault(vaultAddr);

        // Define markets to add (example list; replace with your actual list)
        MarketDef[] memory markets = new MarketDef[](4);
        markets[0] = MarketDef({
            conditionId: 0x777c48a36a064675a0a95112c12f54cda0b1caf9a64f7450fde31a8a8212af5a,
            priceA: 830_000,
            extraEligible: false,
            collateral: WCOL,
            slug: ''
        });
        markets[1] = MarketDef({
            conditionId: 0xbea5d5174cb5355eaf0f8cee780e67d0b22a6ff614ef7ec82cc2fe6ce8f4b111,
            priceA: 195_000,
            extraEligible: false,
            collateral: UNDERLYING_USD,
            slug: ''
        });
        markets[2] = MarketDef({
            conditionId: 0x0f4dfe035668cd6ad279370a02f50915b63046d2568574aa5e3df969424948e0,
            priceA: 640_000,
            extraEligible: false,
            collateral: UNDERLYING_USD,
            slug: ''
        });
        markets[3] = MarketDef({
            conditionId: 0x84f8b70331323c2fba97d7ceaa9a35fb645a0770d0dbff169d07f24f376766e9,
            priceA: 515_000,
            extraEligible: false,
            collateral: UNDERLYING_USD,
            slug: ''
        });

        // MarketDef[] memory markets2 = new MarketDef[](49);
        // markets2[0] = MarketDef({
        //     conditionId: 0x7ad403c3508f8e3912940fd1a913f227591145ca0614074208e0b962d5fcc422,
        //     priceA: 285000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-jd-vance-win-the-2028-us-presidential-election'
        // });
        // markets2[1] = MarketDef({
        //     conditionId: 0x4567b275e6b667a6217f5cb4f06a797d3a1eaf1d0281fb5bc8c75e2046ae7e57,
        //     priceA: 185000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-gavin-newsom-win-the-2028-us-presidential-election'
        // });
        // markets2[2] = MarketDef({
        //     conditionId: 0xf232b565995e4b3a3e7fa6cef775eeff1cecd20ad7c013cb9fc8dadabfe279a9,
        //     priceA: 85000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-alexandria-ocasio-cortez-win-the-2028-us-presidential-election'
        // });
        // markets2[3] = MarketDef({
        //     conditionId: 0xce9a5fa30fe74e323b4a8f15afbb0b7a41a537aa880779ddf7dee22223b2f34a,
        //     priceA: 45000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-donald-trump-win-the-2028-us-presidential-election'
        // });
        // markets2[4] = MarketDef({
        //     conditionId: 0x2053d8515f1b8cbeea4ccdb56e60e89c2617e43a8660d95166b8e71d27865277,
        //     priceA: 38000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-marco-rubio-win-the-2028-us-presidential-election'
        // });
        // markets2[5] = MarketDef({
        //     conditionId: 0x18b1c135d0a40c5894da9412e77311827d9caf16cf4cd6591b247a34730af919,
        //     priceA: 565000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-jd-vance-win-the-2028-republican-presidential-nomination'
        // });
        // markets2[6] = MarketDef({
        //     conditionId: 0x21ad31a46bfaa51650766eff6dc69c866959e32d965ffb116020e37694b6317d,
        //     priceA: 78000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-marco-rubio-win-the-2028-republican-presidential-nomination'
        // });
        // markets2[7] = MarketDef({
        //     conditionId: 0x17902b9490c6a73152772316b4705935c5c6801ba269f2afc81686532e34fb9a,
        //     priceA: 39500,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-marjorie-taylor-greene-win-the-2028-republican-presidential-nomination'
        // });
        // markets2[8] = MarketDef({
        //     conditionId: 0x895e01dbf3e6a33cd9a44ca0f8cdb5df1bd2b0b6ebed5300d28f8da7145145e4,
        //     priceA: 35500,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-donald-trump-win-the-2028-republican-presidential-nomination'
        // });
        // markets2[9] = MarketDef({
        //     conditionId: 0x4273517fc8141d57ad1528ede46efdceebdb6a4da746d5de5bad216564209a1e,
        //     priceA: 31000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-tucker-carlson-win-the-2028-republican-presidential-nomination'
        // });
        // markets2[10] = MarketDef({
        //     conditionId: 0x0f49db97f71c68b1e42a6d16e3de93d85dbf7d4148e3f018eb79e88554be9f75,
        //     priceA: 370000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-gavin-newsom-win-the-2028-democratic-presidential-nomination-568'
        // });
        // markets2[11] = MarketDef({
        //     conditionId: 0xe6bcc2f1dd025ce5e1833190f7c60a71171c94f805df55b9ab0ded695ec93565,
        //     priceA: 115000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-alexandria-ocasio-cortez-win-the-2028-democratic-presidential-nomination-653'
        // });
        // markets2[12] = MarketDef({
        //     conditionId: 0x4c325469d9b516ef4e6b8f73a81a12607dec075e3c2fd454f91765aaeafc4760,
        //     priceA: 45000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-pete-buttigieg-win-the-2028-democratic-presidential-nomination-687'
        // });
        // markets2[13] = MarketDef({
        //     conditionId: 0x909659c9436228e2be56d5582ba6188166f2f8bf3c596335512c8f2e380d01ec,
        //     priceA: 45000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-kamala-harris-win-the-2028-democratic-presidential-nomination-641'
        // });
        // markets2[14] = MarketDef({
        //     conditionId: 0xd65891729ce093cc12236856837eba1a0872fc7998fd4294c21346f7db68079c,
        //     priceA: 36000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-josh-shapiro-win-the-2028-democratic-presidential-nomination-977'
        // });
        // markets2[15] = MarketDef({
        //     conditionId: 0xb106a3c9d1c59ed8117493dae6459a3ff79369a8f7cddaf62f4a05828b89195e,
        //     priceA: 535000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-the-democrats-win-the-2028-us-presidential-election'
        // });
        // markets2[16] = MarketDef({
        //     conditionId: 0x0a99479228e93524b25676ae69b94bd3f4278a6bca8d8c265c84d24755399cf5,
        //     priceA: 465000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-the-republicans-win-the-2028-us-presidential-election'
        // });
        // markets2[17] = MarketDef({
        //     conditionId: 0x16c63b7cc37f012b9f59ee164ec03877914c701d06d48291ae8d6fc08a088b0d,
        //     priceA: 315000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: '2026-balance-of-power-d-senate-d-house-949'
        // });
        // markets2[18] = MarketDef({
        //     conditionId: 0x0808de4f0cfd47947f2d1be51f9a9c52ea0fec76f73a75cfbe79ddec98d8a908,
        //     priceA: 15500,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: '2026-balance-of-power-d-senate-r-house-692'
        // });
        // markets2[19] = MarketDef({
        //     conditionId: 0x998bc71817b2d76921d1999ce0f3431cfd5945583667a371280ca2b430b0c06e,
        //     priceA: 435000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: '2026-balance-of-power-r-senate-d-house-444'
        // });
        // markets2[20] = MarketDef({
        //     conditionId: 0xc5eae79d1ffe716572353962eb926b1e3964c500a4880a7a94f58408218ee76b,
        //     priceA: 235000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: '2026-balance-of-power-r-senate-r-house-537'
        // });
        // markets2[21] = MarketDef({
        //     conditionId: 0x7987a821b8032824f1805ee39eb5dfb8f64603e4e9e673259eb76f82b439fd3d,
        //     priceA: 3000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: '2026-balance-of-power-other-131'
        // });
        // markets2[22] = MarketDef({
        //     conditionId: 0x86bfb53af7250a40928975c551d12c185b762fa4ce0b40c6a64a50c946d72587,
        //     priceA: 665000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-the-republican-party-control-the-senate-after-the-2026-midterm-elections'
        // });
        // markets2[23] = MarketDef({
        //     conditionId: 0x307a1ed89d60b61002dd5bbf00e1408c5ed2ab3fcdb056191ca7ef9bc34d38f3,
        //     priceA: 335000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-the-democratic-party-control-the-senate-after-the-2026-midterm-elections'
        // });
        // markets2[24] = MarketDef({
        //     conditionId: 0xd5d9fc47718bd553592d126b1fa5e87183d27f3936975b0c04cc0f2dec1f1bb4,
        //     priceA: 705000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-the-democratic-party-control-the-house-after-the-2026-midterm-elections'
        // });
        // markets2[25] = MarketDef({
        //     conditionId: 0x4e4f77e7dbf4cab666e9a1943674d7ae66348e862df03ea6f44b11eb95731928,
        //     priceA: 295000,
        //     extraEligible: true,
        //     collateral: WCOL,
        //     slug: 'will-the-republican-party-control-the-house-after-the-2026-midterm-elections'
        // });
        // markets2[26] = MarketDef({
        //     conditionId: 0x14501df0ca5ec395792b0614b18133b72e702a9a2615dd0a4b3f0c6e097de081,
        //     priceA: 130000,
        //     extraEligible: true,
        //     collateral: UNDERLYING_USD,
        //     slug: 'erdoan-out-before-2027'
        // });
        // markets2[27] = MarketDef({
        //     conditionId: 0x51f624dbbf14f9edb575fef1be6f7a303751de70783fa144fce27b957452c803,
        //     priceA: 335000,
        //     extraEligible: true,
        //     collateral: UNDERLYING_USD,
        //     slug: 'zelenskyy-out-as-ukraine-president-before-2027'
        // });
        // markets2[28] = MarketDef({
        //     conditionId: 0xd1796c09d0d6f876f8580086ae9808ec991784e3a74b25a1830a25de71a78c96,
        //     priceA: 565000,
        //     extraEligible: true,
        //     collateral: UNDERLYING_USD,
        //     slug: 'netanyahu-out-before-2027'
        // });
        // markets2[29] = MarketDef({
        //     conditionId: 0xa467b14d51f01b957109d9cbb1d6c124fab2a089d52ed8f471d23c2812e743b7,
        //     priceA: 125000,
        //     extraEligible: true,
        //     collateral: UNDERLYING_USD,
        //     slug: 'xi-jinping-out-before-2027'
        // });
        // markets2[30] = MarketDef({
        //     conditionId: 0x6bd56627aa21311850825edb27e53434a0e17a4f782be0086bc07f71eee00d0d,
        //     priceA: 155000,
        //     extraEligible: true,
        //     collateral: UNDERLYING_USD,
        //     slug: 'putin-out-before-2027'
        // });
        // markets2[31] = MarketDef({
        //     conditionId: 0x8ee2f1640386310eb5e7ffa596ba9335f2d324e303d21b0dfea6998874445791,
        //     priceA: 45000,
        //     extraEligible: false,
        //     collateral: UNDERLYING_USD,
        //     slug: 'russia-x-ukraine-ceasefire-in-2025'
        // });
        // markets2[32] = MarketDef({
        //     conditionId: 0xd407fc7bc044a509b1eb3059d8a85af5493425d9edb677781dcc7a98c1554adb,
        //     priceA: 135000,
        //     extraEligible: false,
        //     collateral: WCOL,
        //     slug: 'will-the-philadelphia-eagles-win-super-bowl-2026'
        // });
        // markets2[33] = MarketDef({
        //     conditionId: 0x2b57ed983eb34b5e081fc8dcc1372d688963fd4d9c9018b8d2ba36867b26b236,
        //     priceA: 113500,
        //     extraEligible: false,
        //     collateral: WCOL,
        //     slug: 'will-the-los-angeles-rams-win-super-bowl-2026'
        // });
        // markets2[34] = MarketDef({
        //     conditionId: 0x39d45b454dcf932767962ad9cbd858c5a6ec21d4d48318a484775b2e83264467,
        //     priceA: 95000,
        //     extraEligible: false,
        //     collateral: WCOL,
        //     slug: 'will-the-buffalo-bills-win-super-bowl-2026'
        // });
        // markets2[35] = MarketDef({
        //     conditionId: 0x1d395b8dea9dd429fbce85f8b8cbd5aa85ec8a2e8980755756be3eec03da5b9a,
        //     priceA: 85000,
        //     extraEligible: false,
        //     collateral: WCOL,
        //     slug: 'will-the-kansas-city-chiefs-win-super-bowl-2026'
        // });
        // markets2[36] = MarketDef({
        //     conditionId: 0x918ad84643db0f17ffc10e46b5f5088f2cb775bf2162c7462f23ae212c3166cd,
        //     priceA: 77500,
        //     extraEligible: false,
        //     collateral: WCOL,
        //     slug: 'will-the-detroit-lions-win-super-bowl-2026'
        // });
        // markets2[37] = MarketDef({
        //     conditionId: 0x6903b766f5fda3d5b02f4472a6b4154419e78b7fd126c0b29ce17bb8e20b20cc,
        //     priceA: 20500,
        //     extraEligible: false,
        //     collateral: WCOL,
        //     slug: 'fed-decreases-interest-rates-by-50-bps-after-december-2025-meeting'
        // });
        // markets2[38] = MarketDef({
        //     conditionId: 0xcb111226a8271fed0c71bb5ec1bd67b2a4fd72f1eb08466e2180b9efa99d3f32,
        //     priceA: 445000,
        //     extraEligible: false,
        //     collateral: WCOL,
        //     slug: 'fed-decreases-interest-rates-by-25-bps-after-december-2025-meeting'
        // });
        // markets2[39] = MarketDef({
        //     conditionId: 0x58f4542341fcc66a2197877b7487ebe901b689ec42bcdbb0a070f5536d91459e,
        //     priceA: 525000,
        //     extraEligible: false,
        //     collateral: WCOL,
        //     slug: 'no-change-in-fed-interest-rates-after-december-2025-meeting'
        // });
        // markets2[40] = MarketDef({
        //     conditionId: 0xfcd2fb666c5a346faee448e63267346a3ec394a52bce4c199877559da91cd2c1,
        //     priceA: 5500,
        //     extraEligible: false,
        //     collateral: WCOL,
        //     slug: 'fed-increases-interest-rates-by-25-bps-after-december-2025-meeting'
        // });
        // markets2[41] = MarketDef({
        //     conditionId: 0x62b0cd598091a179147acbd4616400f804acfdff6f76f029944b481b37cbd45f,
        //     priceA: 365000,
        //     extraEligible: false,
        //     collateral: UNDERLYING_USD,
        //     slug: 'us-x-venezuela-military-engagement-by-december-31-391-819-722-945-174-285-817-971-353'
        // });
        // markets2[42] = MarketDef({
        //     conditionId: 0xba1d8294981a89bc42520fe65c234684a64a6643fea82de99cac50b869f286e3,
        //     priceA: 885000,
        //     extraEligible: false,
        //     collateral: UNDERLYING_USD,
        //     slug: 'will-gemini-3pt0-be-released-by-november-22-442'
        // });
        // markets2[43] = MarketDef({
        //     conditionId: 0x4e576390d1e1279fbefde42d24d192817787bd57ed1f3245a780dcf9894f6976,
        //     priceA: 945000,
        //     extraEligible: false,
        //     collateral: UNDERLYING_USD,
        //     slug: 'will-gemini-3pt0-be-released-by-november-30-643-555'
        // });
        // markets2[44] = MarketDef({
        //     conditionId: 0x9fd256d11b5ccaf11bfc213e2c01cb5b5d7cfc090bf9ff102d429897d590c076,
        //     priceA: 985500,
        //     extraEligible: false,
        //     collateral: UNDERLYING_USD,
        //     slug: 'will-gemini-3pt0-be-released-by-december-31-311'
        // });
        // markets2[45] = MarketDef({
        //     conditionId: 0x8ee2f1640386310eb5e7ffa596ba9335f2d324e303d21b0dfea6998874445791,
        //     priceA: 45000,
        //     extraEligible: false,
        //     collateral: UNDERLYING_USD,
        //     slug: 'russia-x-ukraine-ceasefire-in-2025'
        // });
        // markets2[46] = MarketDef({
        //     conditionId: 0xa953bea944d7264285c0a2cc1f92809a7d9db78138b1c3de9cc23d8917f14d6a,
        //     priceA: 37000,
        //     extraEligible: false,
        //     collateral: UNDERLYING_USD,
        //     slug: 'maduro-out-by-november-30-2025'
        // });
        // markets2[47] = MarketDef({
        //     conditionId: 0xafc235557ace53ff0b0d2e93392314a7c3f3daab26a79050e985c11282f66df7,
        //     priceA: 145000,
        //     extraEligible: false,
        //     collateral: UNDERLYING_USD,
        //     slug: 'maduro-out-in-2025-411'
        // });
        // markets2[48] = MarketDef({
        //     conditionId: 0x18d8c59309811ce5618ea941f9bde2a96afa5d876a69c42fba2da4bcc56d3c5e,
        //     priceA: 325000,
        //     extraEligible: false,
        //     collateral: UNDERLYING_USD,
        //     slug: 'maduro-out-by-march-31-2026'
        // });

        vm.startBroadcast();

        uint256[] memory prices = new uint256[](markets.length);
        for (uint256 i = 0; i < markets.length; i++) {
            vault.addMarket(markets[i].conditionId, markets[i].priceA, markets[i].extraEligible, markets[i].collateral);
            prices[i] = markets[i].priceA;
            console2.log('Market added idx=', i);
            console2.log('priceA=', markets[i].priceA);
            console2.log('eligible=', markets[i].extraEligible);
        }

        // Push prices to sync totals
        vault.batchUpdatePrices(prices);
        console2.log('Initial prices pushed');

        // Fund base reward and start
        IERC20 usdc = IERC20(UNDERLYING_USD);
        bool ok = usdc.approve(address(vault), baseRewardPool);
        require(ok, 'USDC approve failed');
        vault.startCampaign(baseRewardPool, campaignDuration);
        console2.log('Campaign started. Base=%s, Duration=%s seconds', baseRewardPool, campaignDuration);

        vm.stopBroadcast();
    }
}
