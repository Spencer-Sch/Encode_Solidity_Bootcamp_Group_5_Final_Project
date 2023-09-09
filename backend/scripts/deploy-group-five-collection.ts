import { networkConfig } from '../helper-hardhat-config'
// import verify from '../utils/verify'
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
    const vrfCoordinatorV2Address = networkConfig[11155111].vrfCoordinatorV2
    const subscriptionId = networkConfig[11155111].subscriptionId

    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    log('-'.repeat(process.stdout.columns))
    log('Deploying GroupFiveCollection contract...')

    const groupFiveCollectionFactory = new GroupFiveCollection__factory(wallet)
    const groupFiveCollection = await groupFiveCollectionFactory.deploy(
        vrfCoordinatorV2Address ?? '',
        subscriptionId ?? '',
        networkConfig[11155111]['gasLane'] ?? '',
        networkConfig[11155111]['callbackGasLimit'] ?? '',
        tokenUris
    )
    await groupFiveCollection.waitForDeployment()
    const groupFiveCollectionAddress = await groupFiveCollection.getAddress()

    log(`GroupFiveCollection contract deployed at address: ${groupFiveCollectionAddress}`)
    log('-'.repeat(process.stdout.columns))

    // Verify the deployment
    // DOESN'T WORK...
    // log('Verifying...')
    // await verify(groupFiveCollectionAddress, [
    //     vrfCoordinatorV2Address ?? '',
    //     subscriptionId ?? '',
    //     networkConfig[11155111]['gasLane'] ?? '',
    //     networkConfig[11155111]['callbackGasLimit'] ?? '',
    //     tokenUris,
    // ])
    // log('Verifying complete')
}

deployGFCollection()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
// export default deployGFCollection
// deployGFCollection.tags = ['all', 'group-five-collection', 'main']
