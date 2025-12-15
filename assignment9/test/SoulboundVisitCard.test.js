const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulboundVisitCardERC721", function () {
  let soulboundCard;
  let owner;
  let student1;
  let student2;
  let student3;

  const SAMPLE_TOKEN_URI = "data:application/json;base64,eyJuYW1lIjoiVGVzdCBDYXJkIn0=";
  const STUDENT_NAME = "Alice Smith";
  const STUDENT_YEAR = "Junior";
  const STUDENT_COURSE = "Computer Science";

  beforeEach(async function () {
    [owner, student1, student2, student3] = await ethers.getSigners();

    const SoulboundCard = await ethers.getContractFactory("SoulboundVisitCardERC721");
    soulboundCard = await SoulboundCard.deploy();
    await soulboundCard.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await soulboundCard.name()).to.equal("Student Visit Card");
      expect(await soulboundCard.symbol()).to.equal("SVC");
    });

    it("Should set the deployer as owner", async function () {
      expect(await soulboundCard.owner()).to.equal(owner.address);
    });

    it("Should start with zero tokens", async function () {
      expect(await soulboundCard.hasMintedCard(student1.address)).to.be.false;
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint card to student", async function () {
      const tx = await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        STUDENT_NAME,
        STUDENT_YEAR,
        STUDENT_COURSE
      );

      await expect(tx)
        .to.emit(soulboundCard, "CardMinted")
        .withArgs(student1.address, 0, STUDENT_NAME, STUDENT_YEAR, STUDENT_COURSE);

      expect(await soulboundCard.hasMintedCard(student1.address)).to.be.true;
      expect(await soulboundCard.ownerOf(0)).to.equal(student1.address);
    });

    it("Should store student data correctly", async function () {
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        STUDENT_NAME,
        STUDENT_YEAR,
        STUDENT_COURSE
      );

      const studentInfo = await soulboundCard.getStudentInfo(0);
      expect(studentInfo.name).to.equal(STUDENT_NAME);
      expect(studentInfo.year).to.equal(STUDENT_YEAR);
      expect(studentInfo.course).to.equal(STUDENT_COURSE);
      expect(studentInfo.mintTimestamp).to.be.gt(0);
    });

    it("Should set tokenURI correctly", async function () {
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        STUDENT_NAME,
        STUDENT_YEAR,
        STUDENT_COURSE
      );

      expect(await soulboundCard.tokenURI(0)).to.equal(SAMPLE_TOKEN_URI);
    });

    it("Should increment token ID for each mint", async function () {
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        "Student 1",
        STUDENT_YEAR,
        STUDENT_COURSE
      );

      await soulboundCard.mintCard(
        student2.address,
        SAMPLE_TOKEN_URI,
        "Student 2",
        STUDENT_YEAR,
        STUDENT_COURSE
      );

      expect(await soulboundCard.ownerOf(0)).to.equal(student1.address);
      expect(await soulboundCard.ownerOf(1)).to.equal(student2.address);
    });

    it("Should map owner to token ID correctly", async function () {
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        STUDENT_NAME,
        STUDENT_YEAR,
        STUDENT_COURSE
      );

      expect(await soulboundCard.ownerToTokenId(student1.address)).to.equal(0);
    });

    it("Should return token ID via tokenOfOwner", async function () {
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        STUDENT_NAME,
        STUDENT_YEAR,
        STUDENT_COURSE
      );

      expect(await soulboundCard.tokenOfOwner(student1.address)).to.equal(0);
    });

    it("Should prevent minting to same address twice", async function () {
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        STUDENT_NAME,
        STUDENT_YEAR,
        STUDENT_COURSE
      );

      await expect(
        soulboundCard.mintCard(
          student1.address,
          SAMPLE_TOKEN_URI,
          "Another Card",
          STUDENT_YEAR,
          STUDENT_COURSE
        )
      ).to.be.revertedWithCustomError(soulboundCard, "AlreadyMinted");
    });

    it("Should prevent non-owner from minting", async function () {
      await expect(
        soulboundCard.connect(student1).mintCard(
          student2.address,
          SAMPLE_TOKEN_URI,
          STUDENT_NAME,
          STUDENT_YEAR,
          STUDENT_COURSE
        )
      ).to.be.reverted;
    });
  });

  describe("Soulbound Behavior - Transfer Restrictions", function () {
    beforeEach(async function () {
      // Mint a card to student1 for testing transfers
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        STUDENT_NAME,
        STUDENT_YEAR,
        STUDENT_COURSE
      );
    });

    it("Should prevent transferFrom", async function () {
      await expect(
        soulboundCard.connect(student1).transferFrom(student1.address, student2.address, 0)
      ).to.be.revertedWithCustomError(soulboundCard, "SoulboundToken");
    });

    it("Should prevent safeTransferFrom (with data)", async function () {
      await expect(
        soulboundCard.connect(student1)["safeTransferFrom(address,address,uint256,bytes)"](
          student1.address,
          student2.address,
          0,
          "0x"
        )
      ).to.be.revertedWithCustomError(soulboundCard, "SoulboundToken");
    });

    it("Should prevent safeTransferFrom (without data)", async function () {
      await expect(
        soulboundCard.connect(student1)["safeTransferFrom(address,address,uint256)"](
          student1.address,
          student2.address,
          0
        )
      ).to.be.revertedWithCustomError(soulboundCard, "SoulboundToken");
    });

    it("Should prevent transfer by third party even with approval attempt", async function () {
      // First, attempting to approve should fail
      await expect(
        soulboundCard.connect(student1).approve(student3.address, 0)
      ).to.be.revertedWithCustomError(soulboundCard, "SoulboundToken");
    });
  });

  describe("Soulbound Behavior - Approval Restrictions", function () {
    beforeEach(async function () {
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        STUDENT_NAME,
        STUDENT_YEAR,
        STUDENT_COURSE
      );
    });

    it("Should prevent approve", async function () {
      await expect(
        soulboundCard.connect(student1).approve(student2.address, 0)
      ).to.be.revertedWithCustomError(soulboundCard, "SoulboundToken");
    });

    it("Should prevent setApprovalForAll", async function () {
      await expect(
        soulboundCard.connect(student1).setApprovalForAll(student2.address, true)
      ).to.be.revertedWithCustomError(soulboundCard, "SoulboundToken");
    });

    it("Should return address(0) for getApproved", async function () {
      expect(await soulboundCard.getApproved(0)).to.equal(ethers.ZeroAddress);
    });

    it("Should return false for isApprovedForAll", async function () {
      expect(await soulboundCard.isApprovedForAll(student1.address, student2.address)).to.be.false;
    });
  });

  describe("Metadata Updates", function () {
    beforeEach(async function () {
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        STUDENT_NAME,
        STUDENT_YEAR,
        STUDENT_COURSE
      );
    });

    it("Should allow owner to update metadata", async function () {
      const newName = "Alice Johnson";
      const newYear = "Senior";
      const newCourse = "Software Engineering";

      const tx = await soulboundCard.updateMetadata(0, newName, newYear, newCourse);

      await expect(tx)
        .to.emit(soulboundCard, "MetadataUpdated")
        .withArgs(0, newName, newYear, newCourse);

      const studentInfo = await soulboundCard.getStudentInfo(0);
      expect(studentInfo.name).to.equal(newName);
      expect(studentInfo.year).to.equal(newYear);
      expect(studentInfo.course).to.equal(newCourse);
    });

    it("Should allow token holder to update their metadata", async function () {
      const newName = "Alice Updated";

      await soulboundCard.connect(student1).updateMetadata(0, newName, STUDENT_YEAR, STUDENT_COURSE);

      const studentInfo = await soulboundCard.getStudentInfo(0);
      expect(studentInfo.name).to.equal(newName);
    });

    it("Should prevent non-authorized users from updating metadata", async function () {
      await expect(
        soulboundCard.connect(student2).updateMetadata(0, "Hacker", STUDENT_YEAR, STUDENT_COURSE)
      ).to.be.revertedWithCustomError(soulboundCard, "NotAuthorized");
    });

    it("Should prevent updating metadata for non-existent token", async function () {
      await expect(
        soulboundCard.updateMetadata(999, "Test", STUDENT_YEAR, STUDENT_COURSE)
      ).to.be.revertedWithCustomError(soulboundCard, "TokenDoesNotExist");
    });
  });

  describe("View Functions", function () {
    it("Should return student info for valid token", async function () {
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        STUDENT_NAME,
        STUDENT_YEAR,
        STUDENT_COURSE
      );

      const info = await soulboundCard.getStudentInfo(0);
      expect(info.name).to.equal(STUDENT_NAME);
      expect(info.year).to.equal(STUDENT_YEAR);
      expect(info.course).to.equal(STUDENT_COURSE);
    });

    it("Should revert getStudentInfo for non-existent token", async function () {
      await expect(
        soulboundCard.getStudentInfo(999)
      ).to.be.revertedWithCustomError(soulboundCard, "TokenDoesNotExist");
    });

    it("Should revert tokenOfOwner for address without card", async function () {
      await expect(
        soulboundCard.tokenOfOwner(student1.address)
      ).to.be.revertedWithCustomError(soulboundCard, "TokenDoesNotExist");
    });

    it("Should return correct tokenURI", async function () {
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        STUDENT_NAME,
        STUDENT_YEAR,
        STUDENT_COURSE
      );

      expect(await soulboundCard.tokenURI(0)).to.equal(SAMPLE_TOKEN_URI);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle empty strings in student data", async function () {
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        "",
        "",
        ""
      );

      const info = await soulboundCard.getStudentInfo(0);
      expect(info.name).to.equal("");
      expect(info.year).to.equal("");
      expect(info.course).to.equal("");
    });

    it("Should handle very long strings", async function () {
      const longString = "A".repeat(1000);

      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        longString,
        longString,
        longString
      );

      const info = await soulboundCard.getStudentInfo(0);
      expect(info.name).to.equal(longString);
    });

    it("Should track hasMintedCard correctly for multiple addresses", async function () {
      await soulboundCard.mintCard(
        student1.address,
        SAMPLE_TOKEN_URI,
        "Student 1",
        STUDENT_YEAR,
        STUDENT_COURSE
      );

      expect(await soulboundCard.hasMintedCard(student1.address)).to.be.true;
      expect(await soulboundCard.hasMintedCard(student2.address)).to.be.false;
      expect(await soulboundCard.hasMintedCard(student3.address)).to.be.false;
    });
  });

  describe("supportsInterface", function () {
    it("Should support ERC721 interface", async function () {
      // ERC721 interface ID: 0x80ac58cd
      expect(await soulboundCard.supportsInterface("0x80ac58cd")).to.be.true;
    });

    it("Should support ERC721Metadata interface", async function () {
      // ERC721Metadata interface ID: 0x5b5e139f
      expect(await soulboundCard.supportsInterface("0x5b5e139f")).to.be.true;
    });
  });
});
