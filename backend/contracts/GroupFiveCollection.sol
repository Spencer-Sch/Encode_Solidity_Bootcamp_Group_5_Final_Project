// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';

error GroupFiveCollection__AlreadyInitialized();
error GroupFiveCollection__RangeOutOfBounds();

contract GroupFiveCollection is VRFConsumerBaseV2, ERC721URIStorage, AccessControl {
    // Chainlink VRF Variables
    // Read more here: https://docs.chain.link/vrf/v2/subscription/examples/get-a-random-number
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF Helpers
    mapping(uint256 => address) private s_requestIdToSender;
    // mapping(uint256 => address) public s_requestIdToSender;

    // NFT Variables
    uint256[5] private POWER_LEVELS = [5, 4, 3, 2, 1];
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    uint256 private s_tokenCounter;
    string[] internal s_nftUris;
    bool private s_initialized;

    // Events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(uint256 powerLevel, address owner, uint256 tokenId);

    // Contract Variables
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[5] memory nftUris
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721('GroupFiveCollection', 'GFC') {
        // Chainlink VRF constructor args
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        _initializeContract(nftUris);
        s_tokenCounter = 0;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function _initializeContract(string[5] memory nftUris) private {
        if (s_initialized) {
            revert GroupFiveCollection__AlreadyInitialized();
        }
        s_nftUris = nftUris;
        s_initialized = true;
    }

    /**
     * @notice Takes your specified parameters and submits the request to the VRF coordinator contract for a random value.
     * @dev Maps the returned `requestId` to the address of `msg.sender`.
     * @dev The `s_requestIdToSender` mapping will be used later in `fulfillRandomWords()` to get the address of
     * @dev the original msg.sender and pass that address to the `_safeMint()` function.
     * @return requestId - A unique identifier of the request. Can be used to match
     * a request to a response in fulfillRandomWords.
     */
    function requestNft(
        address sender
    ) external onlyRole(MINTER_ROLE) returns (uint256 requestId) {
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        s_requestIdToSender[requestId] = sender;
        emit NftRequested(requestId, sender);
    }

    /**
     * @notice Receives random values and stores them with your contract.
     * @dev `fulfillRandomWords` is a callback function which is called by the Chainlink node which processes our request
     * @dev for random values.
     * @dev Calling `_safeMint(msg.sender, tokenID)` inside `fulfillRandomWords()` would result in the Chainlink node which
     * @dev called `fulfillRandomWords()` to be the owner of the NFT.
     * @dev We will use the `s_requestIdToSender` mapping in order to assign the proper owner when calling `_safeMint()`
     * @param requestId - A unique identifier of the VRF request. Used to match a request to a response in fulfillRandomWords.
     * @param randomWords - Random values request from the VRF
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        // Is this function secure? Can it be called from the outside and exployted?
        address nftOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        s_tokenCounter = s_tokenCounter + 1;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        uint256 powerLevel = getPowerFromModdedRng(moddedRng);
        _safeMint(nftOwner, newTokenId);
        _setTokenURI(newTokenId, s_nftUris[powerLevel - 1]);
        emit NftMinted(powerLevel, nftOwner, newTokenId);
    }

    /**
     * @notice Returns percent chance of
     */
    function getChanceArray() internal pure returns (uint256[5] memory) {
        return [5, 15, 30, 50, MAX_CHANCE_VALUE];
    }

    function getPowerFromModdedRng(uint256 moddedRng) internal view returns (uint256) {
        uint256 cumulativeSum = 0;
        uint256[5] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            // power 5 = 0 - 4  (5%)
            // power 4 = 5 - 14  (10%)
            // power 3 = 15 = 29 (15%)
            // power 2 = 30 = 49 (20%)
            // power 1 = 50 = 99 (50%)
            if (moddedRng >= cumulativeSum && moddedRng < chanceArray[i]) {
                return POWER_LEVELS[i];
            }
            cumulativeSum = chanceArray[i];
        }
        revert GroupFiveCollection__RangeOutOfBounds();
    }

    function getNftUris(uint256 index) public view returns (string memory) {
        return s_nftUris[index];
    }

    function getInitialized() public view returns (bool) {
        return s_initialized;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
