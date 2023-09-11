import { ethers } from 'hardhat'
import { log } from 'console'
import { TokenSale__factory } from '../typechain-types'
import verify from '../utils/verify'
import * as dotenv from 'dotenv'
dotenv.config()

// yarn hardhat run ./scripts/deploy-token-sale.ts --network sepolia

const RFT_RATIO = 10n
const NFT_PRICE = ethers.parseUnits('0.5')
const GFT_Address = process.env.GROUP_FIVE_TOKEN ?? ''
const GFC_Address = process.env.GROUP_FIVE_COLLECTION ?? ''

function setupProvider() {
    const provider = new ethers.InfuraProvider('sepolia')
    return provider
}

async function deployTokenSale() {
    if (!GFT_Address || !GFC_Address) {
        console.log('GFT, GFC, or TokenSale contract address(s) not defined')
        console.log(`GFT: ${GFT_Address} | GFC: ${GFC_Address}`)
        return
    }

    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    log('-'.repeat(process.stdout.columns))
    log('Deploying TokenSale contract...')

    const tokenSaleFactory = new TokenSale__factory(wallet)
    const tokenSale = await tokenSaleFactory.deploy(RFT_RATIO, NFT_PRICE, GFT_Address, GFC_Address)
    await tokenSale.waitForDeployment()
    await tokenSale.deploymentTransaction()?.wait(5)
    const tokenSaleAddress = await tokenSale.getAddress()

    log(`TokenSale contract deployed at address: ${tokenSaleAddress}`)

    log('-'.repeat(process.stdout.columns))

    // Verify the deployment
    log('Verifying...')
    await verify(tokenSaleAddress, [RFT_RATIO, NFT_PRICE, GFT_Address, GFC_Address])
    log('Verifying complete')

    log('-'.repeat(process.stdout.columns))
    log('Grant GFT MINTER_ROLE to TokenSale contract...')

    const GFT_Contract = await ethers.getContractAt('GroupFiveToken', GFT_Address, wallet)
    // get role code
    const roleCode = await GFT_Contract.MINTER_ROLE()
    const grantRoleTx1 = await GFT_Contract.grantRole(roleCode, tokenSaleAddress)
    const receipt1 = await grantRoleTx1.wait(2)
    console.log('GFT grantRole hash: ', receipt1!.hash)

    log('Grant GFC MINTER_ROLE to TokenSale contract...')

    const GFC_Contract = await ethers.getContractAt('GroupFiveCollection', GFC_Address, wallet)
    // get role code
    const roleCode2 = await GFC_Contract.MINTER_ROLE()
    const grantRoleTx2 = await GFC_Contract.grantRole(roleCode2, tokenSaleAddress)
    const receipt2 = await grantRoleTx2.wait(2)
    console.log('GFC grantRole hash: ', receipt2!.hash)
    console.log('-'.repeat(process.stdout.columns))
}

deployTokenSale()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
