//test constructor, test if it mints an nft, allow users to mint nft and update appropriately, shows the correct balance and owner of an nft,
const {getNamedAccounts, deployments, ethers, network} = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const {assert, expect} = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("basicNFT", function () {
      console.log("Local network detected...");
      let basicNFTContract;
      let signer;
      const chainId = network.config.chainId;
      beforeEach(async function () {
        const {deployer} = await getNamedAccounts();
        signer = await ethers.provider.getSigner();
        await deployments.fixture(["basicNFT"]);
        const basicNFT = await deployments.get("basicNFT");

        basicNFTContract = await ethers.getContractAt(
          basicNFT.abi,
          basicNFT.address,
          signer
        );
      });
      describe("constructor", function () {
        it("Initializes our contract correctly with the NFT name, symbol and the tokenCounter", async () => {
          const tokenCounter = await basicNFTContract.getTokenCounter();
          const NFTname = await basicNFTContract.name();
          const NFTsymbol = await basicNFTContract.symbol();
          assert(tokenCounter == 0);
          assert.equal(NFTname, "DOGGIE");
          assert.equal(NFTsymbol, "DG");
        });
      });
      describe("Mints NFT", function () {
        beforeEach(async function () {
          const txMint = await basicNFTContract._Mint();
          await txMint.wait(1);
        });
        it(" allow users to mint nft and update appropriately", async () => {
          const tokenCounter = await basicNFTContract.getTokenCounter();
          const tokenURI = await basicNFTContract.tokenURI(0);
          assert.equal(tokenCounter.toString(), "1");
          assert.equal(tokenURI, await basicNFTContract.TOKEN_URI());
        });
        it("shows the correct balance and owner of an nft", async () => {
          const signerAddress = signer.address;
          const signerBalance = await basicNFTContract.balanceOf(signerAddress);
          const NFTOwner = await basicNFTContract.ownerOf(0);
          assert.equal(NFTOwner.toString(), signerAddress.toString());
          assert(signerBalance == 1);
        });
      });
    });
