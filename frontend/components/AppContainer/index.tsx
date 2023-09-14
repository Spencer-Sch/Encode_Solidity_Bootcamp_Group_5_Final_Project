import appStateOptions from '@/constants/appStateOptions'
import styles from './appContainer.module.css'
import Home from '../Home'
import BuyToken from '../BuyToken'
import BuyNft from '../BuyNft'
import Battle from '../Battle'
import { useAccount, useNetwork } from 'wagmi'

type Props = {
    appState: string
    changeAppState: (newState: string) => void
    // changeAppState: React.Dispatch<React.SetStateAction<string>>
}

const HOME = appStateOptions.home
const BUY_TOKEN = appStateOptions.buyToken
const BUY_NFT = appStateOptions.buyNft
const BATTLE = appStateOptions.battle

export default function AppContainer({ appState, changeAppState }: Props) {
    const { address, isConnecting, isDisconnected } = useAccount()
    const { chain } = useNetwork()
    if (address)
        return (
            <div className={styles.container}>
                {appState === HOME && <Home changeAppState={changeAppState}></Home>}
                {appState === BUY_TOKEN && (
                    <BuyToken
                        changeAppState={changeAppState}
                        address={address}
                        chain={chain}
                    ></BuyToken>
                )}
                {appState === BUY_NFT && (
                    <BuyNft
                        changeAppState={changeAppState}
                        address={address}
                        chain={chain}
                    ></BuyNft>
                )}
                {appState === BATTLE && (
                    <Battle
                        changeAppState={changeAppState}
                        address={address}
                        chain={chain}
                    ></Battle>
                )}
            </div>
        )
    if (isConnecting)
        return (
            <div className={styles.container}>
                <h2> Loading Wallet Info...</h2>
            </div>
        )
    // if (isDisconnected)
    //     return (
    //         <div className={styles.container}>
    //             <h2>Wallet Disconnected</h2>
    //         </div>
    //     )
    return (
        <div className={styles.container}>
            <h2>Please connect your wallet</h2>
        </div>
    )
}
