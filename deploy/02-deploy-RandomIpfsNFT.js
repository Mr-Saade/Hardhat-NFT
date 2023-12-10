const {networkConfig} = require("../helper-hardhat-config");
const {network, ethers} = require("hardhat");
const {verify} = require("../utils/verify");
const {pinMetadataToIPFS} = require("../utils/pinToIPFS");
require("dotenv").config();

module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy, log} = deployments;
  const {deployer} = await getNamedAccounts();
  const signer = await ethers.provider.getSigner();
  const chainId = network.config.chainId.toString();
  let vrfcoordinatorAddress, subId, VRFCoordinatorV2Mock, tokenURIs;
  const UPLOAD_T0_PINATA = process.env.UPLOAD_T0_PINATA;

  if (chainId === "31337") {
    VRFCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2Mock");
    vrfcoordinatorAddress = VRFCoordinatorV2Mock.address;
    V2MockContractFactory = await ethers.getContractAt(
      "VRFCoordinatorV2Mock",
      vrfcoordinatorAddress,
      signer
    );

    const transactionResponse =
      await V2MockContractFactory.createSubscription();

    const transactionReceipt = await transactionResponse.wait();
    const events = await transactionReceipt.logs;
    subId = await events[0].args.subId;
    await V2MockContractFactory.fundSubscription(
      subId,
      ethers.parseEther("50")
    );
  } else {
    vrfcoordinatorAddress = networkConfig[chainId]["vrfcoordinatorAddress"];
    subId = networkConfig[chainId]["subId"];

    log(
      "Deploying RandomIpfsNFT Contract and awaiting 6 block confirmations...."
    );
  }
  mintFee = networkConfig[chainId]["mintFee"];
  keyHash = networkConfig[chainId]["keyhash"];
  callbackGasLimit = networkConfig[chainId]["CALLBACK_GAS_LIMIT"];
  requestConfirmations = networkConfig[chainId]["REQUEST_CONFIRMATIONS"];
  tokenURIs = [
    "ipfs://QmRKVK4Xu14q2PkwEHfMHC7p5gca29y7Hw7FdYbj4GmBUk",
    "ipfs://QmarKQSVLRkQinRNJMZQjcPmntp1hE5VNoPyiYcYWuDcm9",
    "ipfs://QmT3xD62XyZzVpU1FAdyzQV7J29AXw3dWxkqpnK688eL3j",
  ];

  if (UPLOAD_T0_PINATA == "true") {
    //it was set to true once in my env for uploading to pinata for pinning on IPFS to grab the ipfs hashses
    tokenURIs = await pinMetadataToIPFS();
  }

  const RandomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: [
      vrfcoordinatorAddress,
      subId,
      keyHash,
      callbackGasLimit,
      requestConfirmations,
      mintFee,
      tokenURIs,
    ],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("---------------------------------------");
  if (chainId === "31337") {
    VRFCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2Mock");
    V2MockContractFactory = await ethers.getContractAt(
      "VRFCoordinatorV2Mock",
      VRFCoordinatorV2Mock.address
    );
    log("Adding consumer to subscription.........");
    await V2MockContractFactory.addConsumer(subId, RandomIpfsNft.address);

    log(`Consumer added successfully. SubId: ${subId}`);
  }

  if (chainId !== "31337" && process.env.ETHERSCAN_API_KEY) {
    log("Verifying RandomIpfsNFT contract.....");
    await verify(vrfcoordinatorAddress, [
      vrfcoordinatorAddress,
      subId,
      keyHash,
      callbackGasLimit,
      requestConfirmations,
      mintFee,
      tokenURIs,
    ]);
  }
};
module.exports.tags = ["all", "RandomIpfs"];
