import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { ethers } from 'ethers'
import './App.css'

// Import components
import WalletConnect from './components/WalletConnect'
import Assignment6 from './pages/Assignment6'
import Assignment7 from './pages/Assignment7'
import Assignment8 from './pages/Assignment8'
import Home from './pages/Home'

function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState('')
  const [network, setNetwork] = useState(null)

  // Connect to wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!')
        return
      }

      // First, try to switch to Hardhat Local network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }], // 0x7a69 = 31337 in hex
        })
      } catch (switchError) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x7a69',
                chainName: 'Hardhat Local',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                }
              }]
            })
          } catch (addError) {
            console.error('Error adding network:', addError)
            alert('Failed to add Hardhat Local network. Please add it manually.')
            return
          }
        } else {
          console.error('Error switching network:', switchError)
        }
      }

      // Request account access - this will prompt MetaMask
      await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      // Create new provider and signer for the current account
      const tempProvider = new ethers.BrowserProvider(window.ethereum)
      const tempSigner = await tempProvider.getSigner()
      const tempNetwork = await tempProvider.getNetwork()

      // Get the actual address from signer (this is the currently selected account)
      const signerAddress = await tempSigner.getAddress()

      setProvider(tempProvider)
      setSigner(tempSigner)
      setAccount(signerAddress)
      setNetwork(tempNetwork)

      console.log('✅ Connected to:', signerAddress)
      console.log('Network:', tempNetwork)
      console.log('If this is the wrong account, switch accounts in MetaMask and the UI will update automatically.')
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet: ' + error.message)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null)
    setSigner(null)
    setAccount('')
    setNetwork(null)
  }

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          // Re-initialize provider and signer with new account
          try {
            const tempProvider = new ethers.BrowserProvider(window.ethereum)
            const tempSigner = await tempProvider.getSigner()
            const tempNetwork = await tempProvider.getNetwork()

            setProvider(tempProvider)
            setSigner(tempSigner)
            setAccount(accounts[0])
            setNetwork(tempNetwork)

            console.log('Account changed to:', accounts[0])
          } catch (error) {
            console.error('Error updating account:', error)
          }
        } else {
          disconnectWallet()
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
  }, [])

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <h2>🔐 Smart Contracts Lab</h2>
          </div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/assignment6">Assignment 6</Link>
            <Link to="/assignment7">Assignment 7</Link>
            <Link to="/assignment8">Assignment 8</Link>
          </div>
          <WalletConnect
            account={account}
            network={network}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
          />
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/assignment6"
              element={
                <Assignment6
                  provider={provider}
                  signer={signer}
                  account={account}
                />
              }
            />
            <Route
              path="/assignment7"
              element={
                <Assignment7
                  provider={provider}
                  signer={signer}
                  account={account}
                />
              }
            />
            <Route
              path="/assignment8"
              element={
                <Assignment8
                  provider={provider}
                  signer={signer}
                  account={account}
                />
              }
            />
          </Routes>
        </main>

        <footer className="footer">
          <p>Smart Contracts Lab - Assignments 6, 7 & 8</p>
          <p>Built with React + Ethers.js + Vite</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
