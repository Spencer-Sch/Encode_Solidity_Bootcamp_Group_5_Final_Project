import { ethers as ethersHH } from 'hardhat'
import { getNFTMetadata } from '../utils/getNFTMetadata'
import { Nft } from 'alchemy-sdk'
import * as dotenv from 'dotenv'
dotenv.config()

// yarn ts-node ./scripts/testEncodeBattles_submit_player2.ts

const GFC_Address = process.env.GROUP_FIVE_COLLECTION ?? ''
const battlesContractAddress = process.env.ENCODE_BATTLES ?? ''
const NFT_2_ID = 1

function setupProvider() {
    const provider = new ethersHH.InfuraProvider('sepolia')
    return provider
}

async function testEncodeBattles() {
    const provider = setupProvider()
    const wallet = new ethersHH.Wallet(process.env.PRIVATE_KEY_2 ?? '', provider)

    console.log('-'.repeat(process.stdout.columns))
    console.log('Fetching NFT data...')

    const data: Nft = await getNFTMetadata(GFC_Address, NFT_2_ID)
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

    const filter =
        battlesContract.filters[
            'BattleCompleted(uint256,address,address,uint256,uint256,uint8,uint256)'
        ]

    console.log('Set up listener...')
    await battlesContract.once(
        filter,
        (battleId, player1, player2, player1Power, player2Power, battleResult, timestamp) => {
            console.log('BattleCompleted!')
            console.log(`Battle Id: ${battleId}`)
            console.log(`Player1: ${player1}`)
            console.log(`Player1Power: ${player1Power}`)
            console.log(`Player2: ${player2}`)
            console.log(`Player2Power: ${player2Power}`)
            console.log(`Battle Result: ${battleResult}`)
            console.log(`timestamp: ${timestamp}`)
        }
    )

    console.log('Calling submitForBattle()...')

    const tx = await battlesContract.submitForBattle(NFT_2_ID, nftPower)
    const receipt = await tx.wait(2)
    console.log('SubmitForBattle receipt: ', receipt)
}

testEncodeBattles()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
