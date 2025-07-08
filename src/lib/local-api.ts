import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

// Initialize Redis
const redis = Redis.fromEnv()

const areasKey = 'areas'
const failedAttemptsKey = 'failed-attempts'
const redisTtl = 1800 // In seconds

// Rate limiting constants
const maxFailedAttempts = 3
const rateLimitWindowSeconds = 30 // 30s window
const rateLimitBlockSeconds = 30 // 30s block after limit reached

export type AreaStatus = {
    id: number
    name: string
    active: boolean
}

const defaultAreas: AreaStatus[] = [
    { id: 0, name: 'External', active: true },
    { id: 1, name: 'Internal', active: false },
]

function getRedisKey(key: string) {
    if (process.env.VERCEL_BRANCH_URL) {
        return key + '-' + process.env.VERCEL_BRANCH_URL
    }

    return key
}

export function CheckPin(request: NextRequest): boolean {
    if (!process.env.LOCAL_PIN) {
        throw Error('Env variable LOCAL_PIN not set')
    }
    const pin = request.headers.get('X-System-Code')
    return pin == process.env.LOCAL_PIN
}

export async function GetAreas(): Promise<AreaStatus[]> {
    // Get the value, or set the default one if it doesn't exist
    const res = await redis.set<AreaStatus[] | null>(getRedisKey(areasKey), defaultAreas, {
        nx: true,
        get: true,
        ex: redisTtl || undefined,
    })
    if (!res) {
        // If the response is empty, the item was just created
        return defaultAreas
    } else if (res == 'OK') {
        throw new Error("Failed to perform Redis operation: response doesn't contain data")
    }
    return res
}

export async function UpdateArea(areaId: number, active: boolean): Promise<AreaStatus[]> {
    // This performs a get and a set
    // Redis is non-transactional (and doesn't support Compare-And-Swap natively) so there's a risk of race conditions... but because this API is only meant for test, we don't care 🤷
    const areas = await GetAreas()
    for (let i = 0; i < areas.length; i++) {
        if (areas[i].id == areaId) {
            areas[i].active = active
            break
        }
    }

    const res = await redis.set(getRedisKey(areasKey), areas, {
        ex: redisTtl || undefined,
    })
    if (res != 'OK') {
        throw new Error('Failed to perform Redis operation: response is not OK')
    }

    return areas
}

export async function DeactivateAllAreas() {
    // Start from the default list of areas and turn them all off
    const areas = defaultAreas.map((area) => {
        return {
            ...area,
            active: false,
        }
    })

    const res = await redis.set(getRedisKey(areasKey), areas)
    if (res != 'OK') {
        throw new Error('Failed to perform Redis operation: response is not OK')
    }
}

export async function RecordFailedAttempt(): Promise<boolean> {
    const now = Date.now()

    // Get the current attempts from Redis and filter for only those within the rate limit window
    const key = getRedisKey(failedAttemptsKey)
    const attempts = ((await redis.get<number[]>(key)) || []).filter(
        (attemptTime) => now - attemptTime < rateLimitWindowSeconds * 1000,
    )

    // Add the current attempt timestamp
    attempts.push(now)

    // Store the updated attempts list
    await redis.set(getRedisKey(failedAttemptsKey), attempts, {
        ex: rateLimitWindowSeconds + rateLimitBlockSeconds,
    })

    // Return false if rate limited
    return attempts.length <= maxFailedAttempts
}

export async function CanAttempt(): Promise<{ allowed: boolean; delay: number }> {
    const now = Date.now()

    // Get the current attempts from Redis and filter for only those within the rate limit window
    const key = getRedisKey(failedAttemptsKey)
    const attempts = ((await redis.get<number[]>(key)) || []).filter(
        (attemptTime) => now - attemptTime < rateLimitWindowSeconds * 1000,
    )

    if (attempts.length >= maxFailedAttempts) {
        // We're rate limited
        // Calculate when the oldest attempt will expire from the window
        const timeToReset = Math.ceil(
            (attempts[0] + (rateLimitWindowSeconds + rateLimitBlockSeconds) * 1000 - now) / 1000,
        )

        return {
            allowed: false,
            delay: Math.max(0, timeToReset),
        }
    }

    // Not rate limited
    return {
        allowed: true,
        delay: 0,
    }
}
