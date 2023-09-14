import { ethers } from 'hardhat'
import { log } from 'console'
import { EncodeBattles__factory } from '../typechain-types'
import verify from '../utils/verify'
import * as dotenv from 'dotenv'
dotenv.config()

// yarn hardhat run ./scripts/deploy-encode-battles.ts --network sepolia

const WINNER_REWARD_AMOUNT = ethers.parseUnits('0.5')
const LOSER_REWARD_AMOUNT = ethers.parseUnits('0.25')
const GFT_Address = process.env.GROUP_FIVE_TOKEN ?? ''
// const GFC_Address = process.env.GROUP_FIVE_COLLECTION ?? ''

function setupProvider() {
    const provider = new ethers.InfuraProvider('sepolia')
    return provider
}

async function deployEncodeBattles() {
    if (!GFT_Address) {
        console.log('GFT contract address not defined')
        console.log(`GFT: ${GFT_Address}`)
        return
    }

    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    log('-'.repeat(process.stdout.columns))
    log('Deploying EncodeBattles contract...')

    const encodeBattlesFactory = new EncodeBattles__factory(wallet)
    const encodeBattles = await encodeBattlesFactory.deploy(
        WINNER_REWARD_AMOUNT,
        LOSER_REWARD_AMOUNT,
        GFT_Address
    )
    await encodeBattles.waitForDeployment()
    await encodeBattles.deploymentTransaction()?.wait(5)
    const encodeBattlesAddress = await encodeBattles.getAddress()

    log(`EncodeBattles contract deployed at address: ${encodeBattlesAddress}`)

    log('-'.repeat(process.stdout.columns))

    // Verify the deployment
    log('Verifying...')
    await verify(encodeBattlesAddress, [WINNER_REWARD_AMOUNT, LOSER_REWARD_AMOUNT, GFT_Address])
    log('Verifying complete')

    log('-'.repeat(process.stdout.columns))
    log('Grant GFT MINTER_ROLE to EncodeBattles contract...')

    const GFT_Contract = await ethers.getContractAt('GroupFiveToken', GFT_Address, wallet)
    // get role code
    const roleCode = await GFT_Contract.MINTER_ROLE()
    const grantRoleTx1 = await GFT_Contract.grantRole(roleCode, encodeBattlesAddress)
    const receipt1 = await grantRoleTx1.wait(2)
    console.log('GFT grantRole hash: ', receipt1!.hash)
}

deployEncodeBattles()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
