# Complete Testing Instructions

Step-by-step guide for testing all three assignments with exact addresses and values.

---

## Prerequisites

1. ✅ Hardhat node running (`npx hardhat node`)
2. ✅ Contracts deployed (check [DEPLOYED_ADDRESSES.txt](DEPLOYED_ADDRESSES.txt))
3. ✅ Frontend running (`cd frontend && npm run dev`)
4. ✅ MetaMask configured with Hardhat Local network
5. ✅ Test account imported: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

---

## Test Accounts

Hardhat provides 20 test accounts. Here are the ones you'll use:

| Role | Address | Private Key (to import) |
|------|---------|------------------------|
| **Owner (You)** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| **Recipient 1** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| **Recipient 2** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| **Recipient 3** | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |

You're already using **Owner** account. For testing transfers and multi-sig, you can use Recipient 1, 2, 3 addresses.

---

# Assignment 6: ERC20 Token (MyToken)

**Contract Address**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`

## Step 1: Connect to Contract

1. Open http://localhost:3000/assignment6
2. Click **"Connect Wallet"** (should auto-switch to Hardhat Local)
3. Enter contract address: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
4. Click **"Connect to Contract"**

**Expected Result**:
```
✅ Connected to MyToken contract!

Token Information:
Name: MyToken
Symbol: MTK
Decimals: 18
Total Supply: 1,000,000 MTK
Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

---

## Test 1: Check Your Balance

1. Scroll to **"Your Balance"** section
2. Click **"Refresh Balance"**

**Expected Result**:
```
Your Balance: 1,000,000 MTK
```

You have all the tokens because you're the deployer/owner.

---

## Test 2: Transfer Tokens

**Goal**: Send tokens to another address

1. Scroll to **"Transfer Tokens"** section
2. **Recipient Address**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Recipient 1)
3. **Amount**: `1000`
4. Click **"Transfer"**
5. **Approve transaction in MetaMask**

**Expected Result**:
```
✅ Transfer successful!
```

**Verify**:
- Click "Refresh Balance" - should show `999,000 MTK` (1,000 less)
- Total Supply stays `1,000,000 MTK` (transfer doesn't change supply)

---

## Test 3: Mint New Tokens

**Goal**: Create new tokens (only owner can do this)

1. Scroll to **"Mint Tokens (Owner Only)"** section
2. **Recipient Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (your own address)
   - Or mint to someone else: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
3. **Amount**: `500000`
4. Click **"Mint"**
5. **Approve transaction in MetaMask**

**Expected Result**:
```
✅ Minting successful!
```

**Verify**:
- Click "Refresh Balance" - should show `1,499,000 MTK` (if you minted to yourself)
- Total Supply should increase to `1,500,000 MTK`

---

## Test 4: Approve Allowance

**Goal**: Allow another address to spend tokens on your behalf

1. Scroll to **"Approve Allowance"** section
2. **Spender Address**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Recipient 1)
3. **Amount**: `5000`
4. Click **"Approve"**
5. **Approve transaction in MetaMask**

**Expected Result**:
```
✅ Approval successful!
```

This allows Recipient 1 to spend up to 5,000 MTK from your account (used in DeFi protocols).

---

## Test 5: Check Allowance

**Goal**: Verify the approved amount

1. Scroll to **"Check Allowance"** section
2. **Owner Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (your address)
3. **Spender Address**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Recipient 1)
4. Click **"Check Allowance"**

**Expected Result**:
```
Allowance: 5,000 MTK
```

---

## Additional Tests for Assignment 6

### Test 6: Transfer More Than Balance (Should Fail)

1. Try to transfer `10,000,000` MTK to `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
2. **Expected**: Transaction should fail with error

### Test 7: Mint from Non-Owner Account (Should Fail)

1. In MetaMask, switch to a different account (import Recipient 1's private key)
2. Try to mint tokens
3. **Expected**: Should fail - only owner can mint

### Test 8: Transfer to Invalid Address (Should Fail)

1. Try to transfer to `0x0000000000000000000000000000000000000000`
2. **Expected**: Should show "Invalid recipient address" or fail

---

# Assignment 7: Upgradeable Token (UUPS Proxy)

**Proxy Address**: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`

## Step 1: Connect to Proxy

1. Open http://localhost:3000/assignment7
2. Enter proxy address: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`
3. Click **"Connect to Proxy"**

**Expected Result**:
```
✅ Connected to proxy!

Token Information:
Name: MyToken
Symbol: MTK
Decimals: 18
Total Supply: 1,000,000 MTK
Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

Version: V1 (version() not available)
Status: Running V1
```

---

## Test 1: Verify V1 Functionality

The proxy currently points to V1 implementation. Test all the same functions as Assignment 6:

1. **Transfer tokens**: Send `500 MTK` to `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
2. **Mint tokens**: Mint `100000 MTK` to your address
3. **Check balance**: Should show updated balance

All functions work the same as Assignment 6.

---

## Test 2: Upgrade to V2

**Goal**: Upgrade the contract to V2 while preserving state

1. Open a terminal in the project root
2. Run the upgrade script:

```bash
export PROXY_ADDRESS="0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
PROXY_ADDRESS=$PROXY_ADDRESS npx hardhat run scripts/upgrade-to-v2.js --network localhost
```

**Expected Output**:
```
Upgrading MyToken proxy...
Proxy at: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
Current owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

Deploying MyTokenV2 implementation...
MyTokenV2 deployed to: 0x...

Upgrading proxy to V2...
✅ Proxy upgraded to V2!

Verifying upgrade...
Version: V2
Name: MyToken
Symbol: MTK
Total Supply: 1100000000000000000000000 (1,100,000 MTK)

✅ Upgrade successful! State preserved.
```

---

## Test 3: Verify V2 Features

1. **Refresh the UI page** in your browser
2. Contract info should now show:

```
Version: V2
Status: Upgraded to V2!
```

3. **Verify State Preservation**:
   - Balance should still show your tokens (not reset to 0)
   - Total supply should match what it was before upgrade

4. **Test new V2 feature - version() function**:
   - The version string "V2" confirms the new implementation

---

## Test 4: V2 Functions Still Work

1. **Transfer tokens**: Send `200 MTK` to `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
2. **Mint tokens**: Mint `50000 MTK`
3. **Expected**: All functions still work, balances are preserved

---

## Key Concepts Demonstrated

1. ✅ **Proxy Pattern**: Contract address stays the same (`0xDc64...C9`)
2. ✅ **Implementation Upgrade**: Logic changes from V1 to V2
3. ✅ **State Preservation**: Your balances and total supply are NOT reset
4. ✅ **New Features**: V2 adds `version()` function that V1 didn't have

---

# Assignment 8: Multi-Signature Wallet

**Contract Address**: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`

## Background

Multi-sig wallet requires **2 out of 3 owners** to approve transactions before execution.

**Owners**:
1. `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (You - Owner 1)
2. `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Owner 2)
3. `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` (Owner 3)

**Required Confirmations**: 2

---

## Step 1: Connect to Multi-Sig Wallet

1. Open http://localhost:3000/assignment8
2. Enter contract address: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`
3. Click **"Connect to Wallet"**

**Expected Result**:
```
✅ Connected to multi-sig wallet!

Wallet Information:
Number of Owners: 3
Required Confirmations: 2
Transaction Count: 0
Wallet Balance: 10.0 ETH

Owners:
1. 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (You)
2. 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
3. 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

---

## Test 1: Submit a Transaction

**Goal**: Propose sending 1 ETH to an external address

1. Scroll to **"Submit Transaction"** section
2. **Recipient Address**: `0x90F79bf6EB2c4f870365E785982E1f101E93b906` (Recipient 3)
3. **Amount (ETH)**: `1`
4. **Data (optional)**: Leave empty (or `0x` for simple ETH transfer)
5. Click **"Submit Transaction"**
6. **Approve transaction in MetaMask**

**Expected Result**:
```
✅ Transaction submitted! Transaction ID: 0
```

The transaction is now **proposed** but not executed yet (needs 2 confirmations).

---

## Test 2: Check Transaction Status

1. Scroll to **"Transactions"** section
2. You should see:

```
Transaction #0
To: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Value: 1.0 ETH
Data: 0x
Confirmations: 1 / 2
Status: ⏳ Pending (needs 1 more confirmation)
Executed: No

You confirmed: ✅ Yes
```

**Note**: You automatically confirmed when you submitted it (1/2 confirmations).

---

## Test 3: Confirm as Second Owner

**Goal**: Get the second approval to execute the transaction

### Option A: Use Owner 2 Account in MetaMask

1. In MetaMask, click account icon → Import Account
2. Paste Owner 2's private key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
3. Switch to this account
4. Refresh the page
5. Click "Connect Wallet"
6. Enter contract address again: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`
7. Find Transaction #0
8. Click **"Confirm"**
9. Approve in MetaMask

**Expected Result**:
```
✅ Transaction confirmed!

Confirmations: 2 / 2
Status: ✅ Ready to execute
```

### Option B: Use Hardhat Script (Easier)

Create a quick script to confirm as Owner 2:

```bash
# Create confirmation script
cat > scripts/confirm-tx.js << 'EOF'
const hre = require("hardhat");

async function main() {
  const [owner1, owner2] = await hre.ethers.getSigners();
  const multiSig = await hre.ethers.getContractAt(
    "MultiSigWallet",
    "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
  );

  console.log("Confirming transaction 0 as Owner 2:", owner2.address);
  const tx = await multiSig.connect(owner2).confirmTransaction(0);
  await tx.wait();
  console.log("✅ Confirmed!");
}

main().catch(console.error);
EOF

# Run the script
npx hardhat run scripts/confirm-tx.js --network localhost
```

---

## Test 4: Execute the Transaction

**Goal**: Execute the transaction now that it has 2/2 confirmations

1. Switch back to Owner 1 in MetaMask (your main account)
2. Refresh the page and reconnect
3. Transaction #0 should now show:

```
Confirmations: 2 / 2
Status: ✅ Ready to execute
Executed: No
```

4. Click **"Execute"**
5. Approve in MetaMask

**Expected Result**:
```
✅ Transaction executed!

Status: ✅ Executed
Executed: Yes
```

**Verify**:
- Wallet balance should decrease from `10.0 ETH` to `9.0 ETH`
- Recipient received 1 ETH

---

## Test 5: Revoke Confirmation

**Goal**: Remove your confirmation from a pending transaction

1. Submit a new transaction:
   - Recipient: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
   - Amount: `0.5` ETH
   - This creates Transaction #1 with 1/2 confirmations

2. Click **"Revoke"** next to Transaction #1
3. Approve in MetaMask

**Expected Result**:
```
✅ Confirmation revoked!

Confirmations: 0 / 2
You confirmed: ❌ No
```

The transaction is back to 0 confirmations and cannot be executed.

---

## Test 6: Only Owners Can Act

**Goal**: Verify non-owners cannot submit/confirm transactions

1. In MetaMask, import a non-owner account (use Recipient 3's key)
2. Try to submit a transaction
3. **Expected**: Should fail with "Not an owner" error

---

## Test 7: Cannot Execute Without Enough Confirmations

**Goal**: Verify threshold requirement

1. Submit a new transaction (as Owner 1)
2. Try to click "Execute" immediately (only has 1/2 confirmations)
3. **Expected**: Execute button should be disabled or transaction should fail

---

## Test 8: Multiple Pending Transactions

**Goal**: Test managing multiple proposals

1. As Owner 1, submit 3 transactions:
   - TX #2: Send 0.1 ETH to `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
   - TX #3: Send 0.2 ETH to `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
   - TX #4: Send 0.3 ETH to `0x90F79bf6EB2c4f870365E785982E1f101E93b906`

2. Switch to Owner 2, confirm TX #3 only
3. TX #3 should be executable, but TX #2 and #4 should still need confirmations
4. Execute TX #3

**Result**: Shows you can manage multiple proposals independently.

---

## Advanced Test: Contract Call (Not Just ETH Transfer)

**Goal**: Use multi-sig to call a contract function

1. Submit a transaction with data:
   - **Recipient**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` (MyToken address)
   - **Amount**: `0` (no ETH, just calling function)
   - **Data**: Encode `mint()` function call

To generate the data, use ethers:
```javascript
// In browser console
const mintData = new ethers.Interface([
  "function mint(address to, uint256 amount)"
]).encodeFunctionData("mint", [
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  ethers.parseEther("1000")
])
console.log(mintData)
```

2. Copy the output and paste in Data field
3. Submit, confirm (2x), and execute
4. This mints 1000 MTK tokens via multi-sig approval!

---

# Summary of What You've Tested

## Assignment 6: ERC20 Token
✅ Basic token transfers
✅ Minting new tokens (owner only)
✅ Approval mechanism for allowances
✅ Balance queries
✅ Access control (only owner can mint)

## Assignment 7: Upgradeable Token
✅ Proxy pattern with persistent address
✅ Upgrading contract logic (V1 → V2)
✅ State preservation after upgrade
✅ New features in V2 (version function)
✅ All original functionality still works

## Assignment 8: Multi-Sig Wallet
✅ Transaction proposal system
✅ Multi-party confirmation (2-of-3 threshold)
✅ Transaction execution after threshold met
✅ Revoking confirmations
✅ Access control (only owners)
✅ Managing multiple pending transactions
✅ ETH transfers and contract calls

---

# Quick Reference: All Addresses

```
Contract Addresses:
- Assignment 6: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
- Assignment 7: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
- Assignment 8: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707

Test Accounts:
- Owner 1: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
- Owner 2: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
- Owner 3: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
- Recipient: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

---

# Troubleshooting

**Issue**: "Wrong network" error
**Fix**: Make sure MetaMask is on "Hardhat Local" (Chain ID 31337)

**Issue**: "Nonce too high"
**Fix**: MetaMask Settings → Advanced → Clear activity tab data

**Issue**: Transaction fails
**Fix**: Check Hardhat console for detailed error messages

**Issue**: Balance doesn't update
**Fix**: Click "Refresh Balance" button

**Issue**: Can't see transactions in Assignment 8
**Fix**: Click "Refresh Transactions" button

---

**Happy Testing! 🎉**
