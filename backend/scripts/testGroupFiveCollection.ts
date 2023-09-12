import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'
dotenv.config()

/*
NOTICE:
After deploying a new Group Five Collection contract you need to add that new contract as a consumer
in your vrf subscription!
*/

// yarn ts-node ./scripts/testGroupFiveCollection.ts

function setupProvider() {
    const provider = new ethers.InfuraProvider('sepolia')
    return provider
}

async function testGroupFiveCollection() {
    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    const GroupFiveCollectionAddress = process.env.GROUP_FIVE_COLLECTION ?? ''

    console.log('Getting deployed contract...')
    const GFC_Contract = await ethers.getContractAt(
        'GroupFiveCollection',
        GroupFiveCollectionAddress,
        wallet
    )

    console.log('-'.repeat(process.stdout.columns))

    const requestTx = await GFC_Contract.requestNft(wallet.address)
    const receipt = await requestTx.wait(2)
    console.log('requestNft receipt: ', receipt)
    console.log('-'.repeat(process.stdout.columns))
}

testGroupFiveCollection()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
