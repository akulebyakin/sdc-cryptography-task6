# Assignment 9 - Implementation Status

## ✅ COMPLETED

### 1. Smart Contracts
- **SoulboundVisitCardERC721.sol**
  - Location: `contracts/SoulboundVisitCardERC721.sol`
  - Features: Soulbound (non-transferable), one card per address, stores student info
  - Status: ✅ Compiled successfully, all 32 tests passing

- **GameCharacterCollectionERC1155.sol**
  - Location: `contracts/GameCharacterCollectionERC1155.sol`
  - Features: 10 character types, batch operations, individual token URIs
  - Status: ✅ Compiled successfully, all 38 tests passing

### 2. Test Files
- **assignment9/test/SoulboundVisitCard.test.js** - ✅ 32/32 tests passing
- **assignment9/test/GameCharacterCollection.test.js** - ✅ 38/38 tests passing

### 3. Deployment Scripts
- **assignment9/scripts/deploy-soulbound.js** - ✅ Complete with example minting

## 🔨 IN PROGRESS / TODO

### 4. Deploy Game Characters Script
**File**: `assignment9/scripts/deploy-game-characters.js`

**What it needs to do**:
1. Deploy GameCharacterCollectionERC1155 with base URI
2. Create all 10 character types with attributes:
   - 0: Warrior (Red, Str:95, Spd:60, Common)
   - 1: Mage (Blue, Str:40, Spd:85, Rare)
   - 2: Dwarf (Brown, Str:90, Spd:45, Common)
   - 3: Healer (White, Str:35, Spd:65, Rare)
   - 4: Archer (Green, Str:55, Spd:80, Common)
   - 5: Rogue (Black, Str:50, Spd:95, Epic)
   - 6: Paladin (Gold, Str:85, Spd:50, Legendary)
   - 7: Gold Coin (Gold, Str:0, Spd:0, Common)
   - 8: Silver Coin (Silver, Str:0, Spd:0, Common)
   - 9: Legendary Sword (Purple, Str:0, Spd:0, Legendary)
3. Batch mint 10 NFTs (1 of each) to deployer
4. Transfer 2 NFTs to student wallet
5. Display final balances

**Template**:
```javascript
const { ethers } = require("hardhat");

async function main() {
    const [deployer, student] = await ethers.getSigners();

    console.log("Deploying with:", deployer.address);

    const baseURI = "https://raw.githubusercontent.com/yourusername/metadata/";

    const GameCollection = await ethers.getContractFactory("GameCharacterCollectionERC1155");
    const collection = await GameCollection.deploy(baseURI);
    await collection.deployed();

    console.log("Deployed to:", collection.address);

    // Create all 10 characters (see list above)
    // Use collection.createCharacter(id, attributes, tokenURI)

    // Batch mint
    const tokenIds = [0,1,2,3,4,5,6,7,8,9];
    const amounts = [1,1,1,1,1,1,1,1,1,1];
    await collection.mintBatch(deployer.address, tokenIds, amounts);

    // Transfer 2 to student
    await collection.safeBatchTransferFrom(deployer.address, student.address, [0,1], [1,1], "0x");

    console.log("Save this address:", collection.address);
}
```

### 5. Metadata Files
**Location**: `assignment9/metadata/`

**Visit Card Template** (`visit-card/metadata-template.json`):
```json
{
  "name": "Student Visit Card - [Name]",
  "description": "Soulbound student visit card for [Name]",
  "image": "data:image/png;base64,[BASE64_DATA]",
  "attributes": [
    {"trait_type": "Student Name", "value": "[Name]"},
    {"trait_type": "Year", "value": "[Year]"},
    {"trait_type": "Course", "value": "[Course]"},
    {"trait_type": "Soulbound", "value": "Yes"}
  ]
}
```

**Game Character Metadata** (`game-items/0.json` through `9.json`):
- Create 10 JSON files, one for each character
- Example for Warrior (0.json):
```json
{
  "name": "Warrior",
  "description": "A brave warrior with high strength",
  "image": "https://placeholder.com/warrior.png",
  "attributes": [
    {"trait_type": "Character Type", "value": "Warrior"},
    {"trait_type": "Color", "value": "Red"},
    {"trait_type": "Strength", "value": 95},
    {"trait_type": "Speed", "value": 60},
    {"trait_type": "Rarity", "value": "Common"}
  ]
}
```

### 6. Frontend Component
**File**: `frontend/src/pages/Assignment9.jsx`

**This is the most complex remaining task.** The component needs:

**Imports**:
```javascript
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './Assignment.css'
```

**ABIs** (extract from compiled artifacts):
```javascript
const SOULBOUND_ABI = [
  "function mintCard(address to, string memory uri, string name, string year, string course)",
  "function hasMintedCard(address) view returns (bool)",
  "function tokenOfOwner(address) view returns (uint256)",
  "function getStudentInfo(uint256) view returns (tuple(string name, string year, string course, uint256 mintTimestamp))",
  "function tokenURI(uint256) view returns (string)",
  "function owner() view returns (address)",
  "event CardMinted(address indexed student, uint256 indexed tokenId, string name, string year, string course)"
]

const GAME_COLLECTION_ABI = [
  "function createCharacter(uint256 tokenId, tuple(string characterType, string color, uint256 speed, uint256 strength, string rarity, bool exists) attributes, string tokenURI)",
  "function mint(address to, uint256 tokenId, uint256 amount)",
  "function mintBatch(address to, uint256[] tokenIds, uint256[] amounts)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function getCharacterAttributes(uint256) view returns (tuple(string characterType, string color, uint256 speed, uint256 strength, string rarity, bool exists))",
  "function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)",
  "function owner() view returns (address)",
  "event CharacterCreated(uint256 indexed tokenId, string characterType, string rarity)"
]
```

**Key Features to Implement**:

1. **Image Upload Handler**:
```javascript
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file || !file.type.startsWith('image/')) {
    setMessage({ type: 'error', text: 'Please select an image file' })
    return
  }
  if (file.size > 1024 * 1024) { // 1MB limit
    setMessage({ type: 'error', text: 'Image too large. Max 1MB' })
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    setCardImage(e.target.result) // base64 data URI
    setMessage({ type: 'success', text: 'Image loaded' })
  }
  reader.readAsDataURL(file)
}
```

2. **Metadata Generation**:
```javascript
const generateMetadata = (name, year, course, imageBase64) => {
  const metadata = {
    name: `Student Visit Card - ${name}`,
    description: `Soulbound student visit card for ${name}`,
    image: imageBase64,
    attributes: [
      { trait_type: "Student Name", value: name },
      { trait_type: "Year", value: year },
      { trait_type: "Course", value: course },
      { trait_type: "Soulbound", value: "Yes" },
      { trait_type: "Mint Date", value: new Date().toISOString() }
    ]
  }

  const jsonString = JSON.stringify(metadata)
  const base64Json = btoa(unescape(encodeURIComponent(jsonString)))
  return `data:application/json;base64,${base64Json}`
}
```

3. **Mint Soulbound Card**:
```javascript
const handleMintCard = async (e) => {
  e.preventDefault()
  if (!soulboundContract || !cardImage) {
    setMessage({ type: 'error', text: 'Please upload an image first' })
    return
  }

  try {
    setLoading(true)
    const tokenURI = generateMetadata(studentName, studentYear, studentCourse, cardImage)

    const tx = await soulboundContract.mintCard(
      account,
      tokenURI,
      studentName,
      studentYear,
      studentCourse
    )

    setMessage({ type: 'info', text: `Transaction: ${tx.hash}` })
    await tx.wait()
    setMessage({ type: 'success', text: 'Card minted!' })

    // Clear form and reload
    setStudentName('')
    setStudentYear('')
    setStudentCourse('')
    setCardImage(null)
    await loadOwnedCard()
  } catch (error) {
    setMessage({ type: 'error', text: error.message })
  } finally {
    setLoading(false)
  }
}
```

4. **Load Owned Card**:
```javascript
const loadOwnedCard = async () => {
  if (!soulboundContract || !account) return

  try {
    const hasCard = await soulboundContract.hasMintedCard(account)
    if (!hasCard) {
      setOwnedCard(null)
      return
    }

    const tokenId = await soulboundContract.tokenOfOwner(account)
    const tokenURI = await soulboundContract.tokenURI(tokenId)
    const studentInfo = await soulboundContract.getStudentInfo(tokenId)

    // Decode base64 metadata
    let metadata = {}
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64Data = tokenURI.split(',')[1]
      const jsonString = decodeURIComponent(escape(atob(base64Data)))
      metadata = JSON.parse(jsonString)
    }

    setOwnedCard({
      tokenId: tokenId.toString(),
      metadata,
      studentInfo: {
        name: studentInfo.name,
        year: studentInfo.year,
        course: studentInfo.course,
        mintTimestamp: new Date(Number(studentInfo.mintTimestamp) * 1000).toLocaleDateString()
      }
    })
  } catch (error) {
    console.error('Error loading card:', error)
  }
}
```

5. **Load Game Characters**:
```javascript
const loadGameCharacters = async () => {
  if (!gameContract || !account) return

  try {
    const characters = []
    for (let i = 0; i < 10; i++) {
      const balance = await gameContract.balanceOf(account, i)
      if (balance.gt(0)) {
        const attrs = await gameContract.getCharacterAttributes(i)
        characters.push({
          tokenId: i,
          balance: balance.toString(),
          characterType: attrs.characterType,
          color: attrs.color,
          speed: attrs.speed.toString(),
          strength: attrs.strength.toString(),
          rarity: attrs.rarity
        })
      }
    }
    setOwnedCharacters(characters)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

**UI Structure**:
```jsx
return (
  <div className="assignment-page">
    <h1>Assignment 9: NFT Standards</h1>

    {/* Soulbound Section */}
    <div className="card">
      <h2>Soulbound Student Visit Card (ERC-721)</h2>

      {/* Contract connection */}
      <input
        value={soulboundAddress}
        onChange={(e) => setSoulboundAddress(e.target.value)}
        placeholder="Contract address"
      />
      <button onClick={connectSoulbound}>Connect</button>

      {soulboundContract && (
        <>
          {/* Mint form (if owner) */}
          <form onSubmit={handleMintCard}>
            <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Name" />
            <select value={studentYear} onChange={e => setStudentYear(e.target.value)}>
              <option value="">Select Year</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
            </select>
            <input value={studentCourse} onChange={e => setStudentCourse(e.target.value)} placeholder="Course" />

            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {cardImage && <img src={cardImage} alt="Preview" style={{maxWidth: '200px'}} />}

            <button type="submit" disabled={loading}>Mint Card</button>
          </form>

          {/* Display owned card */}
          {ownedCard && (
            <div>
              <h3>Your Card</h3>
              {ownedCard.metadata.image && <img src={ownedCard.metadata.image} alt="Card" />}
              <p>Name: {ownedCard.studentInfo.name}</p>
              <p>Year: {ownedCard.studentInfo.year}</p>
              <p>Course: {ownedCard.studentInfo.course}</p>
              <p>Minted: {ownedCard.studentInfo.mintTimestamp}</p>
              <span style={{color: '#ef4444'}}>🔒 SOULBOUND - Cannot be transferred</span>
            </div>
          )}
        </>
      )}
    </div>

    {/* Game Characters Section */}
    <div className="card">
      <h2>Game Character Collection (ERC-1155)</h2>

      {/* Connection + Minting (similar pattern) */}

      {/* Display owned characters */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem'}}>
        {ownedCharacters.map(char => (
          <div key={char.tokenId} style={{border: '1px solid #ccc', padding: '1rem', borderRadius: '8px'}}>
            <h4>{char.characterType}</h4>
            <p>ID: {char.tokenId}</p>
            <p>Balance: {char.balance}</p>
            <p>Color: {char.color}</p>
            <p>Strength: {char.strength}</p>
            <p>Speed: {char.speed}</p>
            <span style={{
              background: char.rarity === 'Legendary' ? '#fbbf24' : char.rarity === 'Epic' ? '#a78bfa' : '#d1d5db',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px'
            }}>{char.rarity}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)
```

### 7. Update App.jsx
**File**: `frontend/src/App.jsx`

Add the import and route:
```javascript
import Assignment9 from './pages/Assignment9'

// In nav:
<Link to="/assignment9">Assignment 9</Link>

// In Routes:
<Route path="/assignment9" element={<Assignment9 provider={provider} signer={signer} account={account} />} />
```

### 8. README Documentation
**File**: `assignment9/README.md`

Should include:
- Overview of both contracts
- Setup instructions
- Deployment commands
- How to use the frontend
- Metadata explanation
- Transaction proof examples
- Troubleshooting

### 9. Image Upload Instructions
**Files**:
- `assignment9/images/visit-card/README.md`
- `assignment9/images/game-items/README.md`

## Quick Start Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test assignment9/test/*.js

# Deploy (start node first)
npx hardhat node
# In another terminal:
npx hardhat run assignment9/scripts/deploy-soulbound.js --network localhost
npx hardhat run assignment9/scripts/deploy-game-characters.js --network localhost

# Start frontend
cd frontend
npm run dev
```

## Contract Addresses (Update After Deployment)
- **Soulbound Card**: `0x...`
- **Game Collection**: `0x...`

## Notes
- All contracts compatible with OpenZeppelin v4.9.6
- Base64 encoding used for on-chain metadata (Soulbound)
- ERC-1155 uses external metadata URLs
- All tests passing (70 total tests)
