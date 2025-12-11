// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultiSigWallet {
    // Events for logging significant actions
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public numConfirmationsRequired; // Number of confirmations needed to execute a transaction

    struct Transaction {
        address to;
        uint256 value; // Amount of ETH to send (in wei)
        bytes data; // Additional data
        bool executed;
        uint256 numConfirmations; // Number of confirmations received
    }

    // Track which owners have confirmed each transaction
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    // storing all submitted transactions
    Transaction[] public transactions;

    // Modifiers - reusable checks for function requirements

    // Only wallet owners can call functions with this modifier
    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    // Transaction must exist (valid index)
    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "tx does not exist");
        _;
    }

    // Transaction must not have been executed yet
    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }

    // Caller must not have already confirmed this transaction
    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
        _;
    }

    // Initialize the multi-sig wallet with owners and confirmation threshold
    constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
        require(_owners.length > 0, "owners required");
        require(
            _numConfirmationsRequired > 0 &&
                _numConfirmationsRequired <= _owners.length,
            "invalid number of required confirmations"
        );

        // Add each owner to the wallet
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner"); // Prevent zero address
            require(!isOwner[owner], "owner not unique"); // Prevent duplicate owners

            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    // Fallback function to receive ETH
    receive() external payable {
        // Log the deposit event with sender, amount, and new balance
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // Submit a new transaction proposal (only owners can call)
    function submitTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner {
        uint256 txIndex = transactions.length;

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0 // Initially zero confirmations
            })
        );

        // Log the submission of the new transaction
        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }

    /**
     * @dev Confirm a submitted transaction (only owners can call)
     * @param _txIndex Index of transaction to confirm
     * Requirements:
     * - Must be owner
     * - Transaction must exist
     * - Transaction must not be executed
     * - Caller must not have already confirmed
     */
    function confirmTransaction(
        uint256 _txIndex
    )
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    /**
     * @dev Execute a transaction that has enough confirmations (only owners can call)
     * @param _txIndex Index of transaction to execute
     * Requirements:
     * - Must be owner
     * - Transaction must exist
     * - Transaction must not be executed
     * - Must have enough confirmations (>= numConfirmationsRequired)
     * - External call must succeed
     */
    function executeTransaction(
        uint256 _txIndex
    ) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];

        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "cannot execute tx"
        );

        // Mark as executed before external call (prevents reentrancy)
        transaction.executed = true;

        // Execute the transaction
        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );
        require(success, "tx failed");

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    /**
     * @dev Revoke your confirmation for a pending transaction (only owners can call)
     * @param _txIndex Index of transaction to revoke confirmatiopn
     * Requirements:
     * - Must be owner
     * - Transaction must exist
     * - Transaction must not be executed
     * - Caller must have previously confirmed
     */
    function revokeConfirmation(
        uint256 _txIndex
    ) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");

        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    // Get list of owners
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    // Get total number of submitted transactions
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    // Get details of transaction
    function getTransaction(
        uint256 _txIndex
    )
        public  
        view
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 numConfirmations
        )
    {
        Transaction storage transaction = transactions[_txIndex];

        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}
