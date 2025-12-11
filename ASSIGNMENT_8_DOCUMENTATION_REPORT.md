# Assignment 8: Multi-Signature Wallet - Documentation Report

## 1. Design Overview

### Architecture
Multi-signature wallet with threshold-based execution requiring multiple owner approvals before executing transactions.

**Key Features**:
- Fixed set of owners at deployment
- Threshold confirmations (e.g., 2-of-3)
- Proposal-confirm-execute workflow
- Support for ETH transfers and contract calls

**Transaction Lifecycle**:
1. **Submitted**: Proposed by owner, auto-confirmed by submitter
2. **Pending**: Awaiting confirmations (< threshold)
3. **Ready**: Threshold met (>= required confirmations)
4. **Executed**: Completed, immutable

---

## 2. Core Functions

**submitTransaction(address to, uint256 value, bytes data)**
- Creates transaction proposal
- `to`: Recipient (EOA or contract)
- `value`: ETH amount in wei
- `data`: Empty `""` for ETH transfers, or ABI-encoded for contract calls

**confirmTransaction(uint256 txIndex)**
- Adds confirmation to pending transaction
- Owner-only, once per transaction

**executeTransaction(uint256 txIndex)**
- Executes after threshold met
- Owner-only, marks executed before external call

**revokeConfirmation(uint256 txIndex)**
- Removes confirmation before execution

**View Functions**:
- `getOwners()`: Returns owner addresses
- `getTransaction(uint256)`: Transaction details
- `getTransactionCount()`: Total transactions
- `isConfirmed(uint256, address)`: Check confirmation status

---

## 3. Usage

### Deployment
```solidity
address[] memory owners = [0xOwner1, 0xOwner2, 0xOwner3];
uint256 required = 2;
MultiSigWallet wallet = new MultiSigWallet(owners, required);
```

**Validation**: At least 1 owner, no duplicates/zero addresses, 0 < required <= owner count

### Basic Operations

**Submit ETH Transfer**:
```solidity
wallet.submitTransaction(recipient, 1 ether, "");
```

**Confirm & Execute**:
```solidity
wallet.confirmTransaction(0);  // As second owner
wallet.executeTransaction(0);   // Once threshold met
```

**Contract Interaction Example**:
```solidity
bytes memory data = abi.encodeWithSignature("mint(address,uint256)", recipient, 1000e18);
wallet.submitTransaction(tokenAddress, 0, data);
```

### Web Interface

**Setup**:
1. Navigate to http://localhost:3000/assignment8
2. Connect wallet (auto-switches to Hardhat Local)
3. Enter contract address: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`

**Workflow**:
1. **Submit**: Fill recipient, amount, data (`0x` for simple transfers)
2. **Confirm**: Switch to second owner in MetaMask, click "Confirm"
3. **Execute**: Once threshold met, click "Execute"

---

## 4. Security

### Access Control
- `onlyOwner` modifier on all state-changing functions
- Immutable owner list after deployment
- No zero addresses or duplicates allowed

### Transaction Safety
- Each owner confirms once per transaction
- Cannot confirm executed transactions
- Threshold enforced on execution
- Reentrancy protection: marked executed before external call

**Execution Pattern**:
```solidity
transaction.executed = true;  // Set flag first
(bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
require(success, "tx failed");
```

### State Invariants
- Sequential transaction indices
- Confirmation count ≤ owner count
- Executed transactions immutable
- All state changes validated before execution

---

## Events
- `Deposit(address sender, uint256 amount, uint256 balance)`
- `SubmitTransaction(address owner, uint256 txIndex, address to, uint256 value, bytes data)`
- `ConfirmTransaction(address owner, uint256 txIndex)`
- `ExecuteTransaction(address owner, uint256 txIndex)`
- `RevokeConfirmation(address owner, uint256 txIndex)`
