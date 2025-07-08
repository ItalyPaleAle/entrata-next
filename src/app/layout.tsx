import './globals.css'

import type { Metadata, Viewport } from 'next'
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

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

const splashScreens = [
    {
        href: '/splashscreens/iphone5_splash.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
    },
    {
        href: '/splashscreens/iphone6_splash.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
    },
    {
        href: '/splashscreens/iphoneplus_splash.png',
        media: '(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)',
    },
    {
        href: '/splashscreens/iphonex_splash.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
    },
    {
        href: '/splashscreens/iphonexr_splash.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
    },
    {
        href: '/splashscreens/iphonexsmax_splash.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
    },
    {
        href: '/splashscreens/ipad_splash.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
    },
    {
        href: '/splashscreens/ipadpro1_splash.png',
        media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)',
    },
    {
        href: '/splashscreens/ipadpro3_splash.png',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
    },
    {
        href: '/splashscreens/ipadpro2_splash.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
    },
]

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />

            {splashScreens.map(({ href, media }) => (
                <link key={media} href={href} media={media} rel="apple-touch-startup-image" />
            ))}

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
