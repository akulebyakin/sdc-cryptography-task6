import './WalletConnect.css'

function WalletConnect({ account, network, onConnect, onDisconnect }) {
  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const getNetworkName = (network) => {
    if (!network) return ''
    const networkNames = {
      1: 'Mainnet',
      5: 'Goerli',
      11155111: 'Sepolia',
      31337: 'Localhost'
    }
    return networkNames[network.chainId] || `Chain ${network.chainId}`
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(account)
    alert('Address copied to clipboard!')
  }

  return (
    <div className="wallet-connect">
      {!account ? (
        <button className="btn-primary" onClick={onConnect}>
          Connect Wallet
        </button>
      ) : (
        <div className="wallet-info">
          <div className="network-badge">
            <span className="network-dot"></span>
            {getNetworkName(network)}
          </div>
          <div className="account-badge" onClick={copyAddress} title="Click to copy full address" style={{cursor: 'pointer'}}>
            {formatAddress(account)}
          </div>
          <button className="btn-disconnect" onClick={onDisconnect}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}

export default WalletConnect
