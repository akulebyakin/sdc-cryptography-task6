# ERC20 Token Project

A Hardhat project implementing basic and upgradeable ERC20 tokens using OpenZeppelin contracts.

## Overview

This project contains:
- **MyToken** - Basic ERC20 token with minting
- **MyTokenV1/V2** - Upgradeable ERC20 using UUPS proxy pattern

## Installation

```bash
npm install
npx hardhat compile
```

## Project Structure

```
task6/
├── contracts/
│   ├── MyToken.sol           # Basic ERC20
│   ├── MyTokenV1.sol          # Upgradeable V1
│   └── MyTokenV2.sol          # Upgradeable V2
├── scripts/
│   ├── deploy.js              # Deploy basic token
│   ├── deploy-proxy.js        # Deploy V1 with proxy
│   ├── upgrade-to-v2.js       # Upgrade to V2
│   ├── interact.js            # Interact with contracts
│   └── send-eth.js            # Send ETH to address
└── test/
    └── MyToken.test.js        # Tests
```

## Usage

### Start Local Network

```bash
npx hardhat node
```

### MetaMask Setup

Add Hardhat Local network to MetaMask:
- **Network Name:** Hardhat Local
- **RPC URL:** `http://127.0.0.1:8545`
- **Chain ID:** 31337
- **Currency Symbol:** ETH

### Send ETH to Account

```bash
RECEIVER=0xYourAddress AMOUNT=100 npx hardhat run scripts/send-eth.js --network localhost
```

### Deploy Basic Token

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy Upgradeable Token

```bash
npx hardhat run scripts/deploy-proxy.js --network localhost
```

Save the proxy address from output.

### Interact with Token

```bash
PROXY_ADDRESS=0x... npx hardhat run scripts/interact.js --network localhost
```

### Upgrade to V2

```bash
PROXY_ADDRESS=0x... npx hardhat run scripts/upgrade-to-v2.js --network localhost
```

## Testing

```bash
npx hardhat test
```

## Hardhat Console

```bash
npx hardhat console --network localhost
```

Example:
```javascript
const MyToken = await ethers.getContractFactory("MyToken");
const token = await MyToken.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

await token.name();
await token.balanceOf(owner.address);
await token.transfer(addr1.address, ethers.parseEther("100"));
```

## Contract Features

### MyToken (Basic)
- ERC20 standard
- Owner-restricted minting
- Initial supply: 1,000,000 MTK

### MyTokenV1/V2 (Upgradeable)
- UUPS proxy pattern
- Upgradeable by owner
- V2 adds `version()` function

## Commands

```bash
# Compile
npx hardhat compile

# Test
npx hardhat test

# Start node
npx hardhat node

# Deploy basic
npx hardhat run scripts/deploy.js --network localhost

# Deploy upgradeable
npx hardhat run scripts/deploy-proxy.js --network localhost

# Upgrade
PROXY_ADDRESS=0x... npx hardhat run scripts/upgrade-to-v2.js --network localhost

# Interact
PROXY_ADDRESS=0x... npx hardhat run scripts/interact.js --network localhost

# Send ETH
RECEIVER=0xYourAddress AMOUNT=100 npx hardhat run scripts/send-eth.js --network localhost
```


## License

MIT
