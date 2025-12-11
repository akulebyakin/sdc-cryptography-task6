import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>🎓 Smart Contracts Lab Interface</h1>
        <p className="hero-subtitle">
          Interactive web interface for Assignments 6, 7 & 8
        </p>
      </div>

      <div className="assignments-grid">
        <Link to="/assignment6" className="assignment-card">
          <div className="assignment-icon">🪙</div>
          <h2>Assignment 6</h2>
          <h3>ERC20 Token</h3>
          <p>Basic ERC20 token with minting functionality</p>
          <ul className="feature-list">
            <li>Deploy MyToken contract</li>
            <li>Mint new tokens</li>
            <li>Transfer tokens</li>
            <li>Check balances</li>
            <li>Approve & transfer from</li>
          </ul>
          <div className="assignment-badge">View Interface →</div>
        </Link>

        <Link to="/assignment7" className="assignment-card">
          <div className="assignment-icon">🔄</div>
          <h2>Assignment 7</h2>
          <h3>Upgradeable Token</h3>
          <p>Upgradeable ERC20 using UUPS proxy pattern</p>
          <ul className="feature-list">
            <li>Deploy with proxy</li>
            <li>Interact with V1</li>
            <li>Upgrade to V2</li>
            <li>Verify state preservation</li>
            <li>Test new features</li>
          </ul>
          <div className="assignment-badge">View Interface →</div>
        </Link>

        <Link to="/assignment8" className="assignment-card">
          <div className="assignment-icon">🔐</div>
          <h2>Assignment 8</h2>
          <h3>Multi-Sig Wallet</h3>
          <p>Multi-signature wallet requiring multiple approvals</p>
          <ul className="feature-list">
            <li>Deploy multi-sig wallet</li>
            <li>Submit transactions</li>
            <li>Confirm transactions</li>
            <li>Execute transactions</li>
            <li>Revoke confirmations</li>
          </ul>
          <div className="assignment-badge">View Interface →</div>
        </Link>
      </div>

      <div className="info-section">
        <div className="card">
          <h3>📋 Prerequisites</h3>
          <ul>
            <li>Install MetaMask browser extension</li>
            <li>Connect to Hardhat local network (localhost:8545)</li>
            <li>Run <code>npx hardhat node</code> in the project directory</li>
            <li>Deploy contracts using the provided scripts</li>
          </ul>
        </div>

        <div className="card">
          <h3>🚀 Getting Started</h3>
          <ol>
            <li>Click "Connect Wallet" in the navigation bar</li>
            <li>Select MetaMask and approve the connection</li>
            <li>Choose an assignment from the cards above</li>
            <li>Enter the deployed contract address</li>
            <li>Start interacting with your smart contracts!</li>
          </ol>
        </div>

        <div className="card">
          <h3>⚠️ Important Notes</h3>
          <ul>
            <li>This interface works with locally deployed contracts</li>
            <li>Make sure Hardhat node is running before interacting</li>
            <li>Use test accounts provided by Hardhat</li>
            <li>All transactions require MetaMask approval</li>
            <li>Check console for detailed logs and errors</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home
