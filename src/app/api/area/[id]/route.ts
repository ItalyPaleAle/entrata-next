import { NextRequest, NextResponse } from 'next/server'

import { CanAttempt, CheckPin, RecordFailedAttempt, UpdateArea } from '@/lib/local-api'

export const POST = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) => {
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

    const idStr = (await params)?.id
    if (!idStr) {
        return NextResponse.json({ error: 'Missing id in URL' }, { status: 400 })
    }
    const id = parseInt(idStr, 10)
    if (id < 0 || id > 1000) {
        return NextResponse.json({ error: 'Invalid id in URL' }, { status: 400 })
    }

    // Get the body
    const data = await request.formData()
    const toggle = data.get('toggle')
    if (toggle != 'on' && toggle != 'off') {
        return NextResponse.json(
            { error: 'Body must contain property "toggle" as either "on" or "off"' },
            { status: 400 },
        )
    }

    // Update the data in Redis
    const result = await UpdateArea(id, toggle == 'on')

    // Return the result in the response
    return NextResponse.json(result, { status: 200 })
}
