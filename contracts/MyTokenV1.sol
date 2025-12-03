// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title MyTokenV1
 * @dev Upgradeable ERC20 token with minting functionality restricted to the owner
 * Uses UUPS (Universal Upgradeable Proxy Standard) pattern
 */
contract MyTokenV1 is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract (replaces constructor for upgradeable contracts)
     * @param initialSupply The initial supply of tokens
     */
    function initialize(uint256 initialSupply) public initializer {
        __ERC20_init("MyToken", "MTK");
        __Ownable_init();
        __UUPSUpgradeable_init();

        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Mint new tokens. Only the owner can call this function.
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Required by UUPS pattern. Only owner can authorize upgrades.
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
