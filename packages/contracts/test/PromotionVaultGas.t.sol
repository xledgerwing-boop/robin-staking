// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test } from 'forge-std/Test.sol';
import { console } from 'forge-std/console.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { IConditionalTokens } from '../src/interfaces/IConditionalTokens.sol';
import { INegRiskAdapter } from '../src/interfaces/INegRiskAdapter.sol';
import { PromotionVault } from '../src/PromotionVault.sol';
import { PromotionConstants } from './helpers/PromotionConstants.sol';
import { ForkFixture } from './helpers/ForkFixture.t.sol';

contract PromotionVaultGasTest is Test, PromotionConstants, ForkFixture {
    // actors
    address internal owner;
    address internal user;
    address internal user2;

    // tokens and polymarket
    IERC20 internal usdc;
    IConditionalTokens internal ctf;
    INegRiskAdapter internal adapter;

    // system under test
    PromotionVault internal vault;

    // config
    uint256 internal constant PRICE_SCALE = 1e6;
    uint256 internal constant HOUR = 1 hours;
    uint256 internal constant CAMPAIGN_DURATION = 60 days;
    uint256 internal constant TVL_CAP = 1_000_000_000_000_000; // large cap
    uint256 internal constant BASE_REWARD = 1_000_000_000; // 1,000 USDC
    uint256 internal constant GAS_PRICE_WEI = 86 gwei;

    uint256[] internal prices; // priceA per market

    function setUp() public {
        _selectPolygonFork(PROMOTION_FORK_BLOCK);

        owner = address(this);
        user = makeAddr('gas_user');
        user2 = makeAddr('gas_user2');
        vm.label(owner, 'owner');
        vm.label(user, 'gas_user');
        vm.label(user2, 'gas_user2');
        vm.deal(owner, 100 ether);
        vm.deal(user, 100 ether);
        vm.deal(user2, 100 ether);

        usdc = IERC20(UNDERLYING_USD);
        ctf = IConditionalTokens(CTF);
        adapter = INegRiskAdapter(NEG_RISK_ADAPTER);

        // Deploy vault
        vault = new PromotionVault(address(ctf), address(usdc), TVL_CAP);

        // Seed owner with base reward
        vm.startPrank(USDC_WHALE);
        bool success = usdc.transfer(owner, BASE_REWARD * 10); // extra buffer
        assertTrue(success);
        vm.stopPrank();

        // Prepare markets and prices
        PromotionMarketInfo[20] memory markets = getPromotionMarkets();
        prices = new uint256[](markets.length);
        for (uint256 i = 0; i < markets.length; i++) {
            // deterministic pseudo-random price between 0.15 and 0.85
            uint256 p = 150_000 + ((i * 97_531) % 700_000);
            prices[i] = p;
            vault.addMarket(markets[i].conditionId, p, markets[i].extraEligible, markets[i].collateral);
        }

        // Start campaign
        usdc.approve(address(vault), BASE_REWARD);
        vault.startCampaign(BASE_REWARD, CAMPAIGN_DURATION);
        vault.batchUpdatePrices(prices);
        // Fix gas price globally for this suite
        vm.txGasPrice(GAS_PRICE_WEI);
    }

    // ---------- Helpers ----------
    function _partitionYesNo() internal pure returns (uint256[] memory p) {
        p = new uint256[](2);
        p[0] = 1; // YES_INDEX_SET
        p[1] = 2; // NO_INDEX_SET
    }

    function _mintOutcome(address to, PromotionMarketInfo memory market, uint256 amount) internal {
        // fund user with USDC to split
        vm.startPrank(USDC_WHALE);
        bool ok = usdc.transfer(to, amount);
        assertTrue(ok);
        vm.stopPrank();

        uint256[] memory part = _partitionYesNo();
        vm.startPrank(to);
        if (market.negRisk) {
            usdc.approve(address(adapter), amount);
            adapter.splitPosition(address(usdc), bytes32(0), market.conditionId, part, amount);
        } else {
            usdc.approve(address(ctf), amount);
            ctf.splitPosition(address(usdc), bytes32(0), market.conditionId, part, amount);
        }
        vm.stopPrank();
    }

    function _randomSide(uint256 i) internal pure returns (bool) {
        // alternate Yes/No
        return (i % 2 == 0);
    }

    function _measureStart() internal returns (uint256 gasStart) {
        vm.txGasPrice(GAS_PRICE_WEI);
        return gasleft();
    }

    function _measureEnd(uint256 gasStart, string memory label) internal view {
        uint256 gasUsed = gasStart - gasleft();
        uint256 costWei = gasUsed * tx.gasprice;
        console.log(label);
        console.log('  gasUsed      : %s', gasUsed);
        console.log('  cost (wei)  : %s', costWei);
        uint256 whole = costWei / 1e18;
        uint256 frac = ((costWei % 1e18) / 1e12); // 6 decimals
        console.log(_formatPol(whole, frac));
    }

    // Format helpers for POL with 6 fractional digits and leading zeros
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return '0';
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function _pad6(uint256 frac) internal pure returns (string memory) {
        // ensure exactly 6 digits with leading zeros
        bytes memory raw = bytes(_uintToString(frac));
        if (raw.length >= 6) return string(raw);
        bytes memory out = new bytes(6);
        uint256 pad = 6 - raw.length;
        for (uint256 i = 0; i < pad; i++) {
            out[i] = '0';
        }
        for (uint256 j = 0; j < raw.length; j++) {
            out[pad + j] = raw[j];
        }
        return string(out);
    }

    function _formatPol(uint256 whole, uint256 frac) internal pure returns (string memory) {
        return string.concat('  cost (POL)  : ', _uintToString(whole), '.', _pad6(frac));
    }

    // ---------- Tests ----------

    function test_Gas_FirstTouch_Vs_Subsequent_BatchDeposit_AllMarkets() public {
        PromotionMarketInfo[20] memory markets = getPromotionMarkets();
        // approval once
        vm.prank(user);
        ctf.setApprovalForAll(address(vault), true);
        vm.prank(user2);
        ctf.setApprovalForAll(address(vault), true);

        uint256[] memory idxs = new uint256[](markets.length);
        bool[] memory sides = new bool[](markets.length);
        uint256[] memory amts = new uint256[](markets.length);

        // First touch: mint 1.0 for all markets (initializing user storage slots)
        for (uint256 i = 0; i < markets.length; i++) {
            uint256 amt = 1_000_000;
            _mintOutcome(user, markets[i], amt);
            _mintOutcome(user2, markets[i], amt);
            idxs[i] = i;
            sides[i] = _randomSide(i);
            amts[i] = amt;
        }
        uint256 gs1 = _measureStart();
        vm.prank(user);
        vault.batchDeposit(idxs, sides, amts);
        _measureEnd(gs1, 'batchDeposit first touch (all markets)');

        uint256 gs12 = _measureStart();
        vm.prank(user2);
        vault.batchDeposit(idxs, sides, amts);
        _measureEnd(gs12, 'batchDeposit first touch (all markets) for user2');

        // Subsequent: mint another 1.0 for all markets and deposit again
        for (uint256 i = 0; i < markets.length; i++) {
            uint256 amt = 1_000_000;
            _mintOutcome(user, markets[i], amt);
            amts[i] = amt;
        }
        vm.prank(user);
        uint256 gs2 = _measureStart();
        vault.batchDeposit(idxs, sides, amts);
        _measureEnd(gs2, 'batchDeposit subsequent (all markets)');
    }

    function test_Gas_BatchWithdraw_AllMarkets() public {
        PromotionMarketInfo[20] memory markets = getPromotionMarkets();
        // First deposit to all markets
        vm.prank(user);
        ctf.setApprovalForAll(address(vault), true);
        uint256[] memory idxs = new uint256[](markets.length);
        bool[] memory sides = new bool[](markets.length);
        uint256[] memory amts = new uint256[](markets.length);
        for (uint256 i = 0; i < markets.length; i++) {
            uint256 amt = 1_000_000;
            _mintOutcome(user, markets[i], amt);
            idxs[i] = i;
            sides[i] = _randomSide(i);
            amts[i] = amt;
        }
        vm.prank(user);
        vault.batchDeposit(idxs, sides, amts);

        // Measure withdraw for the same set
        vm.prank(user);
        uint256 gs = _measureStart();
        vault.batchWithdraw(idxs, sides, amts);
        _measureEnd(gs, 'batchWithdraw all markets');
    }

    function test_Gas_Deposit_SingleMarket() public {
        PromotionMarketInfo[20] memory markets = getPromotionMarkets();
        uint256 m = 0;
        uint256 amt = 2_000_000;
        _mintOutcome(user, markets[m], amt);
        vm.prank(user);
        ctf.setApprovalForAll(address(vault), true);

        vm.prank(user);
        uint256 gs = _measureStart();
        vault.deposit(m, true, amt);
        _measureEnd(gs, 'deposit single market');
    }

    function test_Gas_Withdraw_SingleMarket() public {
        PromotionMarketInfo[20] memory markets = getPromotionMarkets();
        uint256 m = 1;
        uint256 amt = 1_500_000;
        _mintOutcome(user, markets[m], amt);
        vm.prank(user);
        ctf.setApprovalForAll(address(vault), true);
        vm.prank(user);
        vault.deposit(m, false, amt);

        vm.prank(user);
        uint256 gs = _measureStart();
        vault.withdraw(m, false, amt);
        _measureEnd(gs, 'withdraw single market');
    }

    function test_Gas_Admin_UpdateAllPrices() public {
        // mutate prices deterministically
        for (uint256 i = 0; i < prices.length; i++) {
            prices[i] = 100_000 + ((i * 333_333) % 800_000);
        }
        uint256 gs = _measureStart();
        vault.batchUpdatePrices(prices);
        _measureEnd(gs, 'admin updateAllPrices');
    }

    function test_Gas_ClaimRewards_AfterFinalize_FromBatchDepositAll() public {
        PromotionMarketInfo[20] memory markets = getPromotionMarkets();
        // user batch deposits in all markets once
        vm.prank(user);
        ctf.setApprovalForAll(address(vault), true);
        uint256[] memory idxs = new uint256[](markets.length);
        bool[] memory sides = new bool[](markets.length);
        uint256[] memory amts = new uint256[](markets.length);
        for (uint256 i = 0; i < markets.length; i++) {
            uint256 amt = 1_000_000;
            _mintOutcome(user, markets[i], amt);
            idxs[i] = i;
            sides[i] = _randomSide(i);
            amts[i] = amt;
        }
        vm.prank(user);
        vault.batchDeposit(idxs, sides, amts);

        // finalize campaign
        vm.warp(vault.campaignEndTimestamp());
        vault.finalizeCampaign();

        // measure claim gas
        vm.prank(user);
        uint256 gs = _measureStart();
        vault.claimRewards();
        _measureEnd(gs, 'claim rewards after finalize (user with batch deposit)');
    }
}
