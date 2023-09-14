import { Button } from '@web3uikit/core'
import styles from './home.module.css'
import appStateOptions from '@/constants/appStateOptions'

type Props = {
    changeAppState: (newState: string) => void
}

const HOME = appStateOptions.home
const BUY_TOKEN = appStateOptions.buyToken
const BUY_NFT = appStateOptions.buyNft
const BATTLE = appStateOptions.battle

export default function Home({ changeAppState }: Props) {
    return (
        <div className={styles.container}>
            <h2>Home</h2>
            <div className={styles.buttonContainer}>
                <Button
                    color="blue"
                    id=""
                    isFullWidth
                    onClick={() => changeAppState(BUY_TOKEN)}
                    size="large"
                    text="Buy Token"
                    theme="colored"
                    type="button"
                />
                <Button
                    color="blue"
                    id=""
                    isFullWidth
                    onClick={() => changeAppState(BUY_NFT)}
                    size="large"
                    text="Buy Nft"
                    theme="colored"
                    type="button"
                />
                <Button
                    color="blue"
                    id=""
                    isFullWidth
                    onClick={() => changeAppState(BATTLE)}
                    size="large"
                    text="Battle"
                    theme="colored"
                    type="button"
                />
            </div>
        </div>
    )
}
