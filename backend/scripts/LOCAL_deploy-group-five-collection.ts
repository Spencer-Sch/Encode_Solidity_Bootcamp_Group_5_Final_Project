import { DECIMALS, INITIAL_PRICE } from '../helper-hardhat-config'
import {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    networkConfig,
} from '../helper-hardhat-config'
import { storeTokenUriMetadata } from '../utils/uploadToPinata'
import { ethers, network } from 'hardhat'
import { log } from 'console'
import * as dotenv from 'dotenv'
dotenv.config()

const BASE_FEE = '250000000000000000' // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas
const FUND_AMOUNT = '1000000000000000000000'
const POWER_LEVEL_VARIANTS = 5

type tokenUriArray = [string, string, string, string, string]

let tokenUris: tokenUriArray = [
    'ipfs://Qmdt627br4rCUdFTqT7hdtEmGUbfXpFgWUXG1AmpGb6cJq', // 1
    'ipfs://QmcXa71yJEzmBnnQzahzeujgQYUCNDeL18GfkTd3eZ3UgX', // 2
    'ipfs://QmSmF8ejUqeH2BkaSHg4wbdFpyUYYvEChKWy6StFT6ZoM5', // 3
    'ipfs://Qmbxxh9bSeg1fQi3JqXzX2Nne2b7sgCUWrsxVTwEwTn1hF', // 4
    'ipfs://QmarTghf1Cz6LvLMVwrihaKHovTDjdmEbsTEFMnTjSn1ya', // 5
]

const metadataTemplate = {
    name: 'GFC Encode Battle NFT',
    description:
        'An NFT from the Group Five Collection (GFC) that can be used in the Encode Battle game in order to earn GFT.',
    image: '',
    attributes: [
        {
            trait_type: 'Power',
            value: 0,
        },
    ],
}

const deployGFCollection = async function () {
    const chainId = network.config.chainId!
    let vrfCoordinatorV2Address, subscriptionId

    if (process.env.UPLOAD_TO_PINATA == 'true') {
        tokenUris = await handleTokenUris()
    }

    if (chainId == 31337) {
        log('Local network detected! Deploying mocks...')

        const VRFMockFactory = await ethers.getContractFactory('VRFCoordinatorV2Mock')
        const VRFMock = await VRFMockFactory.deploy(BASE_FEE, GAS_PRICE_LINK)
        VRFMock.waitForDeployment()
        vrfCoordinatorV2Address = await VRFMock.getAddress()

        const MockV3AggregatorFactory = await ethers.getContractFactory('MockV3Aggregator')
        const MockV3Aggregator = await MockV3AggregatorFactory.deploy(DECIMALS, INITIAL_PRICE)
        MockV3Aggregator.waitForDeployment()
        const MockV3AggregatorAddress = await MockV3Aggregator.getAddress()

        log('Mocks Deployed!')
        log(`VRFMock Address: ${vrfCoordinatorV2Address}`)
        log(`MockV3Aggregator Address: ${MockV3AggregatorAddress}`)
        log('-'.repeat(process.stdout.columns))
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        )
        log(
            'Please run `yarn hardhat console --network localhost` to interact with the deployed smart contracts!'
        )
        log('-'.repeat(process.stdout.columns))
        ////////////////////////////////////
        // create VRFV2 Subscription
        const transactionResponse = await VRFMock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        // NOTE: logs[0].args.subId on line below exists. Ignore red error line
        subscriptionId = transactionReceipt!.logs[0].args.subId
        // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await VRFMock.fundSubscription(subscriptionId, FUND_AMOUNT)
    }

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log('-'.repeat(process.stdout.columns))

    const groupFiveCollectionFactory = await ethers.getContractFactory('GroupFiveCollection')
    const groupFiveCollectionContract = await groupFiveCollectionFactory.deploy(
        vrfCoordinatorV2Address ?? '',
        subscriptionId ?? '',
        networkConfig[chainId]['gasLane'] ?? '',
        networkConfig[chainId]['callbackGasLimit'] ?? '',
        tokenUris
    )
    await groupFiveCollectionContract.waitForDeployment()
}

async function handleTokenUris() {
    // to the raw IPFS-daemon from https://docs.ipfs.io/how-to/command-line-quick-start/
    // You could also look at pinata https://www.pinata.cloud/
    let tokenUris_: tokenUriArray = ['', '', '', '', '']
    for (let i = 1; i <= POWER_LEVEL_VARIANTS; i++) {
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.attributes[0].value = i
        console.log(`Uploading metadata for power level ${i}...`)
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris_[i - 1] = `ipfs://${metadataUploadResponse!.IpfsHash}`
    }
    console.log('Token URIs uploaded! They are:')
    console.log(tokenUris_)
    return tokenUris_
}

deployGFCollection()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
// export default deployGFCollection
// deployGFCollection.tags = ['all', 'group-five-collection', 'main']
