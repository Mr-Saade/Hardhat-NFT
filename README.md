# RandomIpfsNft Smart Contract

The **RandomIpfsNft Smart Contract** is a decentralized application (DApp) built on Ethereum that mints random NFTs hosted on IPFS using the Pinata API service. It leverages Chainlink VRF (Verifiable Random Function) for secure and verifiable randomness.

## Table of Contents

- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Quickstart](#quickstart)
- [Usage](#usage)
  - [Deploying](#deploying)
  - [Testing](#testing)
  - [Test Coverage](#test-coverage)
  - [Deployment to Testnet or Mainnet](#deployment-to-testnet-or-mainnet)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Setup Chainlink VRF](#setup-chainlink-vrf)
- [Requesting NFTs](#requesting-nfts)
- [Estimate Gas Cost in USD](#estimate-gas-cost-in-usd)
- [Verify on Etherscan](#verify-on-etherscan)
- [Linting](#linting)

## Getting Started

### Requirements

To set up and use the Lottery Smart Contract, you'll need the following:

- `git`
- `Node.js`
- `Yarn` (instead of npm)

Make sure you have these tools installed by running `git --version`, `node --version`, and `yarn --version`.

### Quickstart

1. Clone the repository:

   ```sh
   git clone https://github.com/Mr-Saade/Hardhat-NFT
   cd Hardhat-NFT
   ```

2. Install dependencies:

```sh
yarn
```

## Usage

### Deploying

Deploy the Lottery Smart Contract using the following command:

```sh
yarn hardhat deploy
```

### Testing

Run tests to ensure the contract's functionality:

```sh
yarn hardhat test
```

### Test Coverage

Generate a test coverage report:

```sh
yarn hardhat coverage
```

### Deployment to Testnet or Mainnet

1. Set up environment variables using `.env` file (see [Environment Variables](#environment-variables)).
2. Deploy the contract to the desired network:

```sh
yarn hardhat deploy --network yourNetwork
```

## Configuration

### Environment Variables

Create a `.env` file with the following environment variables:

- `PRIVATE_KEY`: Private key of your Ethereum account (from Metamask).
- `SEPOLIA_RPC_URL`: URL of the Sepolia testnet node.
- `COINMARKETCAP_API_KEY`: API key from CoinMarketCap for gas cost estimation.
- `ETHERSCAN_API_KEY`: API key from Etherscan for contract verification.
- `PINATA_API_KEY` : API key from Pinata for interacting with Pinata SDK.
- `PINATA_API_SECRET`: API Secret from Pinata for uploading NFTs to Pinata for pinning on IPFS.
- `UPLOAD_T0_PINATA`: Set to "true" if you want to pin file and metadata to IPFS using Pinata.

### Setup Chainlink VRF

1. Obtain a subscription ID from vrf.chain.link.
2. Fund your subscription with LINK.
3. Add the subscription ID to `helper-hardhat-config.js`

### Requesting NFTs

To participate and mint a random NFT, run the following command:

```sh
yarn hardhat run scripts/requestNFT.js --network yourNetwork
```

## Estimate Gas Cost in USD

For a USD estimation of gas cost, set up `COINMARKETCAP_API_KEY` environment variable (see [Environment Variables](#environment-variables)). Uncomment the line `coinmarketcap: COINMARKETCAP_API_KEY` in `hardhat.config.js`.

## Verify on Etherscan

To verify the contract on Etherscan manually, set up `ETHERSCAN_API_KEY` environment variable (see [Environment Variables](#environment-variables)). Use the following command:

```sh
yarn hardhat verify --constructor-args arguments.js DEPLOYED_CONTRACT_ADDRESS
```

## Linting

Check and fix code formatting using the following commands:

```sh
yarn lint
yarn lint:fix
```

## Note

This smart contract is intended for educational purposes and demonstrates the implementation of Randomly generated NFTs hosted on an IPFS system through the Pinata service using Chainlink VRF and Pinata SDK. Before deploying the contract on a live network, thorough testing and security audits are recommended.

## THANK YOU.
