import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'
dotenv.config()

// yarn ts-node ./scripts/testTokenSale_buy_NFT.ts

// const ETH_AMOUNT = ethers.parseUnits('0.01')

function setupProvider() {
    const provider = new ethers.InfuraProvider('sepolia')
    return provider
}

async function testTokenSale() {
    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    const tokenSaleAddress = process.env.TOKEN_SALE ?? ''
    const GFC_Address = process.env.GROUP_FIVE_COLLECTION ?? ''
    const GFT_Address = process.env.GROUP_FIVE_TOKEN ?? ''

    console.log('-'.repeat(process.stdout.columns))
    console.log('Getting deployed contract...')

    const tokenSaleContract = await ethers.getContractAt('TokenSale', tokenSaleAddress, wallet)
    const GFC_Contract = await ethers.getContractAt('GroupFiveCollection', GFC_Address, wallet)
    const GFT_Contract = await ethers.getContractAt('GroupFiveToken', GFT_Address, wallet)

    const nftIdBN = await GFC_Contract.getTokenCounter()

    console.log('Getting balance of GFT...')

    const balanceBeforeBN = await GFT_Contract.balanceOf(tokenSaleAddress)
    console.log(`Account ${tokenSaleAddress} (TokenSale) has ${balanceBeforeBN.toString()} GFT`)

    console.log('-'.repeat(process.stdout.columns))

    console.log('Buying NFT through TokenSale...')

    const buyNFTTx = await tokenSaleContract.mintNft()
    await buyNFTTx.wait(2)

    console.log('Mint successful!')
    console.log('The NFT Id is: ', nftIdBN.toString())

    console.log('Getting balance of GFT...')

    const balanceAfterBN = await GFT_Contract.balanceOf(tokenSaleAddress)
    console.log(`Account ${tokenSaleAddress} (TokenSale) has ${balanceAfterBN.toString()} GFT`)

    // const owner = await GFC_Contract.ownerOf(nftIdBN.toString())
    // console.log(`Onwer of nft #${nftIdBN.toString()} is ${owner}`)
    console.log('-'.repeat(process.stdout.columns))
}

testTokenSale()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
