import { ethers as ethersHH } from 'hardhat'
import { getNFTMetadata } from '../utils/getNFTMetadata'
import { Nft } from 'alchemy-sdk'
import * as dotenv from 'dotenv'
dotenv.config()

// yarn ts-node ./scripts/testEncodeBattles_submit_player1.ts

const GFC_Address = process.env.GROUP_FIVE_COLLECTION ?? ''
const battlesContractAddress = process.env.ENCODE_BATTLES ?? ''
const NFT_1_ID = 0

function setupProvider() {
    const provider = new ethersHH.InfuraProvider('sepolia')
    return provider
}

async function testEncodeBattles() {
    const provider = setupProvider()
    const wallet = new ethersHH.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    console.log('-'.repeat(process.stdout.columns))
    console.log('Fetching NFT data...')

    const data: Nft = await getNFTMetadata(GFC_Address, NFT_1_ID)
    // console.log('Nft Data: ', data)
    const attributeObj = data.rawMetadata!.attributes![0]
    const nftPower = attributeObj.value
    console.log(`${attributeObj.trait_type}`, attributeObj.value)

    console.log('-'.repeat(process.stdout.columns))
    console.log('Getting deployed contract...')
    const battlesContract = await ethersHH.getContractAt(
        'EncodeBattles',
        battlesContractAddress,
        wallet
    )

    const filter = battlesContract.filters['BattleOpened(address,uint256)']

    console.log('Set up listener...')
    await battlesContract.once(filter, (player1, timestamp) => {
        console.log('BattleOpened!')
        console.log(`${player1} | ${timestamp}`)
    })

    console.log('Calling submitForBattle()...')

    const tx = await battlesContract.submitForBattle(NFT_1_ID, nftPower)
    const receipt = await tx.wait(2)
    console.log('SubmitForBattle receipt: ', receipt)
}

testEncodeBattles()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
