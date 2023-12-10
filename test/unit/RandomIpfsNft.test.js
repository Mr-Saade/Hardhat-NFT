const {deployments, ethers, network} = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const {assert, expect} = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("RandomIpfsNft", function () {
      console.log("Local network detected...");
      let RandomIpfsNftContract,
        deployer,
        signers,
        VRFMockCordinator,
        RandomIpfs,
        randomNftContractAddress,
        RandomIpfsNftContractTest;

      const chainId = network.config.chainId;
      const enoughMintFee = networkConfig[chainId]["mintFee"];
      const notEnoughmintFFee = ethers.parseEther("0.0001");
      beforeEach(async function () {
        signers = await ethers.getSigners();
        deployer = signers[0];
        await deployments.fixture(["mock", "RandomIpfs"]);
        RandomIpfs = await deployments.get("RandomIpfsNft");
        const VRFCoordinatorV2Mock = await deployments.get(
          "VRFCoordinatorV2Mock"
        );
        const vrfCoordinatorAddress = VRFCoordinatorV2Mock.address;
        VRFMockCordinator = await ethers.getContractAt(
          "VRFCoordinatorV2Mock",
          vrfCoordinatorAddress,
          deployer
        );

        RandomIpfsNftContract = await ethers.getContractAt(
          RandomIpfs.abi,
          RandomIpfs.address,
          deployer
        );
        RandomIpfsNftContractTest = await ethers.getContractAt(
          RandomIpfs.abi,
          RandomIpfs.address
        );

        randomNftContractAddress = await RandomIpfsNftContract.getAddress();
      });
      describe("constructor", function () {
        it("Checks for correct initiliazation", async () => {
          const isInitialized =
            await RandomIpfsNftContract.getInitializationState();
          const firstTokenURI = await RandomIpfsNftContract.getTokenURIs(0);

          assert(isInitialized);
          assert(firstTokenURI.includes("ipfs://QmRK"));
        });
      });
      describe("requestNFT", function () {
        it("checks if mintFee is enough", async () => {
          const mintFee = await RandomIpfsNftContract.getMintFee();
          await expect(
            RandomIpfsNftContract.requestNFT({value: notEnoughmintFFee})
          ).to.be.reverted;
        });

        it("checks if requestId matches the requested sender", async () => {
          const tx = await RandomIpfsNftContract.requestNFT({
            value: enoughMintFee,
          });
          const txReceipt = await tx.wait(1);
          const event = await txReceipt.logs;
          const requestId = await event[1].args[1];
          const senderAddress =
            await RandomIpfsNftContract.getRequestIdToSender(requestId);
          const signerAddress = await deployer.address;
          expect(signerAddress).to.equal(senderAddress);
        });
      });
      describe("fulfillRandomWords", function () {
        this.timeout(100000);
        it("checks if NFT is minted after a random number is returned ", async () => {
          await new Promise(async (resolve, reject) => {
            RandomIpfsNftContract.once("NftMint", async () => {
              console.log("NFT Minted Event Picked!");
              try {
                const tokenCounter =
                  await RandomIpfsNftContract.getTokenCounter();
                expect(tokenCounter).to.equal(1);
              } catch (error) {
                console.log(error);
                reject(error);
              }
              resolve();
            });
            try {
              const tx = await RandomIpfsNftContract.requestNFT({
                value: enoughMintFee,
              });
              const txReceipt = await tx.wait(1);
              const event = await txReceipt.logs;
              const requestId = await event[1].args[1];
              await VRFMockCordinator.fulfillRandomWords(
                requestId,
                randomNftContractAddress
              );
              console.log("Waiting for event to be heard.....");
            } catch (error) {
              console.log(error);
              reject(error);
            }
          });
        });
      });
      describe("RandomDogBreedNF", function () {
        it("should return a pug if randomNumber is less than 10  ", async () => {
          const breed = await RandomIpfsNftContract.RandomDogBreedNFT(8);
          expect(breed).to.equal(0);
        });
        it("should return a shibaInu if randomNumber is less than 40  ", async () => {
          const breed = await RandomIpfsNftContract.RandomDogBreedNFT(39);
          expect(breed).to.equal(1);
        });
        it("should return a StBernard if randomNumber is greater than 39 ", async () => {
          const breed = await RandomIpfsNftContract.RandomDogBreedNFT(40);
          expect(breed).to.equal(2);
        });
      });
      describe("withdraw", function () {
        it("Only owner can withdraw", async () => {
          const innitialDeployerBalance = await deployer.provider.getBalance(
            deployer.address
          );

          const additional_players = 3;
          const startingIndex = 1;
          for (
            let i = startingIndex;
            i < additional_players + startingIndex;
            i++
          ) {
            const randomNFT = RandomIpfsNftContractTest.connect(signers[i]);
            await randomNFT.requestNFT({value: enoughMintFee});
          }
          const randomNFTuser1 = RandomIpfsNftContractTest.connect(signers[1]);

          await RandomIpfsNftContract.withdraw();
          const endingDeployerBalance = await deployer.provider.getBalance(
            deployer.address
          );
          await expect(randomNFTuser1.withdraw()).to.be.reverted;
          assert(
            innitialDeployerBalance.toString() <
              endingDeployerBalance.toString()
          );
        });
      });
    });
