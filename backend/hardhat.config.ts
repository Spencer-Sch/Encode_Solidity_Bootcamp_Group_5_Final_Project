import '@typechain/hardhat'
import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-verify'
import '@nomicfoundation/hardhat-toolbox'
import * as dotenv from 'dotenv'
dotenv.config()

const SEPOLIA_RPC_URL =
    process.env.ALCHEMY_RPC_ENDPOINT_URL || 'https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY'
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''

const config: HardhatUserConfig = {
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        },
    },
    solidity: {
        compilers: [
            {
                version: '0.8.19',
            },
            {
                version: '0.8.7',
            },
            {
                version: '0.6.6',
            },
        ],
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    paths: { tests: 'tests' },
}

export default config
