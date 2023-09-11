import { networkConfig } from '../helper-hardhat-config'
import { network } from 'hardhat'
import verify from '../utils/verify'
import { ethers } from 'ethers'
import { log } from 'console'
import * as dotenv from 'dotenv'
import { GroupFiveCollection__factory } from '../typechain-types'
dotenv.config()

/*
NOTICE:
After deploying a new Group Five Collection contract you need to add that new contract as a consumer
in your vrf subscription!
*/

// yarn hardhat run ./scripts/deploy-group-five-collection.ts --network sepolia

// if scripts moved into `deploy` dir:
// yarn hardhat deploy --network sepolia --tags group-five-collection

type tokenUriArray = [string, string, string, string, string]

// Metadata URIs by Power rating
let tokenUris: tokenUriArray = [
    'ipfs://QmPtoPawFgzZtE26W1cVZXDPJ3LkZ88SfRn4R85Z64r4xH', // 1 - Scarecrow
    'ipfs://QmUaty9Lz7ugjTmyWoWxQQ4r5X3DRrYohqs3YjCXPBfNmL', // 2 - Squire
    'ipfs://QmZXZDRQKoi1qRrATAgb4xEdYJf3syDVgKUr8NTidccCsT', // 3 - Knight
    'ipfs://QmXju5Wboutq6LzzMdLkecYpBoimbBvvSaPGiSamFzuPkP', // 4 - Werewolf
    'ipfs://QmS6CsnNepVmXgHaznkzQiq3MMRHvYYnay2koLUWJnwgYg', // 5 - Dragon
]

function setupProvider() {
    const provider = new ethers.InfuraProvider('sepolia')
    return provider
}

const deployGFCollection = async function () {
    const chainId = network.config.chainId!
    log('chainId: ', chainId)
    const vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
    const subscriptionId = networkConfig[chainId].subscriptionId

    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    log('-'.repeat(process.stdout.columns))
    log('Deploying GroupFiveCollection contract...')

    const groupFiveCollectionFactory = new GroupFiveCollection__factory(wallet)
    const groupFiveCollection = await groupFiveCollectionFactory.deploy(
        vrfCoordinatorV2Address ?? '',
        subscriptionId ?? '',
        networkConfig[chainId]['gasLane'] ?? '',
        networkConfig[chainId]['callbackGasLimit'] ?? '',
        tokenUris
    )
    groupFiveCollection.waitForDeployment()
    await groupFiveCollection.deploymentTransaction()?.wait(5)
    const groupFiveCollectionAddress = await groupFiveCollection.getAddress()

    log(`GroupFiveCollection contract deployed at address: ${groupFiveCollectionAddress}`)
    log('-'.repeat(process.stdout.columns))

    // Verify the deployment
    log('Verifying...')
    await verify(groupFiveCollectionAddress, [
        vrfCoordinatorV2Address ?? '',
        subscriptionId ?? '',
        networkConfig[chainId]['gasLane'] ?? '',
        networkConfig[chainId]['callbackGasLimit'] ?? '',
        tokenUris,
    ])
    log('Verifying complete')
}

deployGFCollection()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
// export default deployGFCollection
// deployGFCollection.tags = ['all', 'group-five-collection', 'main']
