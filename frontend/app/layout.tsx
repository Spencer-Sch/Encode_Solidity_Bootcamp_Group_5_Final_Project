'use client'
import { WagmiConfig, createConfig, mainnet, sepolia } from 'wagmi'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

const config = createConfig(
    getDefaultConfig({
        // Required API Keys
        alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',

        // Networks
        chains: [sepolia, mainnet],

        // Required
        appName: 'Encode Battles',

        // Optional
        appDescription: 'An NFT Battle App',
        appUrl: 'https://family.co', // your app's url
        appIcon: 'https://family.co/logo.png', // your app's logo,no bigger than 1024x1024px (max. 1MB)
    })
)

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <WagmiConfig config={config}>
                <ConnectKitProvider mode="dark">
                    <body
                        style={{
                            overflowX: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '105vh',
                            }}
                        >
                            <Navbar />
                            <div style={{ flexGrow: 1 }}>{children}</div>
                            {/* <Footer /> */}
                        </div>
                    </body>
                </ConnectKitProvider>
            </WagmiConfig>
        </html>
    )
}
