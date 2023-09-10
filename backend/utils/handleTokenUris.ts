import { storeImages, storeTokenUriMetadata } from '../utils/uploadToPinata'
import { nftMetadata } from '../constants/nftMetadata'

const imagesLocation = './images/encodeBattle'

type tokenUriArray = [string, string, string, string, string]

const imageNameToIndex: [string, number][] = [
    ['scarecrow', 0],
    ['squire', 1],
    ['knight', 2],
    ['werewolf', 3],
    ['dragon', 4],
]

const imageNameMap: Map<string, number> = new Map()

imageNameToIndex.forEach((item) => {
    imageNameMap.set(item[0], item[1])
})

export async function handleTokenUris() {
    // to the raw IPFS-daemon from https://docs.ipfs.io/how-to/command-line-quick-start/
    // You could also look at pinata https://www.pinata.cloud/

    let tokenUris_: tokenUriArray = ['', '', '', '', '']
    if (process.env.UPLOAD_ALL_TO_PINATA == 'true') {
        // let tokenUris_: tokenUriArray = ['', '', '', '', '']
        const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
        for (const indexStr in imageUploadResponses) {
            const index = parseInt(indexStr)
            const imageName = files[index].replace('.png', '')
            const metadataIndex = imageNameMap.get(imageName)

            let tokenUriMetadata = { ...nftMetadata[metadataIndex!] }
            tokenUriMetadata.image = `ipfs://${imageUploadResponses[index].IpfsHash}`

            console.log(
                `Uploading metadata for ${
                    nftMetadata[metadataIndex!].name
                } with power attribute of ${nftMetadata[metadataIndex!].attributes[0].value}`
            )

            const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
            tokenUris_[index] = `ipfs://${metadataUploadResponse!.IpfsHash}`
        }
        console.log('Nft images and metadata uploaded! The URIs are:')
        console.log(tokenUris_)
    } else if (process.env.UPLOAD_METADATA_TO_PINATA) {
        for (const index in nftMetadata) {
            console.log(`Uploading metadata for ${nftMetadata[index].name}`)

            const metadataUploadResponse = await storeTokenUriMetadata(nftMetadata[index])

            tokenUris_[index] = `ipfs://${metadataUploadResponse!.IpfsHash}`
        }

        console.log('Token Metadata uploaded! The URIs are:')
        console.log(tokenUris_)
    }
    // console.log('Token URIs uploaded! They are:')
    // console.log(tokenUris_)
    return tokenUris_
}
