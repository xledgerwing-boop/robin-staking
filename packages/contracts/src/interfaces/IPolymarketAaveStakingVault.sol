// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IPolymarketAaveStakingVault {
    function initialize(uint256 _protocolFeeBps, address _underlying, address _ctf, bytes32 _conditionId, address _aavePool, address _aaveDataProv)
        external;

    function harvestProtocolYield(address receiver) external; // onlyOwner in the vault

    function owner() external view returns (address);

    function setDepositLimit(uint256 newLimit) external;
}
