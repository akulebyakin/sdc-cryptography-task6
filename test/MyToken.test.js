const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
    let myToken;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const MyToken = await ethers.getContractFactory("MyToken");
        myToken = await MyToken.deploy(ethers.parseEther("1000000"));
        await myToken.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should deploy with correct initial supply", async function () {
            expect(await myToken.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
        });

        it("Should set the right owner", async function () {
            expect(await myToken.owner()).to.equal(owner.address);
        });

        it("Should have correct name and symbol", async function () {
            expect(await myToken.name()).to.equal("MyToken");
            expect(await myToken.symbol()).to.equal("MTK");
        });
    });

    describe("Minting", function () {
        it("Should allow owner to mint tokens", async function () {
            await myToken.mint(addr1.address, ethers.parseEther("1000"));
            expect(await myToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));
        });

        it("Should increase total supply when minting", async function () {
            const initialSupply = await myToken.totalSupply();
            await myToken.mint(addr1.address, ethers.parseEther("1000"));
            expect(await myToken.totalSupply()).to.equal(initialSupply + ethers.parseEther("1000"));
        });

        it("Should not allow non-owner to mint tokens", async function () {
            await expect(
                myToken.connect(addr1).mint(addr2.address, ethers.parseEther("1000"))
            ).to.be.reverted;
        });

        it("Should not allow minting to zero address", async function () {
            await expect(
                myToken.mint(ethers.ZeroAddress, ethers.parseEther("1000"))
            ).to.be.reverted;
        });
    });

    describe("Transfers", function () {
        it("Should transfer tokens between accounts", async function () {
            await myToken.transfer(addr1.address, ethers.parseEther("100"));
            expect(await myToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));

            await myToken.connect(addr1).transfer(addr2.address, ethers.parseEther("50"));
            expect(await myToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("50"));
            expect(await myToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("50"));
        });

        it("Should fail when sender doesn't have enough tokens", async function () {
            const initialOwnerBalance = await myToken.balanceOf(owner.address);

            await expect(
                myToken.connect(addr1).transfer(owner.address, ethers.parseEther("1"))
            ).to.be.reverted;

            expect(await myToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
        });

        it("Should not allow transfer to zero address", async function () {
            await expect(
                myToken.transfer(ethers.ZeroAddress, ethers.parseEther("100"))
            ).to.be.reverted;
        });

        it("Should update balances correctly after transfer", async function () {
            const ownerInitialBalance = await myToken.balanceOf(owner.address);

            await myToken.transfer(addr1.address, ethers.parseEther("100"));

            expect(await myToken.balanceOf(owner.address)).to.equal(
                ownerInitialBalance - ethers.parseEther("100")
            );
            expect(await myToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
        });
    });

    describe("Allowance", function () {
        it("Should approve and transferFrom correctly", async function () {
            await myToken.approve(addr1.address, ethers.parseEther("100"));
            expect(await myToken.allowance(owner.address, addr1.address)).to.equal(ethers.parseEther("100"));

            await myToken.connect(addr1).transferFrom(owner.address, addr2.address, ethers.parseEther("50"));
            expect(await myToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("50"));
            expect(await myToken.allowance(owner.address, addr1.address)).to.equal(ethers.parseEther("50"));
        });

        it("Should fail transferFrom when allowance is insufficient", async function () {
            await myToken.approve(addr1.address, ethers.parseEther("50"));

            await expect(
                myToken.connect(addr1).transferFrom(owner.address, addr2.address, ethers.parseEther("100"))
            ).to.be.reverted;
        });
    });
});
