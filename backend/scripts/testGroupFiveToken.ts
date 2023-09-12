import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'
dotenv.config()

// yarn ts-node ./scripts/testGroupFiveToken.ts

function setupProvider() {
    const provider = new ethers.InfuraProvider('sepolia')
    return provider
}

async function testGroupFiveToken() {
    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    const GroupFiveTokenAddress = process.env.GROUP_FIVE_TOKEN ?? ''

    console.log('-'.repeat(process.stdout.columns))
    console.log('Getting deployed contract...')
    const GFT_Contract = await ethers.getContractAt(
        'GroupFiveToken',
        GroupFiveTokenAddress,
        wallet
    )

    const mintTx = await GFT_Contract.mint(wallet.address, 1)
    await mintTx.wait(2)

    const balanceBN = await GFT_Contract.balanceOf(wallet.address)
    console.log(`Account ${wallet.address} has ${balanceBN.toString()} GFT`)
}

testGroupFiveToken()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
