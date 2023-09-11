// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/access/Ownable.sol';
import './GroupFiveToken.sol';
import './GroupFiveCollection.sol';
import './interfaces/IGroupFiveToken.sol';
import './interfaces/IGroupFiveCollection.sol';

error TokenSale__transferGFTFailed();
error TokenSale__WithdrawTransferFailed();
error TokenSale__approveForGFTFailed();
error TokenSale__tryingToAllowInvalidSpender();
error TokenSale__tryingToAllowInvalidAmount();

// error TokenSale__approveTokenSaleFailed();

contract TokenSale is Ownable {
    uint256 public s_ratio;
    uint256 public s_nftPrice;
    IGroupFiveToken private immutable i_paymentToken;
    IGroupFiveCollection private immutable i_nftContract;

    event NftPaymentTransferSuccessful(address from, address to, uint256 amount);
    event TokenSaleApprovedForGFT(address owner, address spender, uint256 amount);

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

    function _approveForGFT(
        address owner,
        address spender,
        uint256 amount
    ) internal returns (bool) {
        if (spender != address(this)) {
            revert TokenSale__tryingToAllowInvalidSpender();
        }
        if (amount != s_nftPrice) {
            revert TokenSale__tryingToAllowInvalidAmount();
        }
        i_paymentToken._approveForGFT_(owner, spender, amount);
        return true;
    }

    // function approveTokenSale() external {
    //     bool approveSuccess = _approveForGFT(msg.sender, address(this), s_nftPrice);
    //     if (!approveSuccess) {
    //         revert TokenSale__approveTokenSaleFailed();
    //     }
    // }

    function mintNft() external {
        // QUESTION: burn spent GFT?
        // Approve TokenSale contract to transfer GFT as payment for nft
        bool approveSuccess = _approveForGFT(msg.sender, address(this), s_nftPrice);
        if (!approveSuccess) {
            revert TokenSale__approveForGFTFailed();
        }
        emit TokenSaleApprovedForGFT(msg.sender, address(this), s_nftPrice);

        // transfer payment of GFT from sender to TokenSale contract
        bool success = i_paymentToken.transferGFT(msg.sender, address(this), s_nftPrice);
        if (!success) {
            revert TokenSale__transferGFTFailed();
        }
        emit NftPaymentTransferSuccessful(msg.sender, address(this), s_nftPrice);
        // mint nft
        i_nftContract.requestNft(msg.sender);
    }
}
