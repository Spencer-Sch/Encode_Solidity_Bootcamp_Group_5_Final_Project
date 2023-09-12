import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'
dotenv.config()

// yarn ts-node ./scripts/testTokenSale_buy_GFT.ts

const ETH_AMOUNT = ethers.parseUnits('0.01')

function setupProvider() {
    const provider = new ethers.InfuraProvider('sepolia')
    return provider
}

async function testTokenSale() {
    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    const tokenSaleAddress = process.env.TOKEN_SALE ?? ''
    const GFT_Address = process.env.GROUP_FIVE_TOKEN ?? ''

    console.log('-'.repeat(process.stdout.columns))
    console.log('Getting deployed contract...')
    const tokenSaleContract = await ethers.getContractAt('TokenSale', tokenSaleAddress, wallet)
    const GFT_Contract = await ethers.getContractAt('GroupFiveToken', GFT_Address, wallet)

    console.log('Buying Tokens through TokenSale...')

    const buyTokensTx = await tokenSaleContract.buyTokens({ value: ETH_AMOUNT.toString() })
    await buyTokensTx.wait(2)

    console.log('Getting balance of GFT...')

    const balanceBN = await GFT_Contract.balanceOf(wallet.address)
    console.log(
        `Account ${
            wallet.address
        } spent ${ETH_AMOUNT.toString()} ETH and now has a balance of ${balanceBN.toString()} GFT`
    )
}

testTokenSale()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
