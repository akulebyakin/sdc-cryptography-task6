// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title GameCharacterCollectionERC1155
 * @dev ERC-1155 Multi-Token contract for a game character collection
 *
 * Key Features:
 * - Supports 10 distinct token IDs (0-9) representing game characters and items
 * - Each token has unique attributes (color, speed, strength, rarity)
 * - Supports batch minting and batch transfers
 * - Individual token URIs for each character
 * - Only contract owner can create characters and mint
 * - Token holders can freely transfer their tokens
 */
contract GameCharacterCollectionERC1155 is ERC1155, Ownable {
    using Strings for uint256;

    // ============ State Variables ============

    string public name = "Game Character Collection";
    string public symbol = "GCC";

    uint256 public constant MAX_TOKEN_ID = 9;

    // Store character attributes for each token ID
    mapping(uint256 => CharacterAttributes) public characters;

    // Track total minted for each token ID
    mapping(uint256 => uint256) public totalMinted;

    // Store individual token URIs
    mapping(uint256 => string) private _tokenURIs;

    // ============ Structs ============

    struct CharacterAttributes {
        string characterType;
        string color;
        uint256 speed;
        uint256 strength;
        string rarity;
        bool exists;
    }

    // ============ Errors ============

    error CharacterDoesNotExist();
    error CharacterAlreadyExists();
    error InvalidTokenId();

    // ============ Events ============

    event CharacterCreated(
        uint256 indexed tokenId,
        string characterType,
        string rarity
    );

    event BatchMinted(
        address indexed to,
        uint256[] tokenIds,
        uint256[] amounts
    );

    // ============ Constructor ============

    /**
     * @dev Constructor sets the base URI for all tokens
     * @param baseURI Base URI for metadata (e.g., "ipfs://collection-hash/" or "https://api.example.com/metadata/")
     */
    constructor(string memory baseURI) ERC1155(baseURI) {}

    // ============ Character Creation ============

    /**
     * @dev Create a new character type with attributes
     * @param tokenId Token ID for this character (0-9)
     * @param attributes Character attributes (type, color, speed, strength, rarity)
     * @param tokenURI URI for this token's metadata
     *
     * Requirements:
     * - Only owner can call
     * - Token ID must be 0-9
     * - Character must not already exist
     */
    function createCharacter(
        uint256 tokenId,
        CharacterAttributes memory attributes,
        string memory tokenURI
    ) external onlyOwner {
        if (tokenId > MAX_TOKEN_ID) {
            revert InvalidTokenId();
        }

        if (characters[tokenId].exists) {
            revert CharacterAlreadyExists();
        }

        attributes.exists = true;
        characters[tokenId] = attributes;
        _tokenURIs[tokenId] = tokenURI;

        emit CharacterCreated(tokenId, attributes.characterType, attributes.rarity);
    }

    // ============ Minting Functions ============

    /**
     * @dev Mint a single token to an address
     * @param to Address receiving the token
     * @param tokenId Token ID to mint
     * @param amount Amount to mint
     *
     * Requirements:
     * - Only owner can call
     * - Character must exist
     */
    function mint(
        address to,
        uint256 tokenId,
        uint256 amount
    ) external onlyOwner {
        if (!characters[tokenId].exists) {
            revert CharacterDoesNotExist();
        }

        _mint(to, tokenId, amount, "");
        totalMinted[tokenId] += amount;
    }

    /**
     * @dev Batch mint multiple tokens to an address
     * @param to Address receiving the tokens
     * @param tokenIds Array of token IDs to mint
     * @param amounts Array of amounts to mint for each token ID
     *
     * Requirements:
     * - Only owner can call
     * - All characters must exist
     * - Arrays must be same length
     *
     * This demonstrates ERC-1155's batch minting efficiency
     */
    function mintBatch(
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts
    ) external onlyOwner {
        require(tokenIds.length == amounts.length, "Arrays length mismatch");

        // Verify all characters exist
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (!characters[tokenIds[i]].exists) {
                revert CharacterDoesNotExist();
            }
            totalMinted[tokenIds[i]] += amounts[i];
        }

        _mintBatch(to, tokenIds, amounts, "");

        emit BatchMinted(to, tokenIds, amounts);
    }

    // ============ Batch Transfer (User Function) ============

    /**
     * @dev Convenience function for batch transfers
     * @param from Address sending the tokens
     * @param to Address receiving the tokens
     * @param tokenIds Array of token IDs to transfer
     * @param amounts Array of amounts to transfer for each token ID
     *
     * Requirements:
     * - Caller must own the tokens or be approved
     * - Demonstrates ERC-1155 batch transfer efficiency
     */
    function batchTransfer(
        address from,
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts
    ) external {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "Not authorized"
        );

        safeBatchTransferFrom(from, to, tokenIds, amounts, "");
    }

    // ============ View Functions ============

    /**
     * @dev Get character attributes for a token ID
     * @param tokenId Token ID to query
     * @return CharacterAttributes struct
     */
    function getCharacterAttributes(uint256 tokenId)
        external
        view
        returns (CharacterAttributes memory)
    {
        if (!characters[tokenId].exists) {
            revert CharacterDoesNotExist();
        }
        return characters[tokenId];
    }

    /**
     * @dev Check if a character exists
     * @param tokenId Token ID to check
     * @return bool True if character exists
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return characters[tokenId].exists;
    }

    /**
     * @dev Get the URI for a specific token ID
     * @param tokenId Token ID to query
     * @return string Token URI
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        if (!characters[tokenId].exists) {
            revert CharacterDoesNotExist();
        }

        string memory tokenURI = _tokenURIs[tokenId];

        // If individual URI is set, return it
        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }

        // Otherwise, return base URI + token ID
        return string(abi.encodePacked(super.uri(tokenId), tokenId.toString(), ".json"));
    }

    // ============ Admin Functions ============

    /**
     * @dev Update the base URI for all tokens
     * @param newBaseURI New base URI
     *
     * Requirements:
     * - Only owner can call
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _setURI(newBaseURI);
    }

    /**
     * @dev Update the URI for a specific token
     * @param tokenId Token ID to update
     * @param newTokenURI New token URI
     *
     * Requirements:
     * - Only owner can call
     * - Character must exist
     */
    function setTokenURI(uint256 tokenId, string memory newTokenURI) external onlyOwner {
        if (!characters[tokenId].exists) {
            revert CharacterDoesNotExist();
        }
        _tokenURIs[tokenId] = newTokenURI;
    }

    /**
     * @dev Get balances of all token IDs for an address
     * @param account Address to query
     * @return balances Array of balances for token IDs 0-9
     *
     * Utility function for frontend to efficiently query all character balances
     */
    function balanceOfBatch(address account)
        external
        view
        returns (uint256[] memory balances)
    {
        balances = new uint256[](MAX_TOKEN_ID + 1);
        for (uint256 i = 0; i <= MAX_TOKEN_ID; i++) {
            balances[i] = balanceOf(account, i);
        }
        return balances;
    }
}
