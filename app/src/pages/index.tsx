import { Inter } from 'next/font/google'
import Head from 'next/head'

import App from '../Components/App'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    return (
        <>
            <Head>
                <title>Zombordle</title>
                <meta
                    name="description"
                    content="An accessible wordle-like thinger"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main
                className={`${inter.className}`}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <App />
            </main>
        </>
    )
}
