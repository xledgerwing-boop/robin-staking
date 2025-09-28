// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test } from 'forge-std/Test.sol';

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { RobinStakingVault } from '../src/RobinStakingVault.sol';
import { IAToken } from '@aave-dao/aave-v3-origin/src/contracts/interfaces/IAToken.sol';
import { Errors } from '@aave-dao/aave-v3-origin/src/contracts/protocol/libraries/helpers/Errors.sol';
import { MockPolyMarketAaveVault } from './mocks/MockPolyMarketAaveVault.sol';
import { Constants } from './helpers/Constants.t.sol';
import { ForkFixture } from './helpers/ForkFixture.t.sol';

contract AaveStakingVaultTest is Test, ForkFixture, Constants {
    // ===== Fill these constants before running tests =====
    // Pick a stable snapshot block so values are deterministic
    uint256 internal constant FORK_BLOCK = 76163124; // e.g., 62500000

    // Test amounts (in smallest units). Ensure decimals match UNDERLYING_USD (e.g., 6 for USDC)
    uint256 internal constant SUPPLY_AMOUNT = 1_000_000_000; // e.g., 1_000_000 = 1 USDC
    // Choose NEAR_CAP_AMOUNT so the supply would hit cap (per test logic). You must calibrate for the chosen asset/block.
    uint256 internal constant NEAR_CAP_AMOUNT = 13_200_000_000_000; // e.g., set to push past cap in one call

    // Expected readings (block-specific)
    uint256 internal constant EXPECTED_APY_BPS = 264; // e.g., 254 -> 2.54%
    uint256 internal constant APY_TOLERANCE_BPS = 10; // e.g., 10 bps tolerance
    uint256 internal constant EXPECTED_STRATEGY_SUPPLY_USD = 5_576_374_379_688; // current AToken total supply (smallest units)
    uint256 internal constant EXPECTED_STRATEGY_LIMIT_USD = 13_200_000_000_000; // supply cap (smallest units)
    // ===== End fill =====

    MockPolyMarketAaveVault internal vault;

    function setUp() public {
        _selectPolygonFork(FORK_BLOCK);
    }

    function deployVault() internal {
        require(UNDERLYING_USD != address(0), 'Fill UNDERLYING_USD');
        require(AAVE_POOL != address(0), 'Fill AAVE_POOL');
        require(DATA_PROVIDER != address(0), 'Fill DATA_PROVIDER');
        require(CTF != address(0), 'Fill CTF');
        require(runningMarket.conditionId != bytes32(0), 'Fill CONDITION_ID');

        vault = new MockPolyMarketAaveVault();
        vault.initialize(
            UNDERLYING_USD,
            AAVE_POOL,
            DATA_PROVIDER,
            0,
            CTF,
            runningMarket.conditionId,
            NEG_RISK_ADAPTER,
            runningMarket.negRisk,
            runningMarket.collateral
        );
    }

    function test_YieldStrategySupply_Works() public {
        require(SUPPLY_AMOUNT > 0, 'Fill SUPPLY_AMOUNT');
        deployVault();

        // Provide enough underlying for both internal supply calls
        deal(UNDERLYING_USD, address(vault), SUPPLY_AMOUNT * 2);

        IAToken aToken = vault.aToken();
        uint256 beforeBal = aToken.balanceOf(address(vault));
        assertEq(beforeBal, 0, 'aToken balance should be 0');

        vault.harnessSupply(SUPPLY_AMOUNT);

        uint256 afterBal = aToken.balanceOf(address(vault));
        assertApproxEqAbs(afterBal, SUPPLY_AMOUNT, 1, 'aToken balance should equal supply amount');
        assertEq(IERC20(UNDERLYING_USD).balanceOf(address(vault)), SUPPLY_AMOUNT, 'underlying balance should equal supply amount');
    }

    function test_YieldStrategySupply_RevertsWithCustomError_OnCap() public {
        require(NEAR_CAP_AMOUNT > 0, 'Fill NEAR_CAP_AMOUNT');
        deployVault();

        // Ensure vault holds enough underlying for both internal supply attempts
        deal(UNDERLYING_USD, address(vault), NEAR_CAP_AMOUNT);

        vm.expectRevert(RobinStakingVault.DepositLimitExceeded.selector);
        vault.harnessSupply(NEAR_CAP_AMOUNT);
    }

    function test_YieldStrategySupply_BubblesOtherErrors() public {
        require(SUPPLY_AMOUNT > 0, 'Fill SUPPLY_AMOUNT');
        deployVault();

        // No underlying => transferFrom should fail; ensure it is NOT mapped to custom error
        try vault.harnessSupply(SUPPLY_AMOUNT) {
            fail('Expected revert');
        } catch (bytes memory revertData) {
            bytes4 sel;
            assembly {
                sel := mload(add(revertData, 0x20))
            }
            assertTrue(sel != RobinStakingVault.DepositLimitExceeded.selector, 'should not map to custom error');
            assertTrue(sel != Errors.SupplyCapExceeded.selector, 'should not be Aave cap error');
        }
    }

    function test_CurrentApy_ReadsCorrectly() public {
        if (EXPECTED_APY_BPS == 0) {
            emit log('Skipping APY check until EXPECTED_APY_BPS is set');
            return;
        }
        deployVault();

        uint256 apyBps = vault.harnessCurrentApy();
        assertApproxEqAbs(apyBps, EXPECTED_APY_BPS, APY_TOLERANCE_BPS, 'APY mismatch');
    }

    function test_SupplyAndCap_ReadsCorrectly() public {
        if (EXPECTED_STRATEGY_SUPPLY_USD == 0 && EXPECTED_STRATEGY_LIMIT_USD == 0) {
            emit log('Skipping supply/cap check until expected constants are set');
            return;
        }
        deployVault();

        (uint256 currentSupplyUsd, uint256 capUsd) = vault.harnessSupplyAndLimitUsd();

        if (EXPECTED_STRATEGY_SUPPLY_USD > 0) {
            assertEq(currentSupplyUsd, EXPECTED_STRATEGY_SUPPLY_USD, 'strategy supply mismatch');
        }
        if (EXPECTED_STRATEGY_LIMIT_USD > 0) {
            assertEq(capUsd, EXPECTED_STRATEGY_LIMIT_USD, 'strategy cap mismatch');
        }
    }
}
