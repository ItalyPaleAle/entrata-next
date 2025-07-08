'use client'

import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'

import Auth from '@/components/Auth'
import PinPad from '@/components/PinPad'
import Spinner from '@/components/Spinner'
import StatusView from '@/components/StatusView'
import { InvalidTokenError, PinError } from '@/lib/use-api'
import Container from '@/components/Container'

export default function RootPage() {
    return (
        <Auth>
            <MainComponent />
        </Auth>
    )
}

const MainComponent = () => {
    const { isLoading, isAuthenticated, error: authError, user, loginWithRedirect } = useAuth0()
    const [pin, setPin] = useState('')
    const [attemptDelay, setAttemptDelay] = useState(0)
    const [tokenError, setTokenError] = useState(false)
    const [pinError, setPinError] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const onApiError = (err: Error) => {
        if (err instanceof InvalidTokenError) {
            setTokenError(true)
        } else if (err instanceof PinError) {
            setPin('')
            setPinError(true)

            // Clear the error after 1.5s
            setTimeout(() => {
                setPinError(false)
            }, 1500)

            setAttemptDelay(err.delay)
            if (err.delay > 0) {
                // Clear after the delay ends
                setTimeout(() => {
                    setAttemptDelay(0)
                }, err.delay)
            }
        } else {
            setPin('')
            setError(err)
        }
    }

    if (isLoading) {
        return <Spinner />
    }

    if (error || authError) {
        return (
            <div
                className="my-4 border-l-4 border-red-800 bg-red-200 p-2 text-red-800"
                role="alert">
                <h2 className="text-xl">Something went wrong…</h2>
                <p>
                    {(error && error.message) ||
                        (authError && authError.message) ||
                        'Unknown error'}
                </p>
                <p
                    className="mt-2 cursor-pointer underline"
                    onClick={() => window.location.reload()}
                    onKeyUp={() => window.location.reload()}>
                    Reload the page
                </p>
            </div>
        )
    }

    if (!isAuthenticated || !user || tokenError) {
        return (
            <Container>
                <p>Your session has expired or the authentication failed.</p>
                <button
                    onClick={() => loginWithRedirect()}
                    className="mt-4 cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
                    Authenticate
                </button>
            </Container>
        )
    }

    // Has a PIN - show status
    if (pin.length) {
        return <StatusView pin={pin} user={user} onApiError={onApiError} />
    }

    // No PIN, show pin pad
    return (
        <Container>
            <div className="my-2 rounded-lg border border-gray-300 bg-white p-2 text-sm shadow">
                👋 {user?.name || 'Entrata user'}
            </div>
            <PinPad setPin={setPin} attemptDelay={attemptDelay} pinError={pinError} />
        </Container>
    )
}
