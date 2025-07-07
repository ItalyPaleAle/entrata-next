import { NextRequest, NextResponse } from 'next/server'

import { CheckPin, GetAreas } from '@/lib/local-api'

export const GET = async (request: NextRequest) => {
    if (!CheckPin(request)) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 })
    }

    // Fetch data from Redis
    const result = await GetAreas()

    // Return the result in the response
    return NextResponse.json(result, { status: 200 })
}
