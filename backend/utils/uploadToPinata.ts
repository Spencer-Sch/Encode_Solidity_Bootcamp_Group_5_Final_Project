import pinataSDK from '@pinata/sdk'
import * as dotenv from 'dotenv'
dotenv.config()

const pinataApiKey = process.env.PINATA_API_KEY || ''
const pinataApiSecret = process.env.PINATA_API_SECRET || ''
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret)

export async function storeTokenUriMetadata(metadata: Object) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}
