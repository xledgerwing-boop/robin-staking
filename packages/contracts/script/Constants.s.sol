// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

abstract contract Constants {
    uint256 constant PROTOCOL_FEE_BPS = 100;
    // Addresses (Polygon mainnet)
    address constant UNDERLYING_USD = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // USDC
    address constant WCOL = 0x3A3BD7bb9528E159577F7C2e685CC81A765002E2; // WCOL on Polygon
    address constant CONDITIONAL_TOKENS = 0x4D97DCd97eC945f40cF65F87097ACe5EA0476045; // Polymarket CTF
    address constant AAVE_V3_POOL = 0x794a61358D6845594F94dc1DB02A252b5b4814aD; // Aave v3 Pool
    address constant AAVE_DATA_PROVIDER = 0x14496b405D62c24F91f04Cda1c69Dc526D56fDE5; // Aave v3 Data Provider
    address constant NEG_RISK_ADAPTER = 0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296;
}

abstract contract ChangeConstants {
    address public constant MANAGER_PROXY = address(0);
    uint256 public constant NEW_PROTOCOL_FEE_BPS = type(uint256).max; // use <= 10000; set to max to skip
    address public constant NEW_UNDERLYING_USD = address(0);
    address public constant NEW_WCOL = address(0);
    address public constant NEW_CTF = address(0);
    address public constant NEW_NEG_RISK_ADAPTER = address(0);
    address public constant NEW_AAVE_POOL = address(0);
    address public constant NEW_AAVE_DATA_PROVIDER = address(0);
}
