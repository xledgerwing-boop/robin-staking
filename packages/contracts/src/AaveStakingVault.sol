// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { IPool } from '@aave-dao/aave-v3-origin/src/contracts/interfaces/IPool.sol';
import { IPoolDataProvider } from '@aave-dao/aave-v3-origin/src/contracts/interfaces/IPoolDataProvider.sol';
import { IAToken } from '@aave-dao/aave-v3-origin/src/contracts/interfaces/IAToken.sol';
import { Errors } from '@aave-dao/aave-v3-origin/src/contracts/protocol/libraries/helpers/Errors.sol';

import { RobinStakingVault } from './RobinStakingVault.sol';

/**
 * @title AaveStakingVault
 * @notice Plug-in strategy that satisfies RobinStakingVault's yield hooks using Aave v3 on Polygon.
 * @dev Keep it abstract so you can compose with your Prediction Market adapter
 */
abstract contract AaveStakingVault is RobinStakingVault {
    IPool public aavePool;
    IAToken public aToken; // interest-bearing token for underlyingUsd
    IPoolDataProvider public dataProvider;

    error InvalidUnderlyingAsset();
    error InvalidPool();
    error InvalidDataProvider();
    error UnderlyingAssetNotSupported();

    /**
     * @param _underlyingAsset address for the given underlyingUsd
     * @param _pool        Aave v3 Pool address (Polygon)
     * @param _dataProv    Aave ProtocolDataProvider-like
     */
    /// forge-lint: disable-next-line(mixed-case-function)
    function __AaveStakingVault_init(address _underlyingAsset, address _pool, address _dataProv) internal onlyInitializing {
        if (_underlyingAsset == address(0)) revert InvalidUnderlyingAsset();
        if (_pool == address(0)) revert InvalidPool();
        if (_dataProv == address(0)) revert InvalidDataProvider();

        aavePool = IPool(_pool);
        aToken = IAToken(aavePool.getReserveAToken(_underlyingAsset));
        if (address(aToken) == address(0)) revert UnderlyingAssetNotSupported();
        dataProvider = IPoolDataProvider(_dataProv);

        // Approve pool to pull unlimited underlying
        IERC20(address(underlyingUsd)).approve(_pool, type(uint256).max);
    }

    // ===================== AaveStakingVault strategy hooks =====================

    /// @dev Supply USD from this contract to the yield strategy.
    function _yieldStrategySupply(uint256 amountUsd) internal override {
        if (amountUsd == 0) return;
        try aavePool.supply(address(underlyingUsd), amountUsd, address(this), 0) {
            // success
        } catch (bytes memory revertData) {
            if (_matchesSupplyCapExceeded(revertData)) {
                revert DepositLimitExceeded(); //use error from RobinStakingVault for when vault deposit limit is reached
            }
            // bubble everything else exactly as-is
            assembly {
                revert(add(revertData, 0x20), mload(revertData))
            }
        }
        // aToken balance increases automatically (rebasing)
    }

    /// @dev Withdraw USD from the yield strategy to this contract. Returns actual withdrawn.
    function _yieldStrategyWithdraw(uint256 amountUsd) internal override returns (uint256 withdrawnUsd) {
        if (amountUsd == 0) return 0;
        // Will withdraw up to 'amountUsd' (or less if rounding/availability)
        withdrawnUsd = aavePool.withdraw(address(underlyingUsd), amountUsd, address(this));
        return withdrawnUsd;
    }

    /// @dev Withdraw as much as possible this call. Returns (success, amountWithdrawnUsd).
    function _yieldStrategyExit() internal virtual override returns (uint256 withdrawnUsd) {
        uint256 balance = _yieldStrategyBalance();
        if (balance == 0) return 0; //Aave will revert if balance is 0
        // Withdraw max: Aave treats type(uint256).max as "entire balance"
        withdrawnUsd = aavePool.withdraw(address(underlyingUsd), type(uint256).max, address(this));
        return withdrawnUsd;
    }

    /// @dev Current USD balance the strategy would pay if exited now (principal+interest), view-only.
    function _yieldStrategyBalance() internal view override returns (uint256 balanceUsd) {
        // aToken is rebasing: balanceOf(this) reflects principal + accrued interest
        return aToken.balanceOf(address(this));
    }

    /// @dev Current APY of the yield strategy, view-only. Returns BPS (1e4).
    /// @notice Uses liquidityRate (APR in ray) from the data provider.
    function _yieldStrategyCurrentApy() internal view override returns (uint256 apyBps) {
        (,,,,, uint256 liquidityRate,,,,,,) = dataProvider.getReserveData(address(underlyingUsd));
        // liquidityRate is APR in ray (1e27). Convert APR -> APY (daily comp) and output in bps.
        // APR (fraction) = liquidityRate / 1e27
        // APY ≈ (1 + APR/365) ^ 365 - 1
        // Note: dividing a ray by a scalar keeps it in ray units; do NOT use _rayDiv here.
        uint256 dailyFactorRay = RAY + (liquidityRate / 365);
        uint256 compoundedRay = _rayPow(dailyFactorRay, 365);
        if (compoundedRay <= RAY) return 0; // guard against rounding underflow
        uint256 apyRay = compoundedRay - RAY;
        // Convert APY (ray) to bps: apyBps = apyRay * 10000 / 1e27
        apyBps = (apyRay * 10_000) / RAY;
    }

    /// @notice Aave supply cap for the underlying, expressed in smallest USD units (0 = unlimited).
    /// @dev Uses DataProvider.getReserveCaps and reserve decimals to scale to smallest units.
    function _yieldStrategySupplyAndLimitUsd() internal view override returns (uint256 currentSupply, uint256 limit) {
        (, uint256 supplyCapTokens) = dataProvider.getReserveCaps(address(underlyingUsd));
        (uint256 decimals,,,,,,,,,) = dataProvider.getReserveConfigurationData(address(underlyingUsd));
        uint256 capUsd = supplyCapTokens * 10 ** decimals;

        uint256 totalATokenUsd = dataProvider.getATokenTotalSupply(address(underlyingUsd));

        return (totalATokenUsd, capUsd);
    }

    // ===================== Ray math helpers =====================
    uint256 internal constant RAY = 1e27;

    function _rayMul(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a * b) / 1e27 with rounding half-up
        return (a * b + RAY / 2) / RAY;
    }

    /// @dev Exponentiation by squaring for ray numbers: base^exp
    function _rayPow(uint256 baseRay, uint256 exp) internal pure returns (uint256) {
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

    // ===================== Helper functions =====================
    function _matchesSupplyCapExceeded(bytes memory data) private pure returns (bool) {
        if (data.length < 4) return false;
        bytes4 sel;
        assembly {
            sel := mload(add(data, 0x20))
        }
        return sel == Errors.SupplyCapExceeded.selector;
    }
}
