import { Network, Alchemy } from 'alchemy-sdk'

const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? '',
    network: Network.ETH_SEPOLIA,
}
const alchemy = new Alchemy(settings)

export async function getNFTMetadata(nftContractAddress: string, tokenId: number) {
    const response = await alchemy.nft.getNftMetadata(nftContractAddress, tokenId)
    return response
}

export async function getNFTOwner(nftContractAddress: string, tokenId: number) {
    const response = await alchemy.nft.getOwnersForNft(nftContractAddress, tokenId)
    return response
}
