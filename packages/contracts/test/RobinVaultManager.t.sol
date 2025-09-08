// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test } from 'forge-std/Test.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { UnsafeUpgrades } from 'openzeppelin-foundry-upgrades/Upgrades.sol';

import { RobinVaultManager } from '../src/RobinVaultManager.sol';
import { MockRobinVaultManager } from './mocks/MockRobinVaultManager.sol';
import { RobinStakingVault } from '../src/RobinStakingVault.sol';
import { MockVaultForManager } from './mocks/MockVaultForManager.sol';
import { IPolymarketAaveStakingVault } from '../src/interfaces/IPolymarketAaveStakingVault.sol';
import { IConditionalTokens } from '../src/interfaces/IConditionalTokens.sol';

import { Constants } from './helpers/Constants.t.sol';
import { ForkFixture } from './helpers/ForkFixture.t.sol';

contract RobinVaultManagerTest is Test, ForkFixture, Constants {
    // Fork at a recent block to ensure constants are valid
    uint256 internal constant FORK_BLOCK = 76163124;

    MockRobinVaultManager internal manager;
    MockVaultForManager internal vaultImpl;

    address internal owner;
    address internal alice;
    address internal bob;
    address internal carol;
    address internal treasury;

    // convenience handles
    IERC20 internal usdc;
    IConditionalTokens internal ctf;

    function setUp() public {
        _selectPolygonFork(FORK_BLOCK);

        // labeled actors
        owner = makeAddr('owner');
        alice = makeAddr('alice');
        bob = makeAddr('bob');
        carol = makeAddr('carol');
        treasury = makeAddr('treasury');
        vm.label(owner, 'owner');
        vm.label(alice, 'alice');
        vm.label(bob, 'bob');
        vm.label(carol, 'carol');
        vm.label(treasury, 'treasury');

        // fund users with some native for gas and USDC for later protocol fee tests
        vm.deal(owner, 100 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);
        vm.deal(treasury, 100 ether);

        usdc = IERC20(UNDERLYING_USD);
        ctf = IConditionalTokens(CTF);

        // Fund manager owner with USDC from a known whale (here we reuse CTF as in Constants)
        vm.startPrank(USDC_WHALE);
        bool success = usdc.transfer(owner, 5_000_000_000); // 5,000 USDC
        assertTrue(success);
        vm.stopPrank();

        // Deploy the implementation that clones will point to
        vaultImpl = new MockVaultForManager();

        // Deploy the UUPS proxy for the manager using OZ upgrades helper (UnsafeUpgrades only for tests)
        // This deploys the manager implementation, the proxy, then calls initialize on the proxy.
        vm.startPrank(owner);
        bytes memory initData = abi.encodeCall(
            RobinVaultManager.initialize,
            (address(vaultImpl), PROTOCOL_FEE_BPS, UNDERLYING_USD, WCOL, CTF, NEG_RISK_ADAPTER, AAVE_POOL, DATA_PROVIDER)
        );
        address implementation = address(new MockRobinVaultManager());
        manager = MockRobinVaultManager(UnsafeUpgrades.deployUUPSProxy(implementation, initData)); //UnsafeUpgrades only for tests
        vm.stopPrank();

        // Approvals
        vm.startPrank(alice);
        ctf.setApprovalForAll(address(manager), true);
        vm.stopPrank();
        vm.startPrank(bob);
        ctf.setApprovalForAll(address(manager), true);
        vm.stopPrank();
        vm.startPrank(carol);
        ctf.setApprovalForAll(address(manager), true);
        vm.stopPrank();
    }

    // ========== 1.1 Creation & config ==========

    function test_Manager_Initial_Config_Getters() public view {
        // read public storage vars
        assertEq(manager.implementation(), address(vaultImpl));
        assertEq(manager.protocolFeeBps(), PROTOCOL_FEE_BPS);
        assertEq(manager.underlyingUsd(), UNDERLYING_USD);
        assertEq(manager.polymarketWcol(), WCOL);
        assertEq(manager.ctf(), CTF);
        assertEq(manager.negRiskAdapter(), NEG_RISK_ADAPTER);
        assertEq(manager.aavePool(), AAVE_POOL);
        assertEq(manager.aaveDataProv(), DATA_PROVIDER);
    }

    function test_Manager_Config_Setters_And_Events() public {
        address newImpl = address(new MockVaultForManager());
        uint256 newFee = 1234;
        address newUsd = alice; // just an address for test; function guards prevent zero
        address newWcol = bob;
        address newCtf = carol;
        address newNegRisk = treasury;
        address newPool = address(0x9999);
        address newDp = address(0x8888);

        vm.startPrank(owner);
        // setImplementation emits with old config values except implementation
        vm.expectEmit(true, true, true, true);
        emit RobinVaultManager.ConfigUpdated(newImpl, PROTOCOL_FEE_BPS, UNDERLYING_USD, WCOL, CTF, NEG_RISK_ADAPTER, AAVE_POOL, DATA_PROVIDER);
        manager.setImplementation(newImpl);

        // setProtocolFeeBps
        vm.expectEmit(true, true, true, true);
        emit RobinVaultManager.ConfigUpdated(newImpl, newFee, UNDERLYING_USD, WCOL, CTF, NEG_RISK_ADAPTER, AAVE_POOL, DATA_PROVIDER);
        manager.setProtocolFeeBps(newFee);

        // setUnderlyingUsd
        vm.expectEmit(true, true, true, true);
        emit RobinVaultManager.ConfigUpdated(newImpl, newFee, newUsd, WCOL, CTF, NEG_RISK_ADAPTER, AAVE_POOL, DATA_PROVIDER);
        manager.setUnderlyingUsd(newUsd);

        // setPolymarketWcol
        vm.expectEmit(true, true, true, true);
        emit RobinVaultManager.ConfigUpdated(newImpl, newFee, newUsd, newWcol, CTF, NEG_RISK_ADAPTER, AAVE_POOL, DATA_PROVIDER);
        manager.setPolymarketWcol(newWcol);

        // setCtf
        vm.expectEmit(true, true, true, true);
        emit RobinVaultManager.ConfigUpdated(newImpl, newFee, newUsd, newWcol, newCtf, NEG_RISK_ADAPTER, AAVE_POOL, DATA_PROVIDER);
        manager.setCtf(newCtf);

        // setNegRiskAdapter
        vm.expectEmit(true, true, true, true);
        emit RobinVaultManager.ConfigUpdated(newImpl, newFee, newUsd, newWcol, newCtf, newNegRisk, AAVE_POOL, DATA_PROVIDER);
        manager.setNegRiskAdapter(newNegRisk);

        // setAavePool
        vm.expectEmit(true, true, true, true);
        emit RobinVaultManager.ConfigUpdated(newImpl, newFee, newUsd, newWcol, newCtf, newNegRisk, newPool, DATA_PROVIDER);
        manager.setAavePool(newPool);

        // setAaveDataProv
        vm.expectEmit(true, true, true, true);
        emit RobinVaultManager.ConfigUpdated(newImpl, newFee, newUsd, newWcol, newCtf, newNegRisk, newPool, newDp);
        manager.setAaveDataProv(newDp);
        vm.stopPrank();

        assertEq(manager.implementation(), newImpl);
        assertEq(manager.protocolFeeBps(), newFee);
        assertEq(manager.underlyingUsd(), newUsd);
        assertEq(manager.polymarketWcol(), newWcol);
        assertEq(manager.ctf(), newCtf);
        assertEq(manager.negRiskAdapter(), newNegRisk);
        assertEq(manager.aavePool(), newPool);
        assertEq(manager.aaveDataProv(), newDp);
    }

    function test_Manager_Config_Setters_Negatives() public {
        // non-owner cannot set
        vm.prank(alice);
        vm.expectRevert();
        manager.setProtocolFeeBps(1);

        // zero/invalid inputs revert with custom errors
        vm.startPrank(owner);
        // Invalid fee
        vm.expectRevert(abi.encodeWithSelector(RobinVaultManager.InvalidFee.selector, uint256(10001)));
        manager.setProtocolFeeBps(10001);

        // zero addresses on setters
        vm.expectRevert(abi.encodeWithSelector(RobinVaultManager.ZeroAddress.selector));
        manager.setImplementation(address(0));
        vm.expectRevert(abi.encodeWithSelector(RobinVaultManager.ZeroAddress.selector));
        manager.setUnderlyingUsd(address(0));
        vm.expectRevert(abi.encodeWithSelector(RobinVaultManager.ZeroAddress.selector));
        manager.setPolymarketWcol(address(0));
        vm.expectRevert(abi.encodeWithSelector(RobinVaultManager.ZeroAddress.selector));
        manager.setCtf(address(0));
        vm.expectRevert(abi.encodeWithSelector(RobinVaultManager.ZeroAddress.selector));
        manager.setNegRiskAdapter(address(0));
        vm.expectRevert(abi.encodeWithSelector(RobinVaultManager.ZeroAddress.selector));
        manager.setAavePool(address(0));
        vm.expectRevert(abi.encodeWithSelector(RobinVaultManager.ZeroAddress.selector));
        manager.setAaveDataProv(address(0));
        vm.stopPrank();
    }

    // ========== 1.2 Vault creation per condition ==========

    function test_CreateVault_Records_Registry_And_Emits() public {
        bytes32 conditionId = runningMarket.conditionId;
        bool negRisk = runningMarket.negRisk; // false in constants for resolvedMarket
        address collateral = runningMarket.collateral; // USDC

        // unknown vault address at this point; check conditionId and creator only
        vm.expectEmit(true, false, true, false);
        emit RobinVaultManager.VaultCreated(conditionId, address(0), bob);

        vm.prank(bob); // anyone can call; use bob here
        address vault = manager.createVault(conditionId, negRisk, collateral);

        // Registry returns the same vault
        assertEq(manager.vaultForConditionId(conditionId), vault);
        assertEq(manager.vaultOf(conditionId), vault);
        assertEq(manager.allVaultsLength(), 1);

        // Vault is initialized and owned by manager
        assertEq(IPolymarketAaveStakingVault(vault).owner(), address(manager));
        // Predictive address should match what was created
        address predicted = manager.predictVaultAddress(conditionId);
        assertEq(predicted, vault);
    }

    function test_CreateVault_Revert_On_Duplicate() public {
        bytes32 conditionId = runningMarket.conditionId;
        vm.prank(bob);
        manager.createVault(conditionId, runningMarket.negRisk, runningMarket.collateral);

        vm.expectRevert(abi.encodeWithSelector(RobinVaultManager.VaultExists.selector, conditionId, manager.vaultOf(conditionId)));
        vm.prank(alice);
        manager.createVault(conditionId, runningMarket.negRisk, runningMarket.collateral);
    }

    // ========== 1.3 Protocol fee claim via manager ==========

    function test_ClaimProtocolFee_Via_Manager() public {
        manager.setCheckPoolResolved(false);

        bytes32 conditionId = resolvedMarket.conditionId;
        vm.prank(alice);
        MockVaultForManager vault = MockVaultForManager(manager.createVault(conditionId, resolvedMarket.negRisk, resolvedMarket.collateral));

        // manager is owner of vault; set a pretend protocol yield and fund vault with USDC to pay it
        vm.startPrank(owner);
        // fund vault with enough USDC
        bool success = usdc.transfer(address(vault), 1_000_000);
        assertTrue(success);
        vault.finalizeMarket();
        vault.setProtocolYieldForTest(1_000_000); // 1 USDC

        // claim to treasury
        vm.expectEmit(true, true, true, true);
        emit RobinVaultManager.ProtocolFeeClaimed(conditionId, address(vault), treasury, block.timestamp);
        manager.claimProtocolFee(conditionId, treasury);

        assertEq(usdc.balanceOf(treasury), 1_000_000);

        // claiming twice should revert with AlreadyHarvested from the vault
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.AlreadyHarvested.selector));
        manager.claimProtocolFee(conditionId, treasury);
        vm.stopPrank();
    }

    function test_ClaimProtocolFee_Negatives() public {
        manager.setCheckPoolResolved(false);

        bytes32 conditionId = resolvedMarket.conditionId;
        vm.prank(bob);
        MockVaultForManager vault = MockVaultForManager(manager.createVault(conditionId, resolvedMarket.negRisk, resolvedMarket.collateral));
        vault.finalizeMarket();

        // non-owner cannot claim
        vm.prank(alice);
        vm.expectRevert();
        manager.claimProtocolFee(conditionId, treasury);

        // owner claim but no yield yet
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.NoYield.selector));
        manager.claimProtocolFee(conditionId, treasury);

        // use claimProtocolFeeFrom
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.NoYield.selector));
        manager.claimProtocolFeeFrom(address(vault), treasury);
    }

    // ========== 1.4 Manager-level pause ==========

    function test_Manager_Pause_Flows() public {
        // owner has PAUSER_ROLE by default
        vm.prank(owner);
        manager.pause();

        // createVault should revert due to whenNotPaused
        vm.expectRevert();
        manager.createVault(runningMarket.conditionId, runningMarket.negRisk, runningMarket.collateral);

        // config setters still allowed while paused (per implementation). Verify one works
        vm.prank(owner);
        manager.setProtocolFeeBps(777);
        assertEq(manager.protocolFeeBps(), 777);

        // unpause and createVault works
        vm.prank(owner);
        manager.unpause();

        vm.prank(alice);
        address v = manager.createVault(runningMarket.conditionId, runningMarket.negRisk, runningMarket.collateral);
        assertTrue(v != address(0));
    }
}
