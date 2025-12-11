const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiSigWallet", function () {
    let multiSig;
    let owner1, owner2, owner3, nonOwner;
    let owners;
    const NUM_CONFIRMATIONS_REQUIRED = 2;

    beforeEach(async function () {
        [owner1, owner2, owner3, nonOwner] = await ethers.getSigners();
        owners = [owner1.address, owner2.address, owner3.address];

        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        multiSig = await MultiSigWallet.deploy(owners, NUM_CONFIRMATIONS_REQUIRED);
        await multiSig.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct owners", async function () {
            const contractOwners = await multiSig.getOwners();
            expect(contractOwners).to.deep.equal(owners);
        });

        it("Should set the correct number of confirmations required", async function () {
            expect(await multiSig.numConfirmationsRequired()).to.equal(NUM_CONFIRMATIONS_REQUIRED);
        });

        it("Should mark addresses as owners", async function () {
            expect(await multiSig.isOwner(owner1.address)).to.be.true;
            expect(await multiSig.isOwner(owner2.address)).to.be.true;
            expect(await multiSig.isOwner(owner3.address)).to.be.true;
            expect(await multiSig.isOwner(nonOwner.address)).to.be.false;
        });

        it("Should revert if no owners provided", async function () {
            const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
            await expect(
                MultiSigWallet.deploy([], NUM_CONFIRMATIONS_REQUIRED)
            ).to.be.revertedWith("owners required");
        });

        it("Should revert if confirmations required is zero", async function () {
            const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
            await expect(
                MultiSigWallet.deploy(owners, 0)
            ).to.be.revertedWith("invalid number of required confirmations");
        });

        it("Should revert if confirmations required exceeds owner count", async function () {
            const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
            await expect(
                MultiSigWallet.deploy(owners, 4)
            ).to.be.revertedWith("invalid number of required confirmations");
        });

        it("Should revert if owner is zero address", async function () {
            const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
            await expect(
                MultiSigWallet.deploy([ethers.ZeroAddress, owner2.address], 1)
            ).to.be.revertedWith("invalid owner");
        });

        it("Should revert if duplicate owners", async function () {
            const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
            await expect(
                MultiSigWallet.deploy([owner1.address, owner1.address], 1)
            ).to.be.revertedWith("owner not unique");
        });
    });

    describe("Deposits", function () {
        it("Should accept deposits", async function () {
            const depositAmount = ethers.parseEther("1");

            await expect(
                owner1.sendTransaction({
                    to: await multiSig.getAddress(),
                    value: depositAmount
                })
            ).to.changeEtherBalance(multiSig, depositAmount);
        });

        it("Should emit Deposit event", async function () {
            const depositAmount = ethers.parseEther("1");

            await expect(
                owner1.sendTransaction({
                    to: await multiSig.getAddress(),
                    value: depositAmount
                })
            ).to.emit(multiSig, "Deposit")
             .withArgs(owner1.address, depositAmount, depositAmount);
        });
    });

    describe("Submit Transaction", function () {
        it("Should allow owner to submit transaction", async function () {
            const to = nonOwner.address;
            const value = ethers.parseEther("1");
            const data = "0x";

            await multiSig.connect(owner1).submitTransaction(to, value, data);

            const txCount = await multiSig.getTransactionCount();
            expect(txCount).to.equal(1);

            const tx = await multiSig.getTransaction(0);
            expect(tx.to).to.equal(to);
            expect(tx.value).to.equal(value);
            expect(tx.data).to.equal(data);
            expect(tx.executed).to.be.false;
            expect(tx.numConfirmations).to.equal(0);
        });

        it("Should emit SubmitTransaction event", async function () {
            const to = nonOwner.address;
            const value = ethers.parseEther("1");
            const data = "0x";

            await expect(
                multiSig.connect(owner1).submitTransaction(to, value, data)
            ).to.emit(multiSig, "SubmitTransaction")
             .withArgs(owner1.address, 0, to, value, data);
        });

        it("Should not allow non-owner to submit transaction", async function () {
            await expect(
                multiSig.connect(nonOwner).submitTransaction(nonOwner.address, 0, "0x")
            ).to.be.revertedWith("not owner");
        });
    });

    describe("Confirm Transaction", function () {
        beforeEach(async function () {
            const to = nonOwner.address;
            const value = ethers.parseEther("1");
            const data = "0x";
            await multiSig.connect(owner1).submitTransaction(to, value, data);
        });

        it("Should allow owner to confirm transaction", async function () {
            await multiSig.connect(owner1).confirmTransaction(0);

            const tx = await multiSig.getTransaction(0);
            expect(tx.numConfirmations).to.equal(1);
            expect(await multiSig.isConfirmed(0, owner1.address)).to.be.true;
        });

        it("Should emit ConfirmTransaction event", async function () {
            await expect(
                multiSig.connect(owner1).confirmTransaction(0)
            ).to.emit(multiSig, "ConfirmTransaction")
             .withArgs(owner1.address, 0);
        });

        it("Should not allow non-owner to confirm", async function () {
            await expect(
                multiSig.connect(nonOwner).confirmTransaction(0)
            ).to.be.revertedWith("not owner");
        });

        it("Should not allow double confirmation", async function () {
            await multiSig.connect(owner1).confirmTransaction(0);

            await expect(
                multiSig.connect(owner1).confirmTransaction(0)
            ).to.be.revertedWith("tx already confirmed");
        });

        it("Should not confirm non-existent transaction", async function () {
            await expect(
                multiSig.connect(owner1).confirmTransaction(999)
            ).to.be.revertedWith("tx does not exist");
        });
    });

    describe("Execute Transaction", function () {
        beforeEach(async function () {
            await owner1.sendTransaction({
                to: await multiSig.getAddress(),
                value: ethers.parseEther("10")
            });
        });

        it("Should execute transaction with enough confirmations", async function () {
            const to = nonOwner.address;
            const value = ethers.parseEther("1");
            const data = "0x";

            await multiSig.connect(owner1).submitTransaction(to, value, data);
            await multiSig.connect(owner1).confirmTransaction(0);
            await multiSig.connect(owner2).confirmTransaction(0);

            await expect(
                multiSig.connect(owner1).executeTransaction(0)
            ).to.changeEtherBalances(
                [multiSig, nonOwner],
                [ethers.parseEther("-1"), ethers.parseEther("1")]
            );

            const tx = await multiSig.getTransaction(0);
            expect(tx.executed).to.be.true;
        });

        it("Should emit ExecuteTransaction event", async function () {
            await multiSig.connect(owner1).submitTransaction(nonOwner.address, ethers.parseEther("1"), "0x");
            await multiSig.connect(owner1).confirmTransaction(0);
            await multiSig.connect(owner2).confirmTransaction(0);

            await expect(
                multiSig.connect(owner1).executeTransaction(0)
            ).to.emit(multiSig, "ExecuteTransaction")
             .withArgs(owner1.address, 0);
        });

        it("Should not execute without enough confirmations", async function () {
            await multiSig.connect(owner1).submitTransaction(nonOwner.address, ethers.parseEther("1"), "0x");
            await multiSig.connect(owner1).confirmTransaction(0);

            await expect(
                multiSig.connect(owner1).executeTransaction(0)
            ).to.be.revertedWith("cannot execute tx");
        });

        it("Should not execute already executed transaction", async function () {
            await multiSig.connect(owner1).submitTransaction(nonOwner.address, ethers.parseEther("1"), "0x");
            await multiSig.connect(owner1).confirmTransaction(0);
            await multiSig.connect(owner2).confirmTransaction(0);
            await multiSig.connect(owner1).executeTransaction(0);

            await expect(
                multiSig.connect(owner1).executeTransaction(0)
            ).to.be.revertedWith("tx already executed");
        });

        it("Should not allow non-owner to execute", async function () {
            await multiSig.connect(owner1).submitTransaction(nonOwner.address, ethers.parseEther("1"), "0x");
            await multiSig.connect(owner1).confirmTransaction(0);
            await multiSig.connect(owner2).confirmTransaction(0);

            await expect(
                multiSig.connect(nonOwner).executeTransaction(0)
            ).to.be.revertedWith("not owner");
        });
    });

    describe("Revoke Confirmation", function () {
        beforeEach(async function () {
            await multiSig.connect(owner1).submitTransaction(nonOwner.address, ethers.parseEther("1"), "0x");
            await multiSig.connect(owner1).confirmTransaction(0);
        });

        it("Should allow owner to revoke confirmation", async function () {
            await multiSig.connect(owner1).revokeConfirmation(0);

            const tx = await multiSig.getTransaction(0);
            expect(tx.numConfirmations).to.equal(0);
            expect(await multiSig.isConfirmed(0, owner1.address)).to.be.false;
        });

        it("Should emit RevokeConfirmation event", async function () {
            await expect(
                multiSig.connect(owner1).revokeConfirmation(0)
            ).to.emit(multiSig, "RevokeConfirmation")
             .withArgs(owner1.address, 0);
        });

        it("Should not revoke if not confirmed", async function () {
            await expect(
                multiSig.connect(owner2).revokeConfirmation(0)
            ).to.be.revertedWith("tx not confirmed");
        });

        it("Should not revoke executed transaction", async function () {
            await owner1.sendTransaction({
                to: await multiSig.getAddress(),
                value: ethers.parseEther("10")
            });
            await multiSig.connect(owner2).confirmTransaction(0);
            await multiSig.connect(owner1).executeTransaction(0);

            await expect(
                multiSig.connect(owner1).revokeConfirmation(0)
            ).to.be.revertedWith("tx already executed");
        });
    });

    describe("View Functions", function () {
        it("Should return correct transaction count", async function () {
            expect(await multiSig.getTransactionCount()).to.equal(0);

            await multiSig.connect(owner1).submitTransaction(nonOwner.address, 0, "0x");
            expect(await multiSig.getTransactionCount()).to.equal(1);

            await multiSig.connect(owner1).submitTransaction(nonOwner.address, 0, "0x");
            expect(await multiSig.getTransactionCount()).to.equal(2);
        });

        it("Should return correct owners", async function () {
            const contractOwners = await multiSig.getOwners();
            expect(contractOwners).to.deep.equal(owners);
        });
    });
});
