// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface ITokenSale {
    function buyTokens() external payable;

    // function approveTokenSale() external;

    function mintNft(uint256 nftId) external;
}
