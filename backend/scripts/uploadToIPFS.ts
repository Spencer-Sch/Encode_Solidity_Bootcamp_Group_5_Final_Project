import { handleTokenUris } from '../utils/handleTokenUris'

// yarn ts-node ./scripts/uploadToIPFS.ts

/*
NOTICE!!!!!
Before running this script, check the following vars in your `.env` to make sure the correct action will be triggered:

UPLOAD_ALL_TO_PINATA
If true will upload the nft images, pack the metadata `image` field with the resulting IPFS hash, and upload the packed metadata as well

UPLOAD_IMAGES_TO_PINATA
If true will upload only the nft images

UPLOAD_METADATA_TO_PINATA
If true will upload only the nft metadata
NOTE: the metadata contains the current IPFS hashes for the NFT imgaes
*/

const uploadToIPFS = async function () {
    console.log('-'.repeat(process.stdout.columns))
    console.log('Uploading to IPFS...')
    await handleTokenUris()
    console.log('Completed uploading to IPFS')
    console.log('-'.repeat(process.stdout.columns))
}

uploadToIPFS()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
