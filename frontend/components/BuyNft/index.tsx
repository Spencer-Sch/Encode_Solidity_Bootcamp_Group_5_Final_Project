import { Button, Input } from '@web3uikit/core'
import styles from './buyNft.module.css'
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
export default function BuyNft({ changeAppState, address, chain }: Props) {
    const [gftBalance, setgftBalance] = useState(0)

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
                        <p>GFT: {gftBalance}</p>
                    </div>
                    <div className={styles.priceContainer}>
                        <p>NFT Price:</p>
                        <p>0.5 GFT</p>
                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    <Button
                        isFullWidth
                        color="blue"
                        id=""
                        onClick={() => changeAppState(HOME)}
                        size="large"
                        text="Purchase GFT"
                        theme="colored"
                        type="button"
                    />
                </div>
            </div>
        </div>
    )
}
