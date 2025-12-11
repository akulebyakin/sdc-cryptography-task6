import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './Assignment.css'

// MultiSigWallet ABI
const MULTISIG_ABI = [
  "function owners(uint256) view returns (address)",
  "function isOwner(address) view returns (bool)",
  "function numConfirmationsRequired() view returns (uint256)",
  "function getTransactionCount() view returns (uint256)",
  "function getTransaction(uint256) view returns (address to, uint256 value, bytes data, bool executed, uint256 numConfirmations)",
  "function isConfirmed(uint256, address) view returns (bool)",
  "function getOwners() view returns (address[])",
  "function submitTransaction(address to, uint256 value, bytes data)",
  "function confirmTransaction(uint256 txIndex)",
  "function executeTransaction(uint256 txIndex)",
  "function revokeConfirmation(uint256 txIndex)",
  "event Deposit(address indexed sender, uint256 amount, uint256 balance)",
  "event SubmitTransaction(address indexed owner, uint256 indexed txIndex, address indexed to, uint256 value, bytes data)",
  "event ConfirmTransaction(address indexed owner, uint256 indexed txIndex)",
  "event RevokeConfirmation(address indexed owner, uint256 indexed txIndex)",
  "event ExecuteTransaction(address indexed owner, uint256 indexed txIndex)"
]

function Assignment8({ provider, signer, account }) {
  const [walletAddress, setWalletAddress] = useState('')
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Wallet info
  const [walletInfo, setWalletInfo] = useState({})
  const [balance, setBalance] = useState('0')
  const [transactions, setTransactions] = useState([])
  const [isUserOwner, setIsUserOwner] = useState(false)

  // Form states
  const [submitTo, setSubmitTo] = useState('')
  const [submitValue, setSubmitValue] = useState('')
  const [submitData, setSubmitData] = useState('0x')
  const [selectedTx, setSelectedTx] = useState(null)

  useEffect(() => {
    if (contract && account) {
      loadWalletInfo()
    }
  }, [contract, account])

  const connectToWallet = async () => {
    if (!provider || !signer) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' })
      return
    }

    if (!ethers.isAddress(walletAddress)) {
      setMessage({ type: 'error', text: 'Invalid wallet address' })
      return
    }

    try {
      setLoading(true)
      const multiSigContract = new ethers.Contract(walletAddress, MULTISIG_ABI, signer)

      // Test the connection by calling a view function
      try {
        await multiSigContract.numConfirmationsRequired()
      } catch (testError) {
        throw new Error('Cannot connect to wallet at this address. Make sure the MultiSigWallet is deployed and Hardhat node is running.')
      }

      setContract(multiSigContract)
      setMessage({ type: 'success', text: 'Connected to MultiSig Wallet!' })
      console.log('Connected to wallet:', walletAddress)
    } catch (error) {
      console.error('Error connecting to wallet:', error)
      setMessage({ type: 'error', text: 'Failed to connect to wallet: ' + error.message })
      setContract(null)
    } finally {
      setLoading(false)
    }
  }

  const loadWalletInfo = async () => {
    if (!contract) return

    try {
      const [owners, required, txCount, walletBalance, userIsOwner] = await Promise.all([
        contract.getOwners(),
        contract.numConfirmationsRequired(),
        contract.getTransactionCount(),
        provider.getBalance(walletAddress),
        contract.isOwner(account)
      ])

      setWalletInfo({
        owners,
        required: required.toString(),
        txCount: txCount.toString()
      })
      setBalance(ethers.formatEther(walletBalance))
      setIsUserOwner(userIsOwner)

      // Load all transactions
      await loadTransactions(Number(txCount))
    } catch (error) {
      console.error('Error loading wallet info:', error)
    }
  }

  const loadTransactions = async (count) => {
    if (!contract || count === 0) {
      setTransactions([])
      return
    }

    try {
      const txs = []
      for (let i = 0; i < count; i++) {
        const tx = await contract.getTransaction(i)
        const isConfirmedByUser = account ? await contract.isConfirmed(i, account) : false
        txs.push({
          index: i,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          data: tx.data,
          executed: tx.executed,
          numConfirmations: tx.numConfirmations.toString(),
          isConfirmedByUser
        })
      }
      setTransactions(txs.reverse()) // Show newest first
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const handleSubmitTransaction = async (e) => {
    e.preventDefault()
    if (!contract) return

    try {
      setLoading(true)
      setMessage({ type: 'info', text: 'Submitting transaction...' })

      const value = ethers.parseEther(submitValue || '0')
      const tx = await contract.submitTransaction(submitTo, value, submitData)

      setMessage({ type: 'info', text: `Transaction submitted: ${tx.hash}` })
      await tx.wait()

      setMessage({ type: 'success', text: 'Transaction submitted successfully!' })
      setSubmitTo('')
      setSubmitValue('')
      setSubmitData('0x')
      await loadWalletInfo()
    } catch (error) {
      console.error('Submit error:', error)
      setMessage({ type: 'error', text: 'Submit failed: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmTransaction = async (txIndex) => {
    if (!contract) return

    try {
      setLoading(true)
      setMessage({ type: 'info', text: `Confirming transaction ${txIndex}...` })

      const tx = await contract.confirmTransaction(txIndex)
      setMessage({ type: 'info', text: `Transaction hash: ${tx.hash}` })
      await tx.wait()

      setMessage({ type: 'success', text: 'Transaction confirmed!' })
      await loadWalletInfo()
    } catch (error) {
      console.error('Confirm error:', error)
      setMessage({ type: 'error', text: 'Confirm failed: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteTransaction = async (txIndex) => {
    if (!contract) return

    try {
      setLoading(true)
      setMessage({ type: 'info', text: `Executing transaction ${txIndex}...` })

      const tx = await contract.executeTransaction(txIndex)
      setMessage({ type: 'info', text: `Transaction hash: ${tx.hash}` })
      await tx.wait()

      setMessage({ type: 'success', text: 'Transaction executed successfully!' })
      await loadWalletInfo()
    } catch (error) {
      console.error('Execute error:', error)
      setMessage({ type: 'error', text: 'Execute failed: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeConfirmation = async (txIndex) => {
    if (!contract) return

    try {
      setLoading(true)
      setMessage({ type: 'info', text: `Revoking confirmation for transaction ${txIndex}...` })

      const tx = await contract.revokeConfirmation(txIndex)
      setMessage({ type: 'info', text: `Transaction hash: ${tx.hash}` })
      await tx.wait()

      setMessage({ type: 'success', text: 'Confirmation revoked!' })
      await loadWalletInfo()
    } catch (error) {
      console.error('Revoke error:', error)
      setMessage({ type: 'error', text: 'Revoke failed: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const refreshInfo = async () => {
    await loadWalletInfo()
    setMessage({ type: 'success', text: 'Information refreshed!' })
  }

  return (
    <div className="assignment-page">
      <div className="page-header">
        <h1>🔐 Assignment 8: Multi-Signature Wallet</h1>
        <p>Manage a multi-signature wallet requiring multiple owner approvals</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Wallet Connection */}
      {!contract ? (
        <div className="card">
          <h3>Connect to Multi-Sig Wallet</h3>
          <div className="form-group">
            <label>Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
            />
            <small>Enter the deployed MultiSigWallet contract address</small>
          </div>
          <button
            className="btn-primary"
            onClick={connectToWallet}
            disabled={loading || !provider}
          >
            {loading ? 'Connecting...' : 'Connect to Wallet'}
          </button>
        </div>
      ) : (
        <>
          {/* Wallet Info */}
          <div className="card">
            <h3>Wallet Information</h3>
            <div className="info-display">
              <p><strong>Wallet Address:</strong> <code>{walletAddress}</code></p>
              <p><strong>Balance:</strong> {balance} ETH</p>
              <p><strong>Owners:</strong> {walletInfo.owners?.length || 0}</p>
              <p><strong>Required Confirmations:</strong> {walletInfo.required}</p>
              <p><strong>Total Transactions:</strong> {walletInfo.txCount}</p>
              <p><strong>Your Status:</strong> <span style={{
                padding: '0.25rem 0.75rem',
                background: isUserOwner ? '#d1fae5' : '#fee2e2',
                color: isUserOwner ? '#065f46' : '#991b1b',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}>{isUserOwner ? '✓ Owner' : '✗ Not Owner'}</span></p>
            </div>
            {walletInfo.owners && walletInfo.owners.length > 0 && (
              <details style={{marginTop: '1rem'}}>
                <summary style={{cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                  View All Owners
                </summary>
                <div style={{padding: '0.5rem', background: '#f9fafb', borderRadius: '8px'}}>
                  {walletInfo.owners.map((owner, i) => (
                    <div key={i} style={{fontFamily: 'monospace', fontSize: '0.875rem', padding: '0.25rem 0'}}>
                      {i + 1}. {owner}
                    </div>
                  ))}
                </div>
              </details>
            )}
            <button className="btn-secondary" onClick={refreshInfo} style={{marginTop: '1rem'}}>
              Refresh Information
            </button>
          </div>

          {/* Submit Transaction */}
          {isUserOwner && (
            <div className="card">
              <h3>Submit New Transaction</h3>
              <form onSubmit={handleSubmitTransaction}>
                <div className="form-group">
                  <label>Recipient Address</label>
                  <input
                    type="text"
                    value={submitTo}
                    onChange={(e) => setSubmitTo(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ETH Amount</label>
                  <input
                    type="text"
                    value={submitValue}
                    onChange={(e) => setSubmitValue(e.target.value)}
                    placeholder="0.0"
                  />
                  <small>Available: {balance} ETH</small>
                </div>
                <div className="form-group">
                  <label>Data (Optional)</label>
                  <input
                    type="text"
                    value={submitData}
                    onChange={(e) => setSubmitData(e.target.value)}
                    placeholder="0x"
                  />
                  <small>For contract calls. Use 0x for simple transfers</small>
                </div>
                <button className="btn-primary" type="submit" disabled={loading}>
                  Submit Transaction
                </button>
              </form>
            </div>
          )}

          {/* Transactions List */}
          <div className="card">
            <h3>Transactions ({transactions.length})</h3>
            {transactions.length === 0 ? (
              <p style={{color: '#6b7280', textAlign: 'center', padding: '2rem'}}>
                No transactions yet. Submit your first transaction!
              </p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {transactions.map((tx) => (
                  <div
                    key={tx.index}
                    style={{
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      background: tx.executed ? '#f9fafb' : 'white'
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem'}}>
                      <div>
                        <h4 style={{margin: '0 0 0.5rem 0', color: '#667eea'}}>
                          Transaction #{tx.index}
                        </h4>
                        <div style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          background: tx.executed ? '#d1fae5' : '#fef3c7',
                          color: tx.executed ? '#065f46' : '#92400e'
                        }}>
                          {tx.executed ? '✓ Executed' : `⏳ Pending (${tx.numConfirmations}/${walletInfo.required})`}
                        </div>
                      </div>
                    </div>

                    <div style={{fontSize: '0.875rem', color: '#4b5563'}}>
                      <p style={{margin: '0.5rem 0'}}>
                        <strong>To:</strong> <code>{tx.to}</code>
                      </p>
                      <p style={{margin: '0.5rem 0'}}>
                        <strong>Value:</strong> {tx.value} ETH
                      </p>
                      <p style={{margin: '0.5rem 0'}}>
                        <strong>Data:</strong> <code>{tx.data === '0x' ? 'None' : tx.data}</code>
                      </p>
                      <p style={{margin: '0.5rem 0'}}>
                        <strong>Confirmations:</strong> {tx.numConfirmations} / {walletInfo.required}
                      </p>
                      {isUserOwner && (
                        <p style={{margin: '0.5rem 0'}}>
                          <strong>You confirmed:</strong> {tx.isConfirmedByUser ? '✓ Yes' : '✗ No'}
                        </p>
                      )}
                    </div>

                    {isUserOwner && !tx.executed && (
                      <div style={{display: 'flex', gap: '0.75rem', marginTop: '1rem'}}>
                        {!tx.isConfirmedByUser ? (
                          <button
                            className="btn-success"
                            onClick={() => handleConfirmTransaction(tx.index)}
                            disabled={loading}
                            style={{flex: 1}}
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            className="btn-secondary"
                            onClick={() => handleRevokeConfirmation(tx.index)}
                            disabled={loading}
                            style={{flex: 1}}
                          >
                            Revoke
                          </button>
                        )}
                        {Number(tx.numConfirmations) >= Number(walletInfo.required) && (
                          <button
                            className="btn-primary"
                            onClick={() => handleExecuteTransaction(tx.index)}
                            disabled={loading}
                            style={{flex: 1}}
                          >
                            Execute
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Assignment8
