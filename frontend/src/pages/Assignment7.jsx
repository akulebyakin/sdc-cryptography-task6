import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './Assignment.css'

// Upgradeable Token ABIs
const TOKEN_V1_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function owner() view returns (address)"
]

const TOKEN_V2_ABI = [
  ...TOKEN_V1_ABI,
  "function version() view returns (string)"
]

function Assignment7({ provider, signer, account }) {
  const [proxyAddress, setProxyAddress] = useState('')
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Token info
  const [tokenInfo, setTokenInfo] = useState({})
  const [balance, setBalance] = useState('0')
  const [version, setVersion] = useState('')

  // Form states
  const [transferTo, setTransferTo] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [mintTo, setMintTo] = useState('')
  const [mintAmount, setMintAmount] = useState('')
  const [checkAddress, setCheckAddress] = useState('')
  const [checkedBalance, setCheckedBalance] = useState('')

  useEffect(() => {
    if (contract && account) {
      loadTokenInfo()
    }
  }, [contract, account])

  const connectToProxy = async () => {
    if (!provider || !signer) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' })
      return
    }

    if (!ethers.isAddress(proxyAddress)) {
      setMessage({ type: 'error', text: 'Invalid proxy address' })
      return
    }

    try {
      setLoading(true)
      // Try V2 ABI first (includes version function)
      const tokenContract = new ethers.Contract(proxyAddress, TOKEN_V2_ABI, signer)

      // Test the connection by calling a view function
      try {
        await tokenContract.name()
      } catch (testError) {
        throw new Error('Cannot connect to proxy at this address. Make sure the proxy is deployed and Hardhat node is running.')
      }

      setContract(tokenContract)
      setMessage({ type: 'success', text: 'Connected to upgradeable token proxy!' })
      console.log('Connected to proxy:', proxyAddress)
    } catch (error) {
      console.error('Error connecting to proxy:', error)
      setMessage({ type: 'error', text: 'Failed to connect to proxy: ' + error.message })
      setContract(null)
    } finally {
      setLoading(false)
    }
  }

  const loadTokenInfo = async () => {
    if (!contract) return

    try {
      const [name, symbol, decimals, totalSupply, owner, userBalance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
        contract.owner(),
        contract.balanceOf(account)
      ])

      setTokenInfo({
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        owner
      })
      setBalance(ethers.formatUnits(userBalance, decimals))

      // Try to check version (only available in V2)
      try {
        const ver = await contract.version()
        setVersion(ver)
      } catch (e) {
        setVersion('V1 (version() not available)')
      }
    } catch (error) {
      console.error('Error loading token info:', error)
    }
  }

  const handleTransfer = async (e) => {
    e.preventDefault()
    if (!contract) return

    try {
      setLoading(true)
      setMessage({ type: 'info', text: 'Transferring tokens...' })

      const amount = ethers.parseUnits(transferAmount, tokenInfo.decimals)
      const tx = await contract.transfer(transferTo, amount)

      setMessage({ type: 'info', text: `Transaction submitted: ${tx.hash}` })
      await tx.wait()

      setMessage({ type: 'success', text: 'Transfer successful!' })
      setTransferTo('')
      setTransferAmount('')
      await loadTokenInfo()
    } catch (error) {
      console.error('Transfer error:', error)
      setMessage({ type: 'error', text: 'Transfer failed: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleMint = async (e) => {
    e.preventDefault()
    if (!contract) return

    try {
      setLoading(true)
      setMessage({ type: 'info', text: 'Minting tokens...' })

      const amount = ethers.parseUnits(mintAmount, tokenInfo.decimals)
      const tx = await contract.mint(mintTo, amount)

      setMessage({ type: 'info', text: `Transaction submitted: ${tx.hash}` })
      await tx.wait()

      setMessage({ type: 'success', text: 'Minting successful!' })
      setMintTo('')
      setMintAmount('')
      await loadTokenInfo()
    } catch (error) {
      console.error('Mint error:', error)
      setMessage({ type: 'error', text: 'Minting failed: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const checkBalance = async () => {
    if (!contract || !checkAddress) return

    try {
      const bal = await contract.balanceOf(checkAddress)
      setCheckedBalance(ethers.formatUnits(bal, tokenInfo.decimals))
      setMessage({ type: 'success', text: 'Balance checked successfully!' })
    } catch (error) {
      console.error('Balance check error:', error)
      setMessage({ type: 'error', text: 'Failed to check balance: ' + error.message })
    }
  }

  const refreshInfo = async () => {
    await loadTokenInfo()
    setMessage({ type: 'success', text: 'Information refreshed!' })
  }

  return (
    <div className="assignment-page">
      <div className="page-header">
        <h1>🔄 Assignment 7: Upgradeable Token</h1>
        <p>Interact with your upgradeable ERC20 token using UUPS proxy pattern</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Proxy Connection */}
      {!contract ? (
        <div className="card">
          <h3>Connect to Proxy</h3>
          <div className="alert alert-info">
            <strong>Note:</strong> Enter the proxy address, not the implementation address.
            The proxy address remains constant across upgrades.
          </div>
          <div className="form-group">
            <label>Proxy Address</label>
            <input
              type="text"
              value={proxyAddress}
              onChange={(e) => setProxyAddress(e.target.value)}
              placeholder="0x..."
            />
            <small>Enter the deployed proxy contract address from deployment logs</small>
          </div>
          <button
            className="btn-primary"
            onClick={connectToProxy}
            disabled={loading || !provider}
          >
            {loading ? 'Connecting...' : 'Connect to Proxy'}
          </button>
        </div>
      ) : (
        <>
          {/* Token Info */}
          <div className="card">
            <h3>Token Information</h3>
            <div className="info-display">
              <p><strong>Name:</strong> {tokenInfo.name}</p>
              <p><strong>Symbol:</strong> {tokenInfo.symbol}</p>
              <p><strong>Decimals:</strong> {tokenInfo.decimals}</p>
              <p><strong>Total Supply:</strong> {tokenInfo.totalSupply} {tokenInfo.symbol}</p>
              <p><strong>Owner:</strong> <code>{tokenInfo.owner}</code></p>
              <p><strong>Your Balance:</strong> {balance} {tokenInfo.symbol}</p>
              <p><strong>Proxy Address:</strong> <code>{proxyAddress}</code></p>
              <p><strong>Version:</strong> <span style={{
                padding: '0.25rem 0.75rem',
                background: version.includes('V2') ? '#d1fae5' : '#fef3c7',
                color: version.includes('V2') ? '#065f46' : '#92400e',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}>{version}</span></p>
            </div>
            <button className="btn-secondary" onClick={refreshInfo}>
              Refresh Information
            </button>
          </div>

          {/* Version Info Card */}
          <div className="card">
            <h3>📋 Upgrade Status</h3>
            {version.includes('V2') ? (
              <div className="alert alert-success">
                <strong>✓ Upgraded to V2!</strong>
                <p>The contract has been successfully upgraded to V2. The version() function is now available.</p>
              </div>
            ) : (
              <div className="alert alert-warning">
                <strong>⚠ Running V1</strong>
                <p>This is the initial version. After upgrading to V2, the version() function will become available.</p>
                <p style={{marginTop: '0.5rem', fontSize: '0.875rem'}}>
                  To upgrade: Use the upgrade script with PROXY_ADDRESS={proxyAddress}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-2">
            {/* Transfer */}
            <div className="card">
              <h3>Transfer Tokens</h3>
              <form onSubmit={handleTransfer}>
                <div className="form-group">
                  <label>Recipient Address</label>
                  <input
                    type="text"
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="text"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.0"
                    required
                  />
                  <small>Available: {balance} {tokenInfo.symbol}</small>
                </div>
                <button className="btn-success" type="submit" disabled={loading}>
                  Transfer
                </button>
              </form>
            </div>

            {/* Mint */}
            <div className="card">
              <h3>Mint Tokens (Owner Only)</h3>
              <form onSubmit={handleMint}>
                <div className="form-group">
                  <label>Recipient Address</label>
                  <input
                    type="text"
                    value={mintTo}
                    onChange={(e) => setMintTo(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="text"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="0.0"
                    required
                  />
                </div>
                <button className="btn-success" type="submit" disabled={loading}>
                  Mint
                </button>
              </form>
            </div>

            {/* Check Balance */}
            <div className="card">
              <h3>Check Any Balance</h3>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={checkAddress}
                  onChange={(e) => setCheckAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <button className="btn-secondary" onClick={checkBalance} disabled={!checkAddress}>
                Check Balance
              </button>
              {checkedBalance && (
                <div className="info-display" style={{marginTop: '1rem'}}>
                  <p><strong>Balance:</strong> {checkedBalance} {tokenInfo.symbol}</p>
                </div>
              )}
            </div>

            {/* Upgrade Instructions */}
            <div className="card">
              <h3>🚀 Upgrade Instructions</h3>
              <p style={{marginBottom: '1rem', color: '#6b7280'}}>
                To upgrade the contract from V1 to V2:
              </p>
              <ol style={{paddingLeft: '1.5rem', color: '#4b5563'}}>
                <li>Stop any pending transactions</li>
                <li>Run the upgrade script:
                  <code style={{display: 'block', marginTop: '0.5rem', padding: '0.5rem', background: '#f4f4f4', borderRadius: '4px'}}>
                    PROXY_ADDRESS={proxyAddress.substring(0, 10)}... npx hardhat run scripts/upgrade-to-v2.js --network localhost
                  </code>
                </li>
                <li>Refresh this page to see the new version</li>
                <li>Test the new version() function</li>
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Assignment7
