import { NextRequest, NextResponse } from 'next/server'

import { CanAttempt, CheckPin, GetAreas, RecordFailedAttempt } from '@/lib/local-api'

export const GET = async (request: NextRequest) => {
    const attempts = await CanAttempt()
    if (!attempts.allowed) {
        const headers = new Headers()
        if (attempts.delay > 0) {
            const retryDate = new Date(Date.now() + attempts.delay * 1000)
            headers.set('Retry-After', retryDate.toUTCString())
        }
        return NextResponse.json({ error: 'Try later' }, { status: 429, headers })
    }

    if (!CheckPin(request)) {
        await RecordFailedAttempt()
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 })
    }

    // Fetch data from Redis
    const result = await GetAreas()

    // Return the result in the response
    return NextResponse.json(result, { status: 200 })
}
