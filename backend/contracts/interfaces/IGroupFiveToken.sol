// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface IGroupFiveToken {
    function mint(address to, uint256 amount) external;

    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    function grantRole(bytes32 role, address account) external;
}
