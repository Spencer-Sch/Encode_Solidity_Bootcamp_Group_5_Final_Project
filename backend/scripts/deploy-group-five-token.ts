import { ethers } from 'ethers'
import { log } from 'console'
import { GroupFiveToken__factory } from '../typechain-types'
import * as dotenv from 'dotenv'
dotenv.config()

// yarn ts-node ./scripts/deploy-group-five-token.ts

function setupProvider() {
    const provider = new ethers.InfuraProvider('sepolia')
    return provider
}

async function deployGFToken() {
    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    log('-'.repeat(process.stdout.columns))
    log('Deploying GroupFiveToken contract...')

    const groupFiveTokenFactory = new GroupFiveToken__factory(wallet)
    const groupFiveToken = await groupFiveTokenFactory.deploy()
    await groupFiveToken.waitForDeployment()
    const groupFiveTokenAddress = await groupFiveToken.getAddress()

    log(`GroupFiveToken contract deployed at address: ${groupFiveTokenAddress}`)
    log('-'.repeat(process.stdout.columns))
}

deployGFToken()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
