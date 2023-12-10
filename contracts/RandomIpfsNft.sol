// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__InsufficientMintFee();
error RandomIpfsNft__WithdrawalFailed();
error RandomIpfsNft__AlreadyInitialized();

//when we mint an NFT we trigger a chainlink VRF for random number and use that random number to get the random NFT.

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    enum Breed {
        PUG,
        ShibaINU,
        StBernard
    }
    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;

    string[3] private s_tokenURIs;
    address payable private immutable i_owner;
    uint256 private constant PUG_PROBABILITY = 10; // 10% chance
    uint256 private constant SHIBAINU_PROBABILITY = 30; // 30% chance
    uint256 private constant STBERNARD_PROBABILITY = 60; // 60% chance
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private immutable i_requestConfirmations;
    uint32 private constant NUM_WORDS = 1;
    uint public immutable i_mintFee;
    mapping(uint => address) private s_requestIdToSender;
    VRFCoordinatorV2Interface private immutable i_COORDINATOR;
    bool private s_initialize;

    event NftRequests(address _sender, uint _requestId);
    event NftMint(address _sender, Breed _dogbreed, uint _tokenId);

    constructor(
        address vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations,
        uint _mintFee,
        string[3] memory _tokenURIs
    ) VRFConsumerBaseV2(vrfCoordinator) ERC721("RandomNFT", "RDMNFT") {
        i_COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        i_subscriptionId = _subscriptionId;
        i_keyHash = _keyHash;
        i_callbackGasLimit = _callbackGasLimit;
        i_requestConfirmations = _requestConfirmations;
        i_mintFee = _mintFee;
        i_owner = payable(msg.sender);
        initializeContract(_tokenURIs);
    }

    modifier checkMintFee() {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__InsufficientMintFee();
        }
        _;
    }

    function requestNFT() public payable checkMintFee returns (uint requestId) {
        requestId = i_COORDINATOR.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            i_requestConfirmations,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequests(msg.sender, requestId);
    }

    //chance function
    function RandomDogBreedNFT(uint _randomNum) public pure returns (Breed) {
        if (_randomNum < PUG_PROBABILITY) {
            return Breed.PUG;
        } else if (_randomNum < PUG_PROBABILITY + SHIBAINU_PROBABILITY) {
            return Breed.ShibaINU;
        } else {
            return Breed.StBernard;
        }
    }

    function getPrbabilityBreeds(
        string memory _breed
    ) public pure returns (uint) {
        if (keccak256(bytes(_breed)) == keccak256(bytes("pug"))) {
            return PUG_PROBABILITY;
        } else if (keccak256(bytes(_breed)) == keccak256(bytes("shibainu"))) {
            return SHIBAINU_PROBABILITY;
        } else {
            return STBERNARD_PROBABILITY;
        }
    }

    function withdraw() public onlyOwner {
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        if (!success) {
            revert RandomIpfsNft__WithdrawalFailed();
        }
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory _randomWords
    ) internal override {
        address dogOwner = s_requestIdToSender[requestId];
        uint modValue = _randomWords[0] % 100;
        Breed dogbreed = RandomDogBreedNFT(modValue);
        uint newItemId = tokenIds.current();
        _safeMint(dogOwner, newItemId);
        _setTokenURI(newItemId, s_tokenURIs[uint(dogbreed)]);
        emit NftMint(dogOwner, dogbreed, newItemId);
        tokenIds.increment();
    }

    function initializeContract(string[3] memory _dogtokenURIs) private {
        if (s_initialize) {
            revert RandomIpfsNft__AlreadyInitialized();
        }
        s_tokenURIs = _dogtokenURIs;
        s_initialize = true;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getMintFee() public view returns (uint) {
        return i_mintFee;
    }

    function getTokenURIs(uint _index) public view returns (string memory) {
        return s_tokenURIs[_index];
    }

    function getInitializationState() public view returns (bool) {
        return s_initialize;
    }

    function getRequestIdToSender(
        uint _requestId
    ) public view returns (address) {
        return s_requestIdToSender[_requestId];
    }

    function getTokenCounter() public view returns (uint) {
        return tokenIds.current();
    }
}
