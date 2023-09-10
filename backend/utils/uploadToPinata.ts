import pinataSDK from '@pinata/sdk'
import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'
dotenv.config()

const pinataApiKey = process.env.PINATA_API_KEY || ''
const pinataApiSecret = process.env.PINATA_API_SECRET || ''
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

export async function storeImages(imagesFilePath: string) {
    const fullImagesPath = path.resolve(imagesFilePath)
    console.log('fullImagePath: ', fullImagesPath)
    const files = fs.readdirSync(fullImagesPath)
    console.log('files: ', files)
    let responses = []
    for (const fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)

            console.log('pinata response: ', response)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    console.log('')
    return { responses, files }
}

export async function storeTokenUriMetadata(metadata: Object) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}
