import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { AddressLike } from 'ethers'
import { log } from 'console'

// Global Constants
const EXAMPLE = 'example'

describe('Contract Name Here', async () => {
    let contract_A: AddTypeHere
    let contract_A_address: AddressLike
    // let contract_B: AddTypeHere
    // let contract_B_address: AddressLike
    let deployer: HardhatEthersSigner
    let acc1: HardhatEthersSigner
    let acc2: HardhatEthersSigner

    async function deployContract_A() {
        const contract_A_factory = await ethers.getContractFactory('ContractNameHere')
        const contract_A_ = await contract_A_factory.deploy()
        await contract_A_.waitForDeployment()
        const contract_A_Contract_Address_ = await contract_A_.getAddress()

        return {
            contract_A_,
            contract_A_Contract_Address_,
        }
    }

    beforeEach(async () => {
        ;[deployer, acc1, acc2] = await ethers.getSigners()
        const { contract_A_, contract_A_Contract_Address_ } = await loadFixture(deployContract_A)
        contract_A = contract_A_
        contract_A_address = contract_A_Contract_Address_
    })

    describe('contract_A tests', async () => {
        it('test 1', async () => {
            await expect(/* ... */)
        })
    })
})
