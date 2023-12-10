const {networkConfig} = require("../helper-hardhat-config");
const {network, ethers} = require("hardhat");
const {verify} = require("../utils/verify.js");
require("dotenv").config();
module.exports = async ({getNamedAccounts, deployments}) => {
  console.log("Deploying basicNFT contract....");
  const chainId = network.config.chainId.toString();
  const {deploy, log} = deployments;
  const {deployer} = await getNamedAccounts();
  const basicNFT = await deploy("basicNFT", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("---------------------------------------");
  log("Deployed Successfully!");

  if (chainId !== "31337" && process.env.ETHERSCAN_API_KEY) {
    log("Verifying Lottery contract.....");
    await verify(basicNFT.address, []);
  }
};
module.exports.tags = ["all", "basicNFT"];
