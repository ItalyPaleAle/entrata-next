import './globals.css'

import type { Metadata } from 'next'
import getConfig from 'next/config'
import { Open_Sans } from 'next/font/google'

const { publicRuntimeConfig } = getConfig()

const openSans = Open_Sans({
    variable: '--font-open-sans',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'SFHome Entrata',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body
                className={`${openSans.className} bg-stone-100 leading-normal tracking-wide text-gray-900 antialiased`}>
                <div className="mx-auto flex min-h-screen w-full max-w-96 flex-col justify-between px-3 py-2">
                    <section>
                        <h1 className="text-3xl">{(metadata.title || '') + ''}</h1>
                        {children}
                    </section>
                    <footer className="mt-4 text-center text-xs">
                        {publicRuntimeConfig?.package?.name} {publicRuntimeConfig?.package?.version}
                        . Made with ❤️ by Ale.
                    </footer>
                </div>
            </body>
        </html>
    )
}
