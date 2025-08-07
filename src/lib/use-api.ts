import { DependencyList, useEffect, useState } from 'react'
import { useAuth0, type User } from '@auth0/auth0-react'

import { EntrataClaims } from '@/lib/session'
import { TimeoutPromise } from './promises'

const requestTimeout = 20000 // 20s

export type UseApiOptions = {
    pin?: string
    method?: 'GET' | 'POST' | 'PUT'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postData?: Record<string, any>
    headers?: Record<string, string>
}

export class EntrataClaimsMissingError extends Error {
    constructor() {
        super(
            'Your account does not have the required profile data. Please contact an administrator.',
        )
    }
}

export class InvalidTokenError extends Error {
    constructor() {
        super('Token is not valid')
    }
}

export class PinError extends Error {
    delay: number

    constructor(delay?: number | null) {
        super('Invalid PIN')

        this.delay = delay || 0
    }
}

export const useApi = <T>(
    path: string | null,
    user: User,
    options?: UseApiOptions,
    deps?: DependencyList,
) => {
    if (!options) {
        options = {}
    }

    const { getAccessTokenSilently } = useAuth0()
    const [state, setState] = useState<{ error: Error | null; loading: boolean; data: T | null }>({
        error: null,
        loading: false,
        data: null,
    })

    useEffect(
        () => {
            ;(async () => {
                if (!path) {
                    return
                }

                setState((state) => {
                    return {
                        ...state,
                        loading: true,
                    }
                })

                try {
                    const entrataClaims = new EntrataClaims(user)
                    if (process.env.NEXT_PUBLIC_SERVER_URL == 'local') {
                        entrataClaims.payload = '-'
                        entrataClaims.url = 'local'
                    } else if (!entrataClaims?.payload || !entrataClaims.url) {
                        throw new EntrataClaimsMissingError()
                    }

                    // Ensure we have an access token
                    const accessToken = await getAccessTokenSilently({
                        authorizationParams: {
                            audience: 'https://entrata.sfhome.ovh',
                        },
                        cacheMode: 'on',
                    })

                    // Set the options
                    const fetchOptions: RequestInit & { headers: Headers } = {
                        method: 'GET',
                        cache: 'no-store',
                        credentials: 'omit',
                        headers: new Headers(),
                    }
                    if (options.method) {
                        fetchOptions.method = options.method
                    }

                    // Set POST data, if any
                    if (options.postData) {
                        fetchOptions.method = 'POST'
                        const postParams = new URLSearchParams(Object.entries(options.postData))
                        fetchOptions.body = postParams
                    }

                    // Headers
                    if (options.headers && typeof options.headers === 'object') {
                        Object.entries(options.headers).forEach(([key, value]) => {
                            fetchOptions.headers.set(key, value)
                        })
                    }

                    // Auth headers
                    fetchOptions.headers.set('Authorization', 'Bearer ' + accessToken)
                    fetchOptions.headers.set('X-System-Creds', entrataClaims.payload)
                    if (options.pin) {
                        fetchOptions.headers.set('X-System-Code', options.pin)
                    }

                    const url =
                        entrataClaims.url + (path.startsWith('/') ? path.substring(1) : path)
                    const response = await TimeoutPromise(fetch(url, fetchOptions), requestTimeout)

                    // Check if we have a response with status code 200-299
                    if (!response) {
                        throw Error('Invalid response object')
                    }

                    if (!response.ok) {
                        // Check if there's a Retry-After
                        const retry = response.headers.get('retry-after')
                        let delay = null
                        if (retry) {
                            const retryTime = new Date(retry).getTime()
                            const now = Date.now()
                            if (retryTime > 0 && retryTime > now) {
                                delay = retryTime - now
                            }
                        }

                        // Check the status code
                        switch (response.status) {
                            // If the status code is 401 (Unauthorized), it means the JWT is invalid or expired, so clear the profile variable
                            case 401:
                                throw new InvalidTokenError()
                            // If the status code is 403 (Forbidden), it means the PIN is incorrect
                            // Likewise, a 429 means that the PIN was typed incorrectly too many times
                            case 403:
                            case 429:
                                throw new PinError(delay)
                            default:
                                throw Error('Invalid response status code')
                        }
                    }

                    // We're expecting JSON
                    const ct = (response.headers.get('content-type') || '').split(';')[0]
                    if (ct != 'application/json') {
                        throw Error('Response was not JSON')
                    }

                    // Read the response stream and get the data as json
                    const data = await response.json()

                    setState((state) => {
                        return {
                            ...state,
                            data,
                            error: null,
                            loading: false,
                        }
                    })
                } catch (error) {
                    setState((state) => {
                        return {
                            ...state,
                            error: error as Error,
                            loading: false,
                        }
                    })
                }
            })()
        },
        deps ? [...deps] : [],
    ) // eslint-disable-line react-hooks/exhaustive-deps

    return state
}
