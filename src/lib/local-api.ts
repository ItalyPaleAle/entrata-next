import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

// Initialize Redis
const redis = Redis.fromEnv()

const redisKey = 'areas'
const redisTtl = 1800 // In seconds

export type AreaStatus = {
    id: number
    name: string
    active: boolean
}

const defaultAreas: AreaStatus[] = [
    { id: 0, name: 'External', active: true },
    { id: 1, name: 'Internal', active: false },
]

function getRedisKey() {
    if (process.env.VERCEL_BRANCH_URL) {
        return redisKey + '-' + process.env.VERCEL_BRANCH_URL
    }

    return redisKey
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
    const res = await redis.set<AreaStatus[] | null>(getRedisKey(), defaultAreas, {
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

    const res = await redis.set(getRedisKey(), areas, {
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

    const res = await redis.set(getRedisKey(), areas)
    if (res != 'OK') {
        throw new Error('Failed to perform Redis operation: response is not OK')
    }
}
