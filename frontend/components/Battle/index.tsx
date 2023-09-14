import { Button, Input } from '@web3uikit/core'
import styles from './battle.module.css'
import appStateOptions from '@/constants/appStateOptions'
import { useState } from 'react'
import {
    Chain,
    sepolia,
    useContractEvent,
    // useContractRead,
    useContractWrite,
    usePrepareContractWrite,
} from 'wagmi'
import { GetOwnersForNftResponse, Nft } from 'alchemy-sdk'
import { getNFTMetadata, getNFTOwner } from '@/utils/alchemyNftUtils'
import * as GFCJson from '@/assets/GroupFiveCollection.json'
import * as encodeBattlesJson from '@/assets/EncodeBattles.json'

type Props = {
    changeAppState: (newState: string) => void
    address: `0x${string}` | undefined
    chain:
        | (Chain & {
              unsupported?: boolean | undefined
          })
        | undefined
}

const battleResult = {
    0: 'Undecided',
    1: 'Player 1 wins',
    2: 'Player 2 wins',
    3: 'Tie match',
}
const HOME = appStateOptions.home
const encodeBattlesAbi = encodeBattlesJson.abi
const GFCAbi = GFCJson.abi

export default function Battle({ changeAppState, address, chain }: Props) {
    const [nftId, setNftId] = useState<number | null>(null)
    const [nftData, setNftData] = useState<Nft | null>(null)
    const [isOwner, setIsOwner] = useState<true | false | null>(null)
    const [openedBattle, setOpenedBattle] = useState(false)
    // const [openedBattleData, setOpenedBattleData] = useState([])
    const [battleCompleted, setBattleCompleted] = useState(false)
    const [battleCompletedData, setBattleCompletedData] = useState([])

    const { config } = usePrepareContractWrite({
        address: (process.env.NEXT_PUBLIC_ENCODE_BATTLES as `0x${string}`) ?? '',
        abi: encodeBattlesAbi,
        args: [nftId, nftData?.rawMetadata?.attributes![0].value],
        functionName: 'submitForBattle',
        chainId: sepolia.id,
        account: address as `0x${string}`,
        // onError(error) {
        // console.log('usePrepare Submit For Battle Error: ', error)
        // },
        onSettled(data) {
            console.log('usePrepare Submit for Battle Success: ', data)
        },
    })

    useContractEvent({
        address: (process.env.NEXT_PUBLIC_ENCODE_BATTLES as `0x${string}`) ?? '',
        abi: encodeBattlesAbi,
        eventName: 'BattleOpened',
        listener(log) {
            console.log('BattleOpened EVENT LOG: ', log)
            setOpenedBattle(true)
            // setOpenedBattleData(log[0].args)
        },
        chainId: sepolia.id,
    })
    useContractEvent({
        address: (process.env.NEXT_PUBLIC_ENCODE_BATTLES as `0x${string}`) ?? '',
        abi: encodeBattlesAbi,
        eventName: 'BattleCompleted',
        listener(log) {
            console.log('BattleCompleted EVENT LOG: ', log)
            setBattleCompleted(true)
            setBattleCompletedData(log[0].args)
        },
        chainId: sepolia.id,
    })

    const {
        data,
        isLoading: loadingWriteTx,
        error,
        isError: writeError,
        write,
    } = useContractWrite(config)

    function fetchNft() {
        if (nftId === null) {
            return
        }
        // check ownership
        getNFTOwner(process.env.NEXT_PUBLIC_GROUP_FIVE_COLLECTION ?? '', nftId)
            .then((data: GetOwnersForNftResponse) => {
                console.log('Nft Owner Data: ', data)
                console.log('address: ', address)
                const owner = data.owners[0]
                if (owner != address?.toLowerCase()) {
                    setIsOwner(false)
                    return
                }
                setIsOwner(true)
                // Alchemy fetch
                getNFTMetadata(process.env.NEXT_PUBLIC_GROUP_FIVE_COLLECTION ?? '', nftId)
                    .then((data: Nft) => setNftData(data))
                    .catch((e: any) => console.log('getNFTMetadata Error: ', e))
            })
            .catch((e: any) => console.log('getNFTMetadata Error: ', e))
    }

    function submitNft() {
        write?.()
    }

    const isError = false

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
                <h2 className={styles.h2}>Submit to Battle</h2>
                <div className={styles.spacer}></div>
            </div>
            <div className={styles.actionContainer}>
                {isError ? (
                    <div className={styles.infoContainer}>
                        <div className={styles.balanceContainer}>
                            <p>Your Balance</p>
                            <p>GFT: </p>
                        </div>
                    </div>
                ) : (
                    <div></div>
                )}
                <div className={styles.calculation}>
                    <Input
                        id="nft-id"
                        label="NFT ID"
                        name="nft-id"
                        onBlur={function noRefCheck() {}}
                        onChange={(e) => setNftId(Number(e.target.value))}
                        placeholder="12345"
                        type="number"
                        // value={}
                        style={{ marginBottom: '2rem' }}
                    />
                    <Button
                        isFullWidth
                        disabled={nftId === null}
                        color="blue"
                        id=""
                        onClick={() => fetchNft()}
                        size="large"
                        text="Select NFT"
                        theme="colored"
                        type="button"
                        style={{ marginBottom: '2rem' }}
                    />
                    <Button
                        isFullWidth
                        disabled={!isOwner || !nftData || !write}
                        color="blue"
                        id=""
                        onClick={() => submitNft()}
                        size="large"
                        text="Battle!"
                        theme="colored"
                        type="button"
                    />
                </div>
                {openedBattle && (
                    <p style={{ marginTop: '1rem' }}>
                        A new battle was opened! Waiting for another player...
                    </p>
                )}
                {battleCompleted && (
                    <>
                        <p style={{ marginTop: '1rem' }}>You joined and completed a battle!</p>
                        {battleCompletedData && (
                            <div>
                                <p>Battle Id: {Number(battleCompletedData[0])}</p>
                                <p>Player1: {battleCompletedData[1]}</p>
                                <p>Player1 Power: {Number(battleCompletedData[3])}</p>
                                <p>Player2: {battleCompletedData[2]}</p>
                                <p>Player2 Power: {Number(battleCompletedData[4])}</p>
                                <p>Battle Result: {battleResult[battleCompletedData[5]]}</p>
                            </div>
                        )}
                    </>
                )}
                {isOwner === false && (
                    <p style={{ marginTop: '1rem', color: 'red' }}>
                        You are not the owner of that NFT
                    </p>
                )}
            </div>
        </div>
    )
}
