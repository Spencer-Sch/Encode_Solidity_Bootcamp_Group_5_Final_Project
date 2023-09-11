// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract GroupFiveToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

    constructor() ERC20('GroupFiveToken', 'GFT') {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function _approveForGFT_(
        address owner,
        address spender,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) {
        _approve(owner, spender, amount);
    }

    function transferGFT(
        address from,
        address to,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) returns (bool) {
        _transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
