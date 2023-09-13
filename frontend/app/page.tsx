'use client'
import styles from './page.module.css'
import './globals.css'
import { useState } from 'react'
import AppContainer from '../components/AppContainer'

export default function Page() {
    const [appState, setAppState] = useState<'home' | 'buyToken' | 'buyNft' | 'battle'>('home')

    function changeAppState(newState: string) {
        switch (newState) {
            case 'home':
                setAppState('home')
                break
            case 'buyToken':
                setAppState('buyToken')
                break
            case 'buyNft':
                setAppState('buyNft')
                break
            case 'battle':
                setAppState('battle')
                break
            default:
                setAppState('home')
        }
    }

    return (
        <main className={styles.main}>
            <h1 className={styles.h1}>Encode Battles</h1>
            <AppContainer appState={appState} changeAppState={changeAppState} />
        </main>
    )
}
