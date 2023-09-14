import { Button, Input } from '@web3uikit/core'
import appStateOptions from '@/constants/appStateOptions'
import styles from './buyToken.module.css'
import { useEffect, useState } from 'react'
import {
    Chain,
    sepolia,
    useWaitForTransaction,
    useBalance,
    usePrepareSendTransaction,
    useSendTransaction,
    usePrepareContractWrite,
    useContractWrite,
} from 'wagmi'
import { parseEther } from 'viem'
import * as tokenSaleJson from '@/assets/TokenSale.json'
import { useDebounce } from '@/hooks/useDebounce'

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

export default function BuyToken({ changeAppState, address, chain }: Props) {
    const [ethInput, setEthInput] = useState(0)
    const [gftInput, setGftInput] = useState(0)

    const debouncedEthInput = useDebounce(ethInput)

    function calculateEthToGft(value: string): void {
        setEthInput(Number(value))
        setGftInput(Number(value) * 100)
        // refetch().catch((e) => console.error('refetch error', e))
    }

    function calculateGftToEth(value: string): void {
        setEthInput(Number(value) / 100)
        setGftInput(Number(value))
        // refetch().catch((e) => console.error('refetch error', e))
    }

    function handleSubmit(e: any) {
        e.preventDefault()
        console.log('ethInput: ', ethInput)
        write?.()
    }

    const {
        data: gftData,
        isError: gftBalanceError,
        isLoading: gftBalanceLoading,
        refetch: refetchGFT,
    } = useBalance({
        address: address,
        token: process.env.NEXT_PUBLIC_GROUP_FIVE_TOKEN as `0x${string}`,
    })

    const {
        data: ethData,
        isError: ethBalanceError,
        isLoading: ethBalanceLoading,
        refetch: refetchETH,
    } = useBalance({
        address: address,
    })

    const { config } = usePrepareContractWrite({
        address: (process.env.NEXT_PUBLIC_TOKEN_SALE as `0x${string}`) ?? '',
        abi: tokenSaleAbi,
        functionName: 'buyTokens',
        chainId: sepolia.id,
        account: address as `0x${string}`,
        value: parseEther(`${debouncedEthInput}`),
        onError(error) {
            console.log('usePrepare Purchase Token Error: ', error)
        },
        onSettled(data) {
            console.log('usePrepare Purchase Token Success: ', data)
        },
    })

    const { data, isLoading: loadingWriteTx, error, isError, write } = useContractWrite(config)
    const { isLoading: awaitingTx, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })

    useEffect(() => {
        refetchETH().catch((e) => console.log('refetchETH error: ', e))
        refetchGFT().catch((e) => console.log('refetchGFT error: ', e))
    }, [isSuccess])

    // console.log('awaitingTX: ', awaitingTX)
    // console.log('sendTransaction double banged: ', !!sendTransaction)
    // console.log('sendTransaction: ', sendTransaction)

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
                    <p>SEP: {ethData?.formatted.slice(0, 5)}</p>
                    <p>GFT: {gftData?.formatted.slice(0, 5)}</p>
                </div>
                <form
                    className={styles.form}
                    onSubmit={(e) => {
                        handleSubmit(e)
                    }}
                >
                    <Input
                        id="eth-input"
                        label="ETH"
                        name="eth-input"
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
                        onChange={(e) => calculateGftToEth(e.target.value)}
                        placeholder="0.01"
                        type="number"
                        value={gftInput}
                        style={{ marginBottom: '2rem' }}
                    />
                    <Button
                        isFullWidth
                        // true === disabled
                        // false === enabled
                        disabled={!write || awaitingTx || loadingWriteTx || ethInput <= 0}
                        // disabled={!write | awaitingTX || loadingWriteTx}
                        color="blue"
                        id=""
                        size="large"
                        text={awaitingTx || loadingWriteTx ? 'Please wait...' : 'Purchase GFT'}
                        theme="colored"
                        type="submit"
                    />
                </form>
                {loadingWriteTx && <div>Sign Transaction...</div>}
                {awaitingTx && <div>Waiting for Transaction...</div>}
                {isSuccess && (
                    <div>
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
            </div>
        </div>
    )
}
