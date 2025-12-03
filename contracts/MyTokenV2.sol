// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title MyTokenV2
 * @dev Upgraded version of MyTokenV1 with version() function
 * IMPORTANT: Storage layout must match V1 to prevent storage collisions
 */
contract MyTokenV2 is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract (replaces constructor for upgradeable contracts)
     * This should NOT be called again during upgrade - initialization only happens once
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

    /**
     * @dev New function added in V2 to demonstrate the upgrade
     * @return The version string
     */
    function version() public pure returns (string memory) {
        return "V2";
    }
}
