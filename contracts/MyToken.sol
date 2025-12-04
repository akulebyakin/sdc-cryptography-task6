// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

/**
 * @title MyToken
 * @dev ERC20 token with minting functionality restricted to the owner
 */
contract MyToken is ERC20, Ownable {
    /**
     * @dev Constructor that gives msg.sender all of the initial supply.
     * @param initialSupply The initial supply of tokens
     */
    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        console.log("Minting initial supply of %s tokens to %s", initialSupply, msg.sender);
        _mint(msg.sender, initialSupply);
    }


    /**
     * @dev Mint new tokens. Only the owner can call this function.
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        console.log("Minting %s tokens to %s", amount, to);
        _mint(to, amount);
    }
}
