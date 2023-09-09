import {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    networkConfig,
} from '../helper-hardhat-config'
import verify from '../utils/verify'
import { network } from 'hardhat'
import { ethers } from 'ethers'
import { log } from 'console'
import * as dotenv from 'dotenv'
import { GroupFiveCollection__factory } from '../typechain-types'
dotenv.config()

type tokenUriArray = [string, string, string, string, string]

let tokenUris: tokenUriArray = [
    'ipfs://Qmdt627br4rCUdFTqT7hdtEmGUbfXpFgWUXG1AmpGb6cJq', // 1
    'ipfs://QmcXa71yJEzmBnnQzahzeujgQYUCNDeL18GfkTd3eZ3UgX', // 2
    'ipfs://QmSmF8ejUqeH2BkaSHg4wbdFpyUYYvEChKWy6StFT6ZoM5', // 3
    'ipfs://Qmbxxh9bSeg1fQi3JqXzX2Nne2b7sgCUWrsxVTwEwTn1hF', // 4
    'ipfs://QmarTghf1Cz6LvLMVwrihaKHovTDjdmEbsTEFMnTjSn1ya', // 5
]

function setupProvider() {
    const provider = new ethers.InfuraProvider('sepolia')
    return provider
}

const deployGFCollection = async function () {
    const chainId = network.config.chainId!
    if (chainId !== 11155111) {
        log('Only setup to deploy to Sepolia testnet. Abort')
        return
    }

    const vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
    const subscriptionId = networkConfig[chainId].subscriptionId

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    log('-'.repeat(process.stdout.columns))

    const groupFiveCollectionFactory = new GroupFiveCollection__factory(wallet)
    const groupFiveCollection = await groupFiveCollectionFactory.deploy(
        vrfCoordinatorV2Address ?? '',
        subscriptionId ?? '',
        networkConfig[chainId]['gasLane'] ?? '',
        networkConfig[chainId]['callbackGasLimit'] ?? '',
        tokenUris
    )
    await groupFiveCollection.waitForDeployment()
    const groupFiveCollectionAddress = await groupFiveCollection.getAddress()

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log('Verifying...')
        await verify(groupFiveCollectionAddress, [
            vrfCoordinatorV2Address ?? '',
            subscriptionId ?? '',
            networkConfig[chainId]['gasLane'] ?? '',
            networkConfig[chainId]['callbackGasLimit'] ?? '',
            tokenUris,
        ])
    }
}

deployGFCollection()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
// export default deployGFCollection
// deployGFCollection.tags = ['all', 'group-five-collection', 'main']
