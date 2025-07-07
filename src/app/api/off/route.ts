import { NextRequest, NextResponse } from 'next/server'

import { CheckPin, DeactivateAllAreas } from '@/lib/local-api'

export const POST = async (request: NextRequest) => {
    if (!CheckPin(request)) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 })
    }

    // Execute in Redis
    await DeactivateAllAreas()

    return NextResponse.json({ operation: 'ok' }, { status: 200 })
}
