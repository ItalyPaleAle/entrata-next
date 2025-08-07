import type { User } from '@auth0/auth0-react'

export class EntrataClaims {
    url?: string
    payload?: string

    constructor(user: User | null) {
        // Check if we're overriding the URL during development
        if (process.env.NEXT_PUBLIC_SERVER_URL == 'local') {
            // Set to / to make calls to the local URL
            this.url = '/'
            this.payload = '-'
            return
        }

        const namespace = process.env.NEXT_PUBLIC_ID_TOKEN_NAMESPACE
        if (!namespace) {
            throw Error('Env variable NEXT_PUBLIC_ID_TOKEN_NAMESPACE not set')
        }

        if (!user || !user[namespace]) {
            return
        }

        // Check for the custom claim namespace
        // TODO: Find a better way - should not be using the ID token for this stuff
        const data = user[namespace] as { url?: string; payload?: string } | undefined
        if (data?.url && data?.payload) {
            this.payload = data.payload

            // Check if we're overriding the URL during development
            this.url = data.url
            if (process.env.NEXT_PUBLIC_SERVER_URL) {
                this.url = process.env.NEXT_PUBLIC_SERVER_URL
            }

            // Ensure URL ends with `/`
            if (!this.url.endsWith('/')) {
                this.url += '/'
            }
        }
    }
}
