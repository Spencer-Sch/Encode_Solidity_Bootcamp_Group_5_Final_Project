import { Button, Input } from '@web3uikit/core'
import appStateOptions from '@/constants/appStateOptions'
import styles from './buyToken.module.css'
import { useState } from 'react'
import { Chain } from 'wagmi'

type Props = {
    changeAppState: React.Dispatch<React.SetStateAction<string>>
    address: `0x${string}` | undefined
    chain:
        | (Chain & {
              unsupported?: boolean | undefined
          })
        | undefined
}

const HOME = appStateOptions.home

export default function BuyToken({ changeAppState, address, chain }: Props) {
    const [ethBalance, setEthBalance] = useState(0)
    const [gftBalance, setgftBalance] = useState(0)
    const [ethInput, setEthInput] = useState(0)
    const [gftInput, setGftInput] = useState(0)

    function calculateEthToGft(value: string): void {
        setGftInput(Number(value) * 100)
    }

    function calculateGftToEth(value: string): void {
        setEthInput(Number(value) / 100)
    }

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
                <h2 className={styles.h2}>Purchase GFT with ETH</h2>
                <div className={styles.spacer}></div>
            </div>
            <div className={styles.actionContainer}>
                <p>Your Balance</p>
                <div className={styles.balanceContainer}>
                    <p>ETH: {ethBalance}</p>
                    <p>GFT: {gftBalance}</p>
                </div>
                <div className={styles.calculation}>
                    <Input
                        id="eth-input"
                        label="ETH"
                        name="eth-input"
                        onBlur={function noRefCheck() {}}
                        onChange={(e) => calculateEthToGft(e.target.value)}
                        placeholder="0.01"
                        type="number"
                        value={ethInput}
                        style={{ marginBottom: '2rem' }}
                    />
                    <Input
                        id="gft-input"
                        label="GFT"
                        name="gft-input"
                        onBlur={function noRefCheck() {}}
                        onChange={(e) => calculateGftToEth(e.target.value)}
                        placeholder="0.01"
                        type="number"
                        value={gftInput}
                        style={{ marginBottom: '2rem' }}
                    />
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
