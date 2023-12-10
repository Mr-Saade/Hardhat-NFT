const {ethers, deployments} = require("hardhat");

async function requestNFT() {
  console.log("Requesting NFT.....");
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const randomIpfs = await deployments.get("RandomIpfsNft");
  const randomIpfsContract = await ethers.getContractAt(
    randomIpfs.abi,
    randomIpfs.address,
    deployer
  );
  const mintFee = await randomIpfsContract.getMintFee();
  await randomIpfsContract.requestNFT({value: mintFee});
  console.log("NFT Requested!");
}
requestNFT()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
