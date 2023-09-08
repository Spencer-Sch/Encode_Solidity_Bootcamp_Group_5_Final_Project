// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import '@openzeppelin/contracts/access/Ownable.sol';
import './GroupFiveToken.sol';
import './GroupFiveCollection.sol';
import './interfaces/IGroupFiveToken.sol';
import './interfaces/IGroupFiveCollection.sol';

contract TokenSale is Ownable {
    uint256 public ratio;
    uint256 public price;
    IGroupFiveToken public paymentToken;
    IGroupFiveCollection public nftContract;

    constructor(uint256 _ratio, uint256 _price, address _paymentToken, address _nftContract) {
        ratio = _ratio;
        price = _price;
        paymentToken = IGroupFiveToken(_paymentToken); // this makes paymentToken an interface
        nftContract = IGroupFiveCollection(_nftContract); // this makes nftContract an interface
    }

    function buyTokens() external payable {
        uint256 amountToBeMinted = msg.value * ratio;
        paymentToken.mint(msg.sender, amountToBeMinted); // in GroupFiveToken msg.sender will be the TokenSale contract itself
    }

    // function returnTokens(uint256 amount) external {
    //     // burn amount from sender
    //     paymentToken.burnFrom(msg.sender, amount);
    //     // transfer eth to sender
    //     payable(msg.sender).transfer(amount / ratio);
    // }

    function mintNft(uint256 nftId) external {
        paymentToken.transferFrom(msg.sender, address(this), price);
        // TODO mint nft
    }
}
