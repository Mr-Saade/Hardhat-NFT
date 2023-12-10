const fs = require("fs");
const path = require("path");
require("dotenv").config();
const JWT = process.env.PINATA_API_JWTKEY;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const pinataSDK = require("@pinata/sdk");
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

const pinFileToIPFS = async () => {
  console.log("Uploading files to Pinata.....");

  let responses = [];
  const AbsolutePath = path.resolve("images/randomNFT");
  const files = fs.readdirSync(AbsolutePath);
  try {
    for (const fileIndex in files) {
      const readableStreamForFile = fs.createReadStream(
        `${AbsolutePath}/${files[fileIndex]}`
      );
      const options = {
        pinataMetadata: {
          name: files[fileIndex],
        },
      };
      const res = await pinata.pinFileToIPFS(readableStreamForFile, options);
      responses.push(res);
    }
  } catch (error) {
    console.log(error);
  }

  console.log("Files pined!");
  return {responses, files};
};

const pinMetadataToIPFS = async () => {
  let tokenURIs = [];
  console.log("Uploading Metadata to Pinata.....");
  const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
      {
        trait_type: "Cuteness",
        value: 100,
      },
    ],
  };

  const {responses: imageFiles, files} = await pinFileToIPFS();

  let PinataMetadata = {...metadataTemplate};

  try {
    for (const imageindex in imageFiles) {
      PinataMetadata.name = files[imageindex].replace("png", "");
      PinataMetadata.description = `An adorable ${PinataMetadata.name} pupi`;
      PinataMetadata.image = `ipfs://${imageFiles[imageindex].IpfsHash}`;
      const options = {
        pinataMetadata: {
          name: PinataMetadata.name,
        },
      };
      const res = await pinata.pinJSONToIPFS(PinataMetadata, options);
      tokenURIs.push(`ipfs://${res.IpfsHash}`);
    }
  } catch (error) {
    console.log(error);
  }

  console.log("Metadata pined!");
  return tokenURIs;
};

module.exports = {pinFileToIPFS, pinMetadataToIPFS};
