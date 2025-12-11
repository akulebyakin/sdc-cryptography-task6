import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './Assignment.css'

// MyToken ABI (ERC20 with mint function)
const MY_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function owner() view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
]

function Assignment6({ provider, signer, account }) {
  const [contractAddress, setContractAddress] = useState('')
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Token info
  const [tokenInfo, setTokenInfo] = useState({})
  const [balance, setBalance] = useState('0')

  // Form states
  const [transferTo, setTransferTo] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [mintTo, setMintTo] = useState('')
  const [mintAmount, setMintAmount] = useState('')
  const [approveSpender, setApproveSpender] = useState('')
  const [approveAmount, setApproveAmount] = useState('')
  const [checkAllowanceOwner, setCheckAllowanceOwner] = useState('')
  const [checkAllowanceSpender, setCheckAllowanceSpender] = useState('')
  const [allowance, setAllowance] = useState('0')

  useEffect(() => {
    if (contract && account) {
      loadTokenInfo()
    }
  }, [contract, account])

  const connectToContract = async () => {
    if (!provider || !signer) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' })
      return
    }

    if (!ethers.isAddress(contractAddress)) {
      setMessage({ type: 'error', text: 'Invalid contract address' })
      return
    }

    try {
      setLoading(true)

      // Check network first
      const network = await provider.getNetwork()
      console.log('Current network:', network)
      console.log('Chain ID:', network.chainId.toString())

      if (network.chainId !== 31337n) {
        throw new Error(`Wrong network! Please switch MetaMask to "Hardhat Local" (Chain ID 31337). Current Chain ID: ${network.chainId}`)
      }

      const tokenContract = new ethers.Contract(contractAddress, MY_TOKEN_ABI, signer)

      // Test the connection by calling a view function
      try {
        console.log('Testing contract connection...')
        console.log('Contract address:', contractAddress)

        const name = await tokenContract.name()
        console.log('Contract name:', name)
      } catch (testError) {
        console.error('Test error details:', testError)
        console.error('Error code:', testError.code)
        console.error('Error reason:', testError.reason)
        throw new Error(`Cannot connect to contract: ${testError.message || testError.reason || 'Unknown error'}. Make sure you're on Hardhat Local network (Chain ID 31337)`)
      }

      setContract(tokenContract)
      setMessage({ type: 'success', text: 'Connected to MyToken contract!' })
      console.log('Connected to contract:', contractAddress)
    } catch (error) {
      console.error('Error connecting to contract:', error)
      setMessage({ type: 'error', text: 'Failed to connect to contract: ' + error.message })
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

      setTokenInfo({ name, symbol, decimals: Number(decimals), totalSupply: ethers.formatUnits(totalSupply, decimals), owner })
      setBalance(ethers.formatUnits(userBalance, decimals))
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

  const handleApprove = async (e) => {
    e.preventDefault()
    if (!contract) return

    try {
      setLoading(true)
      setMessage({ type: 'info', text: 'Approving...' })

      const amount = ethers.parseUnits(approveAmount, tokenInfo.decimals)
      const tx = await contract.approve(approveSpender, amount)

      setMessage({ type: 'info', text: `Transaction submitted: ${tx.hash}` })
      await tx.wait()

      setMessage({ type: 'success', text: 'Approval successful!' })
      setApproveSpender('')
      setApproveAmount('')
    } catch (error) {
      console.error('Approve error:', error)
      setMessage({ type: 'error', text: 'Approval failed: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const checkAllowance = async () => {
    if (!contract) return

    try {
      const allowanceAmount = await contract.allowance(checkAllowanceOwner, checkAllowanceSpender)
      setAllowance(ethers.formatUnits(allowanceAmount, tokenInfo.decimals))
      setMessage({ type: 'success', text: 'Allowance checked successfully!' })
    } catch (error) {
      console.error('Allowance error:', error)
      setMessage({ type: 'error', text: 'Failed to check allowance: ' + error.message })
    }
  }

  const refreshBalance = async () => {
    if (!contract) {
      setMessage({ type: 'error', text: 'Please connect to contract first' })
      return
    }

    if (!account) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' })
      return
    }

    try {
      const userBalance = await contract.balanceOf(account)
      setBalance(ethers.formatUnits(userBalance, tokenInfo.decimals))
      await loadTokenInfo()
      setMessage({ type: 'success', text: 'Balances refreshed!' })
    } catch (error) {
      console.error('Refresh error:', error)
      setMessage({ type: 'error', text: 'Failed to refresh. Make sure contract address is correct and Hardhat node is running. Error: ' + error.message })
    }
  }

  return (
    <div className="assignment-page">
      <div className="page-header">
        <h1>🪙 Assignment 6: ERC20 Token</h1>
        <p>Interact with your MyToken contract - a basic ERC20 token with minting functionality</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Contract Connection */}
      {!contract ? (
        <div className="card">
          <h3>Connect to Contract</h3>
          <div className="form-group">
            <label>Contract Address</label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
            />
            <small>Enter the deployed MyToken contract address</small>
          </div>
          <button
            className="btn-primary"
            onClick={connectToContract}
            disabled={loading || !provider}
          >
            {loading ? 'Connecting...' : 'Connect to Contract'}
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
              <p><strong>Contract Address:</strong> <code>{contractAddress}</code></p>
            </div>
            <button className="btn-secondary" onClick={refreshBalance}>
              Refresh Balances
            </button>
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

            {/* Approve */}
            <div className="card">
              <h3>Approve Allowance</h3>
              <form onSubmit={handleApprove}>
                <div className="form-group">
                  <label>Spender Address</label>
                  <input
                    type="text"
                    value={approveSpender}
                    onChange={(e) => setApproveSpender(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="text"
                    value={approveAmount}
                    onChange={(e) => setApproveAmount(e.target.value)}
                    placeholder="0.0"
                    required
                  />
                </div>
                <button className="btn-primary" type="submit" disabled={loading}>
                  Approve
                </button>
              </form>
            </div>

            {/* Check Allowance */}
            <div className="card">
              <h3>Check Allowance</h3>
              <div className="form-group">
                <label>Owner Address</label>
                <input
                  type="text"
                  value={checkAllowanceOwner}
                  onChange={(e) => setCheckAllowanceOwner(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="form-group">
                <label>Spender Address</label>
                <input
                  type="text"
                  value={checkAllowanceSpender}
                  onChange={(e) => setCheckAllowanceSpender(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <button className="btn-secondary" onClick={checkAllowance} disabled={!checkAllowanceOwner || !checkAllowanceSpender}>
                Check Allowance
              </button>
              {allowance !== '0' && (
                <div className="info-display" style={{marginTop: '1rem'}}>
                  <p><strong>Allowance:</strong> {allowance} {tokenInfo.symbol}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Assignment6
