import { DECIMALS, INITIAL_PRICE } from '../helper-hardhat-config'
import {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    networkConfig,
} from '../helper-hardhat-config'
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
    'ipfs://QmPtoPawFgzZtE26W1cVZXDPJ3LkZ88SfRn4R85Z64r4xH', // 1 - Scarecrow
    'ipfs://QmUaty9Lz7ugjTmyWoWxQQ4r5X3DRrYohqs3YjCXPBfNmL', // 2 - Squire
    'ipfs://QmZXZDRQKoi1qRrATAgb4xEdYJf3syDVgKUr8NTidccCsT', // 3 - Knight
    'ipfs://QmXju5Wboutq6LzzMdLkecYpBoimbBvvSaPGiSamFzuPkP', // 4 - Werewolf
    'ipfs://QmS6CsnNepVmXgHaznkzQiq3MMRHvYYnay2koLUWJnwgYg', // 5 - Dragon
]

const deployGFCollection = async function () {
    const chainId = network.config.chainId!
    let vrfCoordinatorV2Address, subscriptionId

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

deployGFCollection()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
// export default deployGFCollection
// deployGFCollection.tags = ['all', 'group-five-collection', 'main']
