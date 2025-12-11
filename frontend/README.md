# Smart Contracts Lab - Frontend Interface

A modern React web application for interacting with Assignments 6, 7, and 8 smart contracts.

## 🚀 Features

### Assignment 6: ERC20 Token (MyToken)
- Deploy and connect to MyToken contract
- View token information (name, symbol, decimals, total supply)
- Check balances
- Transfer tokens between addresses
- Mint new tokens (owner only)
- Approve and manage allowances
- Transfer from approved addresses

### Assignment 7: Upgradeable Token (UUPS)
- Connect to upgradeable token proxy
- Detect contract version (V1 or V2)
- Interact with both V1 and V2 implementations
- View upgrade status
- Transfer and mint tokens
- Check balances for any address
- Instructions for upgrading contracts

### Assignment 8: Multi-Signature Wallet
- Connect to MultiSig wallet
- View wallet information (owners, required confirmations, balance)
- Submit new transactions
- Confirm pending transactions
- Execute transactions when threshold is met
- Revoke confirmations
- View transaction history with status
- Real-time updates

## 📋 Prerequisites

- Node.js v16+ and npm
- MetaMask browser extension
- Hardhat local network running
- Deployed smart contracts

## 🛠️ Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

## 🎯 Quick Start

### 1. Start Hardhat Network

In the project root directory:

```bash
# Terminal 1
npx hardhat node
```

This starts a local blockchain at `http://127.0.0.1:8545` with 20 test accounts.

### 2. Deploy Contracts

Deploy the contracts you want to interact with:

```bash
# Terminal 2
# Assignment 6
npx hardhat run scripts/deploy.js --network localhost

# Assignment 7
npx hardhat run scripts/deploy-proxy.js --network localhost

# Assignment 8
npx hardhat run scripts/deploy-multisig.js --network localhost
```

**Important:** Save the deployed contract addresses!

### 3. Configure MetaMask

1. Open MetaMask
2. Add network: Localhost 8545
   - Network Name: Hardhat Local
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
3. Import test accounts from Hardhat node output

### 4. Start Frontend

```bash
# In frontend directory
npm run dev
```

The app will open at `http://localhost:3000`

### 5. Connect and Interact

1. Click "Connect Wallet" in the navigation
2. Approve MetaMask connection
3. Navigate to an assignment page
4. Enter the deployed contract address
5. Start interacting!

## 📖 Usage Guide

### Assignment 6: ERC20 Token

1. **Connect to Contract**
   - Enter MyToken contract address
   - Click "Connect to Contract"
   - View token information

2. **Transfer Tokens**
   - Enter recipient address
   - Enter amount
   - Click "Transfer"
   - Approve MetaMask transaction

3. **Mint Tokens (Owner Only)**
   - Enter recipient address
   - Enter amount to mint
   - Click "Mint"
   - Must be contract owner

4. **Manage Allowances**
   - Approve spenders
   - Check allowances
   - Use transferFrom

### Assignment 7: Upgradeable Token

1. **Connect to Proxy**
   - Enter PROXY address (not implementation)
   - Click "Connect to Proxy"
   - View version status (V1 or V2)

2. **Interact with Token**
   - Transfer and mint tokens
   - Check any address balance
   - All V1 functionality works

3. **Upgrade to V2**
   - Use the terminal command shown
   - Refresh page
   - New version() function available
   - All state preserved!

### Assignment 8: Multi-Signature Wallet

1. **Connect to Wallet**
   - Enter MultiSigWallet address
   - Click "Connect to Wallet"
   - View owners and settings

2. **Submit Transaction**
   - Enter recipient address
   - Enter ETH amount
   - Optional: Add data for contract calls
   - Click "Submit Transaction"

3. **Confirm Transaction**
   - View pending transactions
   - Click "Confirm" on any pending TX
   - Multiple owners must confirm

4. **Execute Transaction**
   - Once threshold is met, "Execute" appears
   - Any owner can execute
   - Funds transferred immediately

5. **Revoke Confirmation**
   - Click "Revoke" on your confirmations
   - Only works before execution
   - Reduces confirmation count

## 🎨 Features

### User Interface
- Modern, responsive design
- Real-time wallet connection status
- Network detection
- Transaction status updates
- Error handling and user feedback
- Mobile-friendly layout

### Smart Contract Integration
- Ethers.js v6 for blockchain interaction
- ABI-based contract interfaces
- Event listening and updates
- Transaction confirmation tracking
- Gas estimation

### Security
- MetaMask integration
- Transaction approval required
- Owner validation
- Address validation
- Error boundary handling

## 🏗️ Project Structure

```
frontend/
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main app component
│   ├── App.css             # Global styles
│   ├── index.css           # Base styles
│   ├── components/
│   │   ├── WalletConnect.jsx    # Wallet connection component
│   │   └── WalletConnect.css
│   └── pages/
│       ├── Home.jsx             # Landing page
│       ├── Home.css
│       ├── Assignment6.jsx      # ERC20 interface
│       ├── Assignment7.jsx      # Upgradeable token interface
│       ├── Assignment8.jsx      # MultiSig interface
│       └── Assignment.css       # Shared page styles
└── README.md               # This file
```

## 🐛 Troubleshooting

### MetaMask Issues

**Problem:** "Nonce too high" error
**Solution:**
1. Open MetaMask
2. Settings → Advanced → Clear activity tab data
3. Refresh page

**Problem:** Can't connect to localhost
**Solution:**
1. Check Hardhat node is running
2. Verify network settings in MetaMask
3. RPC URL: `http://127.0.0.1:8545`
4. Chain ID: `31337`

### Contract Connection Issues

**Problem:** "Invalid address" error
**Solution:**
- Ensure address starts with `0x`
- Copy address directly from deployment logs
- Check address is on correct network

**Problem:** Contract functions not working
**Solution:**
1. Verify you're connected to correct network
2. Check Hardhat node is running
3. Ensure contract is deployed
4. Try refreshing the page

### Transaction Errors

**Problem:** "User denied transaction"
**Solution:**
- Click "Confirm" in MetaMask popup
- Check you have sufficient ETH for gas

**Problem:** Transaction pending forever
**Solution:**
1. Check Hardhat console for errors
2. Verify network connection
3. Try clearing MetaMask activity

**Problem:** "Not owner" error
**Solution:**
- Switch to contract owner account in MetaMask
- Check you're using correct address

## 🔧 Development

### Build for Production

```bash
npm run build
```

Builds to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Ethers.js v6** - Ethereum interaction
- **React Router** - Navigation
- **CSS** - Styling (no frameworks for simplicity)

## 📝 Contract ABIs

The app includes minimal ABIs for each contract. For full functionality, ABIs are defined in:

- **Assignment6.jsx** - ERC20 with mint()
- **Assignment7.jsx** - Upgradeable ERC20 with version()
- **Assignment8.jsx** - MultiSigWallet functions

## 🎓 Educational Notes

### Learning Points

1. **Web3 Integration**
   - MetaMask connection
   - Contract interaction
   - Transaction signing

2. **React Patterns**
   - State management
   - Effect hooks
   - Form handling
   - Component composition

3. **Smart Contract Patterns**
   - ERC20 standard
   - Proxy pattern (UUPS)
   - Multi-signature wallets
   - Access control

4. **User Experience**
   - Loading states
   - Error handling
   - Transaction feedback
   - Responsive design

## 🚀 Next Steps

### Enhancements

- [ ] Add transaction history persistence
- [ ] Implement event listening for real-time updates
- [ ] Add contract deployment interface
- [ ] Create batch operations
- [ ] Add testnet support (Sepolia, Goerli)
- [ ] Implement ENS name resolution
- [ ] Add QR code scanning
- [ ] Create mobile app version

### Testing

- [ ] Add unit tests (Vitest)
- [ ] Add E2E tests (Playwright)
- [ ] Test error scenarios
- [ ] Test edge cases

## 📚 Resources

- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Hardhat Documentation](https://hardhat.org/docs)

## 🤝 Contributing

This is an educational project. Feel free to:
- Report bugs
- Suggest improvements
- Add features
- Improve documentation

## 📄 License

This project is part of Smart Contracts Lab assignments.

## 💡 Tips

1. **Always test on localhost first** before deploying to testnet
2. **Keep contract addresses handy** - bookmark deployment logs
3. **Use Hardhat console** for debugging contract state
4. **Check MetaMask network** before every transaction
5. **Monitor gas prices** when deploying to public networks
6. **Backup private keys** (test accounts only!)

## 🎯 Assignment Checklists

### Assignment 6 Checklist
- [ ] Deploy MyToken contract
- [ ] Connect frontend to contract
- [ ] Transfer tokens successfully
- [ ] Mint tokens (as owner)
- [ ] Approve and check allowances
- [ ] Test with multiple accounts

### Assignment 7 Checklist
- [ ] Deploy V1 with proxy
- [ ] Connect frontend to proxy
- [ ] Verify V1 functionality
- [ ] Upgrade to V2 via terminal
- [ ] Verify version() function works
- [ ] Confirm state preserved

### Assignment 8 Checklist
- [ ] Deploy MultiSig wallet
- [ ] Connect frontend to wallet
- [ ] Submit transaction
- [ ] Get confirmations from owners
- [ ] Execute transaction
- [ ] Test revoke functionality

---

**Happy Coding! 🚀**

*For questions or issues, check the console logs and Hardhat node output.*
