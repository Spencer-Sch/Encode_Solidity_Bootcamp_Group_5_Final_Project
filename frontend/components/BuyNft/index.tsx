import { Button, Card } from '@web3uikit/core'
import styles from './buyNft.module.css'
import appStateOptions from '@/constants/appStateOptions'
import { useEffect, useState } from 'react'
import {
    Chain,
    sepolia,
    useBalance,
    useContractEvent,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
} from 'wagmi'
import { Nft } from 'alchemy-sdk'
import { getNFTMetadata } from '@/utils/alchemyNftUtils'
import * as tokenSaleJson from '@/assets/TokenSale.json'
import * as GFCJson from '@/assets/GroupFiveCollection.json'

type Props = {
    changeAppState: (newState: string) => void
    address: `0x${string}` | undefined
    chain:
        | (Chain & {
              unsupported?: boolean | undefined
          })
        | undefined
}

const HOME = appStateOptions.home
const tokenSaleAbi = tokenSaleJson.abi
const GFCAbi = GFCJson.abi

export default function BuyNft({ changeAppState, address, chain }: Props) {
    const [nftData, setNftData] = useState<Nft | null>(null)
    const [allowNftFetch, setAllowNftFetch] = useState(false)
    const {
        data: gftData,
        isError: gftBalanceError,
        isLoading: gftBalanceLoading,
        refetch,
    } = useBalance({
        address: address,
        token: process.env.NEXT_PUBLIC_GROUP_FIVE_TOKEN as `0x${string}`,
    })
    useContractEvent({
        address: (process.env.NEXT_PUBLIC_GROUP_FIVE_COLLECTION as `0x${string}`) ?? '',
        abi: GFCAbi,
        eventName: 'NftMinted',
        listener(log) {
            console.log('NftMinted GFC EVENT LOG: ', log)
        },
        chainId: sepolia.id,
    })

    const {
        data: tokenCounterData,
        isLoading,
        isSuccess: readSuccess,
    } = useContractRead({
        address: (process.env.NEXT_PUBLIC_GROUP_FIVE_COLLECTION as `0x${string}`) ?? '',
        abi: GFCAbi,
        functionName: 'getTokenCounter',
        chainId: sepolia.id,
        // onError(error) {
        // console.log('useRead TokenCounter Error: ', error)
        // },
        onSuccess(data) {
            console.log('useRead TokenCounter data: ', data)
        },
    })

    const currentNFTId = Number(tokenCounterData)

    const { config } = usePrepareContractWrite({
        address: (process.env.NEXT_PUBLIC_TOKEN_SALE as `0x${string}`) ?? '',
        abi: tokenSaleAbi,
        functionName: 'mintNft',
        chainId: sepolia.id,
        account: address as `0x${string}`,
        // onError(error) {
        // console.log('usePrepare MintNft Error: ', error)
        // },
        onSettled(data) {
            console.log('usePrepare MintNft Success: ', data)
        },
    })

    const { data, isLoading: loadingWriteTx, error, isError, write } = useContractWrite(config)
    const { isLoading: awaitingTx, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })

    useEffect(() => {
        refetch().catch((e) => console.log(e))
        // getNFTMetadata(process.env.NEXT_PUBLIC_GROUP_FIVE_COLLECTION ?? '', 9)
        //     .then((data: Nft) => setNftData(data))
        //     .catch((e: any) => console.log('getNFTMetadata Error: ', e))
    }, [isSuccess])

    useEffect(() => {
        console.log('nftData: ', nftData)
    }, [nftData])

    return (
        <div className={styles.container}>
            <div className={styles.sectionHeader}>
                <div className={styles.spacer}>
                    <Button
                        color="blue"
                        id=""
                        onClick={() => changeAppState(HOME)}
                        size="large"
                        text="Go Home"
                        theme="colored"
                        type="button"
                    />
                </div>
                <h2 className={styles.h2}>Purchase NFT</h2>
                <div className={styles.spacer}></div>
            </div>
            <div className={styles.actionContainer}>
                <div className={styles.infoContainer}>
                    <div className={styles.balanceContainer}>
                        <p>Your Balance</p>
                        <p>GFT: {gftData?.formatted.slice(0, 5)}</p>
                    </div>
                    <div className={styles.priceContainer}>
                        <p>NFT Price:</p>
                        <p>0.5 GFT</p>
                    </div>
                </div>
                <form
                    className={styles.buttonContainer}
                    onSubmit={(e) => {
                        e.preventDefault()
                        write?.()
                    }}
                >
                    <Button
                        isFullWidth
                        color="blue"
                        id=""
                        disabled={
                            !write || awaitingTx || loadingWriteTx || Number(gftData?.value) <= 0
                        }
                        size="large"
                        text={awaitingTx || loadingWriteTx ? 'Please wait...' : 'Purchase NFT'}
                        theme="colored"
                        type="submit"
                    />
                </form>
                {loadingWriteTx && <div>Sign Transaction...</div>}
                {awaitingTx && <div>Waiting for Transaction...</div>}
                {isSuccess && (
                    <div style={{ margin: '2rem 0' }}>
                        <p>Purchase Succesful!</p>
                        <div>
                            <a
                                target="_blank"
                                href={`https://sepolia.etherscan.io/tx/${data?.hash}`}
                            >
                                View On Etherscan
                            </a>
                        </div>
                    </div>
                )}
                {isError && <div>Error: {error?.message}</div>}
                {isSuccess && (
                    <>
                        <Button
                            color="blue"
                            id=""
                            size="large"
                            text="View NFT"
                            theme="colored"
                            type="button"
                            onClick={() => {
                                getNFTMetadata(
                                    process.env.NEXT_PUBLIC_GROUP_FIVE_COLLECTION ?? '',
                                    currentNFTId
                                )
                                    .then((data: Nft) => setNftData(data))
                                    .catch((e: any) => console.log('getNFTMetadata Error: ', e))
                            }}
                        />
                        {nftData?.title && (
                            <div>
                                <p>NFT Name: {nftData.title}</p>
                                <p>NFT Id: {nftData.tokenId}</p>
                                <p>NFT Power: {nftData.rawMetadata?.attributes![0].value}</p>
                                <p>
                                    NFT Description:<br></br> {nftData.description}
                                </p>
                                <img src={`${nftData.media[0].gateway}`} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
