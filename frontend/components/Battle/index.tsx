import { Button, Input } from '@web3uikit/core'
import styles from './battle.module.css'
import appStateOptions from '@/constants/appStateOptions'
import { useState } from 'react'
import { Chain } from 'wagmi'

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

export default function Battle({ changeAppState, address, chain }: Props) {
    const [nftId, setNftId] = useState(0)

    function fetchNft() {
        // Alchemy fetch
        // check ownership
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
                        disabled={true}
                        color="blue"
                        id=""
                        onClick={() => changeAppState(HOME)}
                        size="large"
                        text="Battle!"
                        theme="colored"
                        type="button"
                    />
                </div>
            </div>
        </div>
    )
}
