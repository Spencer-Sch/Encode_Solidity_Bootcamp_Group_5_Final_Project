import { ethers } from 'hardhat'
import { contractName__factory } from '../typechain-types'
import * as dotenv from 'dotenv'
dotenv.config()

/** Replace `contractName` throughout the file with the name of the contract you wish to deploy */

// yarn hardhat run ./scripts/deployScriptTemplate.ts

function setupProvider() {
    const provider = new ethers.InfuraProvider('sepolia', process.env.INFURA_API_KEY ?? '')
    return provider
}

async function deployContractName() {
    const provider = setupProvider()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? '', provider)

    console.log('Deploying contractName contract')
    const contractNameContractFactory = new contractName__factory(wallet)
    const contractNameContract = await contractNameContractFactory.deploy()
    await contractNameContract.waitForDeployment()

    const contractNameAddress = await contractNameContract.getAddress()
    console.log(`contractName deployed to address: ${contractNameAddress}`)

    console.log('Deployment completed successfully!')
}

deployContractName()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
