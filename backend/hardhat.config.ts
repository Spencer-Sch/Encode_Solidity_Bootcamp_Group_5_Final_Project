import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
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
    paths: { tests: 'tests' },
}

export default config
