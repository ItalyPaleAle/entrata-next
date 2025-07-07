'use client'

import { Auth0Provider } from '@auth0/auth0-react'

export default function Auth({ children }: { children: React.ReactNode }) {
    if (!process.env.NEXT_PUBLIC_AUTH0_DOMAIN) {
        throw Error('Env variable NEXT_PUBLIC_AUTH0_DOMAIN not set')
    }
    if (!process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID) {
        throw Error('Env variable NEXT_PUBLIC_AUTH0_CLIENT_ID not set')
    }
    return (
        <Auth0Provider
            domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
            clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: (typeof window !== 'undefined' && window.location.origin) || '',
            }}>
            {children}
        </Auth0Provider>
    )
}
