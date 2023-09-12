import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'
dotenv.config()

// yarn ts-node ./scripts/testTokenSale_approve_GFT.ts

function setupProvider() {
    const provider = new ethers.InfuraProvider('sepolia')
    return provider
}

async function testTokenSale() {
    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    const tokenSaleAddress = process.env.TOKEN_SALE ?? ''
    // const GFC_Address = process.env.GROUP_FIVE_COLLECTION ?? ''
    const GFT_Address = process.env.GROUP_FIVE_TOKEN ?? ''

    console.log('-'.repeat(process.stdout.columns))
    console.log('Getting deployed contract...')
    const tokenSaleContract = await ethers.getContractAt('TokenSale', tokenSaleAddress, wallet)
    // const GFC_Contract = await ethers.getContractAt('GroupFiveCollection', GFC_Address, wallet)
    const GFT_Contract = await ethers.getContractAt('GroupFiveToken', GFT_Address, wallet)

    console.log('-'.repeat(process.stdout.columns))

    console.log('Approving TokenSale to be spender...')

    const approveTx = await tokenSaleContract.approveTokenSale()
    await approveTx.wait(2)

    console.log('Checking allowance...')

    const allowanceBN = await GFT_Contract.allowance(wallet.address, tokenSaleAddress)
    console.log(
        `Account ${tokenSaleAddress} (TokenSale) has an allowance of: ${allowanceBN.toString()}`
    )

    console.log('-'.repeat(process.stdout.columns))
}

testTokenSale()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
