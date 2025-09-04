// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPool} from "@aave-dao/aave-v3-origin/src/contracts/interfaces/IPool.sol";
import {IPoolDataProvider} from "@aave-dao/aave-v3-origin/src/contracts/interfaces/IPoolDataProvider.sol";
import {IAToken} from "@aave-dao/aave-v3-origin/src/contracts/interfaces/IAToken.sol";

import {RobinStakingVault} from "./RobinStakingVault.sol";

/**
 * @title AaveStakingVault
 * @notice Plug-in strategy that satisfies RobinStakingVault's yield hooks using Aave v3 on Polygon.
 * @dev Keep it abstract so you can compose with your Polymarket adapter
 */
abstract contract AaveStakingVault is RobinStakingVault {
    IPool public aavePool;
    IAToken public aToken; // interest-bearing token for underlyingUSD
    address public dataProvider; // optional; set to Aave ProtocolDataProvider if you want APY

    error InvalidUnderlyingAsset();
    error InvalidPool();
    error InvalidDataProvider();

    /**
     * @param _underlyingAsset address for the given underlyingUSD
     * @param _pool        Aave v3 Pool address (Polygon)
     * @param _dataProv    (optional) Aave ProtocolDataProvider-like; pass address(0) to skip APY
     */
    function __AaveStakingVault_init(
        address _underlyingAsset,
        address _pool,
        address _dataProv
    ) internal onlyInitializing {
        if (_underlyingAsset == address(0)) revert InvalidUnderlyingAsset();
        if (_pool == address(0)) revert InvalidPool();
        if (_dataProv == address(0)) revert InvalidDataProvider();

        aavePool = IPool(_pool);
        aToken = IAToken(aavePool.getReserveAToken(_underlyingAsset));
        dataProvider = _dataProv;

        // Approve pool to pull unlimited underlying
        IERC20(address(underlyingUSD)).approve(_pool, type(uint256).max);
    }

    // ===================== AaveStakingVault strategy hooks =====================

    /// @dev Supply USD from this contract to the yield strategy.
    function _yieldStrategySupply(uint256 amountUSD) internal override {
        if (amountUSD == 0) return;
        aavePool.supply(address(underlyingUSD), amountUSD, address(this), 0);
        // aToken balance increases automatically (rebasing)
    }

    /// @dev Withdraw USD from the yield strategy to this contract. Returns actual withdrawn.
    function _yieldStrategyWithdraw(
        uint256 amountUSD
    ) internal override returns (uint256 withdrawnUSD) {
        if (amountUSD == 0) return 0;
        // Will withdraw up to 'amountUSD' (or less if rounding/availability)
        withdrawnUSD = aavePool.withdraw(
            address(underlyingUSD),
            amountUSD,
            address(this)
        );
        return withdrawnUSD;
    }

    /// @dev Withdraw as much as possible this call. Returns (success, amountWithdrawnUSD).
    function _yieldStrategyExit()
        internal
        override
        returns (uint256 withdrawnUSD)
    {
        // Withdraw max: Aave treats type(uint256).max as "entire balance"
        withdrawnUSD = aavePool.withdraw(
            address(underlyingUSD),
            type(uint256).max,
            address(this)
        );
        return withdrawnUSD;
    }

    /// @dev Current USD balance the strategy would pay if exited now (principal+interest), view-only.
    function _yieldStrategyBalance()
        internal
        view
        override
        returns (uint256 balanceUSD)
    {
        // aToken is rebasing: balanceOf(this) reflects principal + accrued interest
        return aToken.balanceOf(address(this));
    }

    /// @dev Current APY of the yield strategy, view-only. Returns BPS (1e4).
    /// @notice Uses liquidityRate (APR in ray) from the data provider.
    function _yieldStrategyCurrentAPY()
        external
        view
        override
        returns (uint256 apyBps)
    {
        (, , , , , uint256 liquidityRate, , , , , , ) = IPoolDataProvider(
            dataProvider
        ).getReserveData(address(underlyingUSD));
        // liquidityRate is APR in ray (1e27). Convert APR -> APY (daily comp) and output in bps.
        // APR (fraction) = liquidityRate / 1e27
        // APY ≈ (1 + APR/365) ^ 365 - 1
        uint256 apyRay = _rayPow(RAY + _rayDiv(liquidityRate, 365), 365) - RAY;
        // Convert APY (ray) to bps: apyBps = apyRay * 10000 / 1e27
        apyBps = (apyRay * 10_000) / RAY;
    }

    // ===================== Ray math helpers =====================

    uint256 internal constant RAY = 1e27;

    function _rayMul(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a * b) / 1e27 with rounding half-up
        return (a * b + RAY / 2) / RAY;
    }

    function _rayDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a * 1e27) / b with rounding half-up
        return (a * RAY + b / 2) / b;
    }

    /// @dev Exponentiation by squaring for ray numbers: base^exp
    function _rayPow(
        uint256 baseRay,
        uint256 exp
    ) internal pure returns (uint256) {
        uint256 result = RAY; // 1.0 in ray
        uint256 b = baseRay;
        uint256 e = exp;
        while (e > 0) {
            if (e & 1 == 1) result = _rayMul(result, b);
            b = _rayMul(b, b);
            e >>= 1;
        }
        return result;
    }
}
