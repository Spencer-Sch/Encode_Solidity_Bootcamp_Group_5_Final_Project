import { DECIMALS, INITIAL_PRICE } from '../helper-hardhat-config'
import { ethers, network } from 'hardhat'
import { log } from 'console'

const BASE_FEE = '250000000000000000' // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas

const deployMocks = async function () {
    const chainId = network.config.chainId
    // If we are on a local development network, we need to deploy mocks!
    if (chainId == 31337) {
        log('Local network detected! Deploying mocks...')

        const VRFMockFactory = await ethers.getContractFactory('VRFCoordinatorV2Mock')
        const VRFMock = await VRFMockFactory.deploy(BASE_FEE, GAS_PRICE_LINK)
        VRFMock.waitForDeployment()
        const VRFMockAddress = await VRFMock.getAddress()

        const MockV3AggregatorFactory = await ethers.getContractFactory('MockV3Aggregator')
        const MockV3Aggregator = await MockV3AggregatorFactory.deploy(DECIMALS, INITIAL_PRICE)
        MockV3Aggregator.waitForDeployment()
        const MockV3AggregatorAddress = await VRFMock.getAddress()

        log('Mocks Deployed!')
        log(`VRFMock Address: ${VRFMockAddress}`)
        log(`MockV3Aggregator Address: ${MockV3AggregatorAddress}`)
        log('-'.repeat(process.stdout.columns))
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        )
        log(
            'Please run `yarn hardhat console --network localhost` to interact with the deployed smart contracts!'
        )
        log('-'.repeat(process.stdout.columns))
    }
}
deployMocks()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
// export default deployMocks
// deployMocks.tags = ['all', 'mocks', 'main']
