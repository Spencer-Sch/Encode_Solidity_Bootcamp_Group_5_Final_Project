import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'
dotenv.config()

// yarn ts-node ./scripts/testGroupFiveToken_transferGFT.ts

function setupProvider() {
    const provider = new ethers.InfuraProvider('sepolia')
    return provider
}

async function testGroupFiveToken() {
    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    const tokenSaleAddress = process.env.TOKEN_SALE ?? ''
    const GFT_Address = process.env.GROUP_FIVE_TOKEN ?? ''

    console.log('-'.repeat(process.stdout.columns))
    console.log('Getting deployed contract...')
    const tokenSaleContract = await ethers.getContractAt('TokenSale', tokenSaleAddress, wallet)
    const GFT_Contract = await ethers.getContractAt('GroupFiveToken', GFT_Address, wallet)

    console.log('Getting balance of GFT...')

    const balanceBeforeBN = await GFT_Contract.balanceOf(tokenSaleAddress)
    console.log(`Account ${tokenSaleAddress} (TokenSale) has ${balanceBeforeBN.toString()} GFT`)

    console.log('-'.repeat(process.stdout.columns))

    console.log('Transfer GFT from wallet to TokenSale...')

    const nftPriceBN = await tokenSaleContract.s_nftPrice()

    const transferTx = await GFT_Contract.transferGFT(wallet.address, tokenSaleAddress, nftPriceBN)
    await transferTx.wait(2)

    console.log('Getting balance of GFT...')

    const balanceAfterBN = await GFT_Contract.balanceOf(tokenSaleAddress)
    console.log(`Account ${tokenSaleAddress} (TokenSale) has ${balanceAfterBN.toString()} GFT`)

    console.log('-'.repeat(process.stdout.columns))
}

testGroupFiveToken()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
