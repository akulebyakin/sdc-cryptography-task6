// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SoulboundVisitCardERC721
 * @dev ERC-721 Non-Fungible Token representing a soulbound student visit card
 *
 * Key Features:
 * - One token per address (non-transferable after minting)
 * - Stores student information (name, year, course)
 * - Metadata with image stored on-chain via base64 data URI
 * - Only contract owner can mint cards
 * - Soulbound: All transfer and approval functions are blocked
 */
contract SoulboundVisitCardERC721 is ERC721, ERC721URIStorage, Ownable {

    // ============ State Variables ============

    uint256 private _nextTokenId;

    // Track if an address has already minted a card
    mapping(address => bool) public hasMintedCard;

    // Map owner address to their token ID
    mapping(address => uint256) public ownerToTokenId;

    // Store student information for each token
    mapping(uint256 => StudentInfo) public studentData;

    // ============ Structs ============

    struct StudentInfo {
        string name;
        string year;
        string course;
        uint256 mintTimestamp;
    }

    // ============ Errors ============

    error SoulboundToken();
    error AlreadyMinted();
    error NotAuthorized();
    error TokenDoesNotExist();

    // ============ Events ============

    event CardMinted(
        address indexed student,
        uint256 indexed tokenId,
        string name,
        string year,
        string course
    );

    event MetadataUpdated(
        uint256 indexed tokenId,
        string name,
        string year,
        string course
    );

    // ============ Constructor ============

    constructor() ERC721("Student Visit Card", "SVC") {
        _nextTokenId = 0;
    }

    // ============ Minting Functions ============

    /**
     * @dev Mint a soulbound visit card to a student address
     * @param to Address of the student receiving the card
     * @param uri URI containing the card metadata (base64 data URI)
     * @param name Student's name
     * @param year Student's year (e.g., "Freshman", "Sophomore", "Junior", "Senior")
     * @param course Student's course/major
     *
     * Requirements:
     * - Only owner can call
     * - Address must not have already minted a card
     */
    function mintCard(
        address to,
        string memory uri,
        string memory name,
        string memory year,
        string memory course
    ) external onlyOwner {
        if (hasMintedCard[to]) {
            revert AlreadyMinted();
        }

        uint256 tokenId = _nextTokenId++;

        // Mark address as having minted
        hasMintedCard[to] = true;
        ownerToTokenId[to] = tokenId;

        // Store student information
        studentData[tokenId] = StudentInfo({
            name: name,
            year: year,
            course: course,
            mintTimestamp: block.timestamp
        });

        // Mint token
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit CardMinted(to, tokenId, name, year, course);
    }

    // ============ Metadata Functions ============

    /**
     * @dev Update student information for a token
     * @param tokenId Token ID to update
     * @param name New name
     * @param year New year
     * @param course New course
     *
     * Requirements:
     * - Caller must be owner or token holder
     * - Token must exist
     */
    function updateMetadata(
        uint256 tokenId,
        string memory name,
        string memory year,
        string memory course
    ) external {
        address tokenOwner = _ownerOf(tokenId);
        if (tokenOwner == address(0)) {
            revert TokenDoesNotExist();
        }

        if (msg.sender != owner() && msg.sender != tokenOwner) {
            revert NotAuthorized();
        }

        studentData[tokenId].name = name;
        studentData[tokenId].year = year;
        studentData[tokenId].course = course;

        emit MetadataUpdated(tokenId, name, year, course);
    }

    /**
     * @dev Get student information for a token
     * @param tokenId Token ID to query
     * @return StudentInfo struct containing name, year, course, and mint timestamp
     */
    function getStudentInfo(uint256 tokenId) external view returns (StudentInfo memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenDoesNotExist();
        }
        return studentData[tokenId];
    }

    /**
     * @dev Get token ID owned by an address
     * @param owner Address to query
     * @return tokenId Token ID owned by the address
     *
     * Requirements:
     * - Address must have minted a card
     */
    function tokenOfOwner(address owner) external view returns (uint256) {
        if (!hasMintedCard[owner]) {
            revert TokenDoesNotExist();
        }
        return ownerToTokenId[owner];
    }

    // ============ Soulbound Implementation ============

    /**
     * @dev Override _beforeTokenTransfer to block all transfers except minting
     * This makes the token "soulbound" - non-transferable
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override(ERC721) {
        // Only allow minting (from == address(0))
        // Block all transfers after minting
        if (from != address(0)) {
            revert SoulboundToken();
        }

        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Block approve function - soulbound tokens cannot be approved
     */
    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert SoulboundToken();
    }

    /**
     * @dev Block setApprovalForAll - soulbound tokens cannot be approved
     */
    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert SoulboundToken();
    }

    /**
     * @dev getApproved always returns address(0) for soulbound tokens
     */
    function getApproved(uint256) public pure override(ERC721, IERC721) returns (address) {
        return address(0);
    }

    /**
     * @dev isApprovedForAll always returns false for soulbound tokens
     */
    function isApprovedForAll(address, address) public pure override(ERC721, IERC721) returns (bool) {
        return false;
    }

    // ============ Required Overrides ============

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
