// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/access/Ownable.sol';
import './GroupFiveToken.sol';
import './GroupFiveCollection.sol';
import './interfaces/IGroupFiveToken.sol';
import './interfaces/IGroupFiveCollection.sol';

error TokenSale__NftPaymentTransferFailed();

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
        // TODO
        // need one withdraw for ETH and one for GFT?
        // or use the same for both?
        // add to interface
    }

    // Not needed???
    // function returnTokens(uint256 amount) external {
    //     // burn amount from sender
    //     i_paymentToken.burnFrom(msg.sender, amount);
    //     // transfer eth to sender
    //     payable(msg.sender).transfer(amount / ratio);
    // }

    function mintNft() external {
        // transfer payment of GFT from sender to TokenSale contract
        i_paymentToken.transferFrom(msg.sender, address(this), s_nftPrice);
        bool success = i_paymentToken.transferFrom(msg.sender, address(this), s_nftPrice);
        if (!success) {
            revert TokenSale__NftPaymentTransferFailed();
        }
        emit NftPaymentTransferSuccessful(msg.sender, address(this), s_nftPrice);
        // mint nft
        i_nftContract.requestNft();
    }
}
