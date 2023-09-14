import { Network, Alchemy } from 'alchemy-sdk'
import * as dotenv from 'dotenv'
dotenv.config()

const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
}
const alchemy = new Alchemy(settings)

export async function getNFTMetadata(nftContractAddress: string, tokenId: number) {
    const response = await alchemy.nft.getNftMetadata(nftContractAddress, tokenId)
    return response
}
