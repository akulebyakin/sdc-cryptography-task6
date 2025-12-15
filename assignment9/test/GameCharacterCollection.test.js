const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameCharacterCollectionERC1155", function () {
  let gameCollection;
  let owner;
  let player1;
  let player2;
  let player3;

  const BASE_URI = "https://api.example.com/metadata/";

  // Character data for testing
  const WARRIOR = {
    id: 0,
    type: "Warrior",
    color: "Red",
    speed: 60,
    strength: 95,
    rarity: "Common"
  };

  const MAGE = {
    id: 1,
    type: "Mage",
    color: "Blue",
    speed: 85,
    strength: 40,
    rarity: "Rare"
  };

  const DWARF = {
    id: 2,
    type: "Dwarf",
    color: "Brown",
    speed: 45,
    strength: 90,
    rarity: "Common"
  };

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();

    const GameCollection = await ethers.getContractFactory("GameCharacterCollectionERC1155");
    gameCollection = await GameCollection.deploy(BASE_URI);
    await gameCollection.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await gameCollection.name()).to.equal("Game Character Collection");
      expect(await gameCollection.symbol()).to.equal("GCC");
    });

    it("Should set the deployer as owner", async function () {
      expect(await gameCollection.owner()).to.equal(owner.address);
    });

    it("Should set MAX_TOKEN_ID to 9", async function () {
      expect(await gameCollection.MAX_TOKEN_ID()).to.equal(9);
    });

    it("Should store base URI correctly", async function () {
      // The base URI is stored internally, we can verify via uri() after creating a character
      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        "" // Empty token URI to test base URI fallback
      );

      const uri = await gameCollection.uri(WARRIOR.id);
      expect(uri).to.include(BASE_URI);
    });
  });

  describe("Character Creation", function () {
    it("Should allow owner to create character", async function () {
      const tx = await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        `${BASE_URI}${WARRIOR.id}.json`
      );

      await expect(tx)
        .to.emit(gameCollection, "CharacterCreated")
        .withArgs(WARRIOR.id, WARRIOR.type, WARRIOR.rarity);
    });

    it("Should store character attributes correctly", async function () {
      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        `${BASE_URI}${WARRIOR.id}.json`
      );

      const attrs = await gameCollection.getCharacterAttributes(WARRIOR.id);
      expect(attrs.characterType).to.equal(WARRIOR.type);
      expect(attrs.color).to.equal(WARRIOR.color);
      expect(attrs.speed).to.equal(WARRIOR.speed);
      expect(attrs.strength).to.equal(WARRIOR.strength);
      expect(attrs.rarity).to.equal(WARRIOR.rarity);
      expect(attrs.exists).to.be.true;
    });

    it("Should set token URI correctly", async function () {
      const tokenURI = `${BASE_URI}${WARRIOR.id}.json`;

      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        tokenURI
      );

      expect(await gameCollection.uri(WARRIOR.id)).to.equal(tokenURI);
    });

    it("Should mark character as existing", async function () {
      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        `${BASE_URI}${WARRIOR.id}.json`
      );

      expect(await gameCollection.exists(WARRIOR.id)).to.be.true;
      expect(await gameCollection.exists(5)).to.be.false;
    });

    it("Should prevent creating duplicate character IDs", async function () {
      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        `${BASE_URI}${WARRIOR.id}.json`
      );

      await expect(
        gameCollection.createCharacter(
          WARRIOR.id,
          {
            characterType: "Duplicate",
            color: "Black",
            speed: 50,
            strength: 50,
            rarity: "Common",
            exists: true
          },
          `${BASE_URI}${WARRIOR.id}.json`
        )
      ).to.be.revertedWithCustomError(gameCollection, "CharacterAlreadyExists");
    });

    it("Should prevent creating character with ID > 9", async function () {
      await expect(
        gameCollection.createCharacter(
          10,
          {
            characterType: "Invalid",
            color: "Black",
            speed: 50,
            strength: 50,
            rarity: "Common",
            exists: true
          },
          `${BASE_URI}10.json`
        )
      ).to.be.revertedWithCustomError(gameCollection, "InvalidTokenId");
    });

    it("Should prevent non-owner from creating characters", async function () {
      await expect(
        gameCollection.connect(player1).createCharacter(
          WARRIOR.id,
          {
            characterType: WARRIOR.type,
            color: WARRIOR.color,
            speed: WARRIOR.speed,
            strength: WARRIOR.strength,
            rarity: WARRIOR.rarity,
            exists: true
          },
          `${BASE_URI}${WARRIOR.id}.json`
        )
      ).to.be.reverted;
    });
  });

  describe("Minting - Single", function () {
    beforeEach(async function () {
      // Create Warrior character
      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        `${BASE_URI}${WARRIOR.id}.json`
      );
    });

    it("Should allow owner to mint single token", async function () {
      await gameCollection.mint(player1.address, WARRIOR.id, 5);

      expect(await gameCollection.balanceOf(player1.address, WARRIOR.id)).to.equal(5);
    });

    it("Should track total minted", async function () {
      await gameCollection.mint(player1.address, WARRIOR.id, 3);
      await gameCollection.mint(player2.address, WARRIOR.id, 2);

      expect(await gameCollection.totalMinted(WARRIOR.id)).to.equal(5);
    });

    it("Should prevent minting non-existent character", async function () {
      await expect(
        gameCollection.mint(player1.address, 5, 1)
      ).to.be.revertedWithCustomError(gameCollection, "CharacterDoesNotExist");
    });

    it("Should prevent non-owner from minting", async function () {
      await expect(
        gameCollection.connect(player1).mint(player2.address, WARRIOR.id, 1)
      ).to.be.reverted;
    });
  });

  describe("Minting - Batch", function () {
    beforeEach(async function () {
      // Create multiple characters
      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        `${BASE_URI}${WARRIOR.id}.json`
      );

      await gameCollection.createCharacter(
        MAGE.id,
        {
          characterType: MAGE.type,
          color: MAGE.color,
          speed: MAGE.speed,
          strength: MAGE.strength,
          rarity: MAGE.rarity,
          exists: true
        },
        `${BASE_URI}${MAGE.id}.json`
      );

      await gameCollection.createCharacter(
        DWARF.id,
        {
          characterType: DWARF.type,
          color: DWARF.color,
          speed: DWARF.speed,
          strength: DWARF.strength,
          rarity: DWARF.rarity,
          exists: true
        },
        `${BASE_URI}${DWARF.id}.json`
      );
    });

    it("Should allow batch minting multiple tokens", async function () {
      const tokenIds = [WARRIOR.id, MAGE.id, DWARF.id];
      const amounts = [2, 3, 1];

      const tx = await gameCollection.mintBatch(player1.address, tokenIds, amounts);

      await expect(tx)
        .to.emit(gameCollection, "BatchMinted")
        .withArgs(player1.address, tokenIds, amounts);

      expect(await gameCollection.balanceOf(player1.address, WARRIOR.id)).to.equal(2);
      expect(await gameCollection.balanceOf(player1.address, MAGE.id)).to.equal(3);
      expect(await gameCollection.balanceOf(player1.address, DWARF.id)).to.equal(1);
    });

    it("Should track total minted for each token in batch", async function () {
      const tokenIds = [WARRIOR.id, MAGE.id, DWARF.id];
      const amounts = [2, 3, 1];

      await gameCollection.mintBatch(player1.address, tokenIds, amounts);

      expect(await gameCollection.totalMinted(WARRIOR.id)).to.equal(2);
      expect(await gameCollection.totalMinted(MAGE.id)).to.equal(3);
      expect(await gameCollection.totalMinted(DWARF.id)).to.equal(1);
    });

    it("Should revert if arrays length mismatch", async function () {
      const tokenIds = [WARRIOR.id, MAGE.id];
      const amounts = [2, 3, 1]; // One extra amount

      await expect(
        gameCollection.mintBatch(player1.address, tokenIds, amounts)
      ).to.be.revertedWith("Arrays length mismatch");
    });

    it("Should prevent batch minting non-existent character", async function () {
      const tokenIds = [WARRIOR.id, 5]; // Token 5 doesn't exist
      const amounts = [2, 1];

      await expect(
        gameCollection.mintBatch(player1.address, tokenIds, amounts)
      ).to.be.revertedWithCustomError(gameCollection, "CharacterDoesNotExist");
    });

    it("Should prevent non-owner from batch minting", async function () {
      const tokenIds = [WARRIOR.id, MAGE.id];
      const amounts = [2, 3];

      await expect(
        gameCollection.connect(player1).mintBatch(player2.address, tokenIds, amounts)
      ).to.be.reverted;
    });
  });

  describe("Transfers - Single", function () {
    beforeEach(async function () {
      // Create and mint Warrior to player1
      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        `${BASE_URI}${WARRIOR.id}.json`
      );

      await gameCollection.mint(player1.address, WARRIOR.id, 5);
    });

    it("Should allow token owner to transfer", async function () {
      await gameCollection.connect(player1).safeTransferFrom(
        player1.address,
        player2.address,
        WARRIOR.id,
        2,
        "0x"
      );

      expect(await gameCollection.balanceOf(player1.address, WARRIOR.id)).to.equal(3);
      expect(await gameCollection.balanceOf(player2.address, WARRIOR.id)).to.equal(2);
    });

    it("Should allow approved operator to transfer", async function () {
      await gameCollection.connect(player1).setApprovalForAll(player3.address, true);

      await gameCollection.connect(player3).safeTransferFrom(
        player1.address,
        player2.address,
        WARRIOR.id,
        2,
        "0x"
      );

      expect(await gameCollection.balanceOf(player1.address, WARRIOR.id)).to.equal(3);
      expect(await gameCollection.balanceOf(player2.address, WARRIOR.id)).to.equal(2);
    });

    it("Should prevent unauthorized transfer", async function () {
      await expect(
        gameCollection.connect(player2).safeTransferFrom(
          player1.address,
          player2.address,
          WARRIOR.id,
          2,
          "0x"
        )
      ).to.be.reverted;
    });
  });

  describe("Transfers - Batch", function () {
    beforeEach(async function () {
      // Create multiple characters and mint to player1
      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        `${BASE_URI}${WARRIOR.id}.json`
      );

      await gameCollection.createCharacter(
        MAGE.id,
        {
          characterType: MAGE.type,
          color: MAGE.color,
          speed: MAGE.speed,
          strength: MAGE.strength,
          rarity: MAGE.rarity,
          exists: true
        },
        `${BASE_URI}${MAGE.id}.json`
      );

      await gameCollection.mintBatch(player1.address, [WARRIOR.id, MAGE.id], [5, 3]);
    });

    it("Should allow batch transfer", async function () {
      await gameCollection.connect(player1).safeBatchTransferFrom(
        player1.address,
        player2.address,
        [WARRIOR.id, MAGE.id],
        [2, 1],
        "0x"
      );

      expect(await gameCollection.balanceOf(player1.address, WARRIOR.id)).to.equal(3);
      expect(await gameCollection.balanceOf(player1.address, MAGE.id)).to.equal(2);
      expect(await gameCollection.balanceOf(player2.address, WARRIOR.id)).to.equal(2);
      expect(await gameCollection.balanceOf(player2.address, MAGE.id)).to.equal(1);
    });

    it("Should allow batch transfer via batchTransfer function", async function () {
      await gameCollection.connect(player1).batchTransfer(
        player1.address,
        player2.address,
        [WARRIOR.id, MAGE.id],
        [2, 1]
      );

      expect(await gameCollection.balanceOf(player1.address, WARRIOR.id)).to.equal(3);
      expect(await gameCollection.balanceOf(player2.address, WARRIOR.id)).to.equal(2);
    });

    it("Should prevent unauthorized batch transfer", async function () {
      await expect(
        gameCollection.connect(player2).batchTransfer(
          player1.address,
          player2.address,
          [WARRIOR.id, MAGE.id],
          [2, 1]
        )
      ).to.be.revertedWith("Not authorized");
    });

    it("Should allow batch transfer by approved operator", async function () {
      await gameCollection.connect(player1).setApprovalForAll(player3.address, true);

      await gameCollection.connect(player3).batchTransfer(
        player1.address,
        player2.address,
        [WARRIOR.id, MAGE.id],
        [2, 1]
      );

      expect(await gameCollection.balanceOf(player2.address, WARRIOR.id)).to.equal(2);
      expect(await gameCollection.balanceOf(player2.address, MAGE.id)).to.equal(1);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        `${BASE_URI}${WARRIOR.id}.json`
      );
    });

    it("Should return character attributes", async function () {
      const attrs = await gameCollection.getCharacterAttributes(WARRIOR.id);
      expect(attrs.characterType).to.equal(WARRIOR.type);
      expect(attrs.exists).to.be.true;
    });

    it("Should revert getCharacterAttributes for non-existent character", async function () {
      await expect(
        gameCollection.getCharacterAttributes(5)
      ).to.be.revertedWithCustomError(gameCollection, "CharacterDoesNotExist");
    });

    it("Should return correct exists status", async function () {
      expect(await gameCollection.exists(WARRIOR.id)).to.be.true;
      expect(await gameCollection.exists(5)).to.be.false;
    });

    it("Should return correct URI", async function () {
      const uri = await gameCollection.uri(WARRIOR.id);
      expect(uri).to.equal(`${BASE_URI}${WARRIOR.id}.json`);
    });

    it("Should return all balances via balanceOfBatch", async function () {
      await gameCollection.mint(player1.address, WARRIOR.id, 5);

      const balances = await gameCollection.balanceOfBatch(player1.address);

      expect(balances.length).to.equal(10); // 0-9
      expect(balances[WARRIOR.id]).to.equal(5);
      expect(balances[1]).to.equal(0);
    });
  });

  describe("Admin Functions", function () {
    beforeEach(async function () {
      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        `${BASE_URI}${WARRIOR.id}.json`
      );
    });

    it("Should allow owner to update base URI", async function () {
      const newBaseURI = "ipfs://newcollection/";
      await gameCollection.setBaseURI(newBaseURI);

      // Create character with empty URI to test base URI
      await gameCollection.createCharacter(
        MAGE.id,
        {
          characterType: MAGE.type,
          color: MAGE.color,
          speed: MAGE.speed,
          strength: MAGE.strength,
          rarity: MAGE.rarity,
          exists: true
        },
        "" // Empty URI
      );

      const uri = await gameCollection.uri(MAGE.id);
      expect(uri).to.include(newBaseURI);
    });

    it("Should allow owner to update token URI", async function () {
      const newURI = "ipfs://newhash/warrior.json";
      await gameCollection.setTokenURI(WARRIOR.id, newURI);

      expect(await gameCollection.uri(WARRIOR.id)).to.equal(newURI);
    });

    it("Should prevent non-owner from updating base URI", async function () {
      await expect(
        gameCollection.connect(player1).setBaseURI("ipfs://hack/")
      ).to.be.reverted;
    });

    it("Should prevent updating URI for non-existent character", async function () {
      await expect(
        gameCollection.setTokenURI(5, "ipfs://fake/")
      ).to.be.revertedWithCustomError(gameCollection, "CharacterDoesNotExist");
    });
  });

  describe("URI Fallback Behavior", function () {
    it("Should use individual URI if set", async function () {
      const customURI = "ipfs://customhash/warrior.json";

      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        customURI
      );

      expect(await gameCollection.uri(WARRIOR.id)).to.equal(customURI);
    });

    it("Should use base URI + tokenId if individual URI not set", async function () {
      await gameCollection.createCharacter(
        WARRIOR.id,
        {
          characterType: WARRIOR.type,
          color: WARRIOR.color,
          speed: WARRIOR.speed,
          strength: WARRIOR.strength,
          rarity: WARRIOR.rarity,
          exists: true
        },
        "" // Empty individual URI
      );

      const uri = await gameCollection.uri(WARRIOR.id);
      expect(uri).to.equal(`${BASE_URI}${WARRIOR.id}.json`);
    });
  });
});
