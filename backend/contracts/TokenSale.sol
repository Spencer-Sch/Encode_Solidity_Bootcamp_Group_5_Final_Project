// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/access/Ownable.sol';
import './GroupFiveToken.sol';
import './GroupFiveCollection.sol';
import './interfaces/IGroupFiveToken.sol';
import './interfaces/IGroupFiveCollection.sol';

error TokenSale__NftPaymentTransferFailed();
error TokenSale__WithdrawTransferFailed();

contract TokenSale is Ownable {
    uint256 public s_ratio;
    uint256 public s_nftPrice;
    IGroupFiveToken private immutable i_paymentToken;
    IGroupFiveCollection private immutable i_nftContract;

    event NftPaymentTransferSuccessful(address from, address to, uint256 amount);

    constructor(uint256 _ratio, uint256 _price, address _paymentToken, address _nftContract) {
        s_ratio = _ratio;
        s_nftPrice = _price;
        i_paymentToken = IGroupFiveToken(_paymentToken); // this makes i_paymentToken an interface
        i_nftContract = IGroupFiveCollection(_nftContract); // this makes i_nftContract an interface
    }

    function buyTokens() external payable {
        uint256 amountToBeMinted = msg.value * s_ratio;
        i_paymentToken.mint(msg.sender, amountToBeMinted); // in GroupFiveToken msg.sender will be the TokenSale contract itself
    }

    function withdraw() external onlyOwner {
        // specifically for ETH in contract
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}('');
        if (!success) {
            revert TokenSale__WithdrawTransferFailed();
        }
    }

    function mintNft() external {
        // transfer payment of GFT from sender to TokenSale contract
        // QUESTION: will this require TokenSale to be given allowance to alter msg.sender's balance of GFT???
        // QUESTION: burn spent GFT?
        bool success = i_paymentToken.transferFrom(msg.sender, address(this), s_nftPrice);
        if (!success) {
            revert TokenSale__NftPaymentTransferFailed();
        }
        emit NftPaymentTransferSuccessful(msg.sender, address(this), s_nftPrice);
        // mint nft
        i_nftContract.requestNft(msg.sender);
    }
}
