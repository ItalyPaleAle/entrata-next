'use client'

import type { User } from '@auth0/auth0-react'

import { useApi, type UseApiOptions } from '@/lib/use-api'
import Spinner from '@/components/Spinner'
import StatusItem, { type OnToggleData } from '@/components/StatusItem'
import { useEffect, useState } from 'react'

export default function StatusView({
    user,
    pin,
    onApiError,
}: {
    user: User
    pin: string
    onApiError: (err: Error) => void
}) {
    const [zoneList, setZoneList] = useState<zoneStatus[]>([])

    const [toggleOperation, setToggleOperation] = useState<
        | {
              all?: false
              areaId: number
              active: boolean
          }
        | { all: true }
        | null
    >(null)

    let reqUrl = '/api/status'
    const reqOpts: UseApiOptions = {
        pin,
    }
    if (toggleOperation?.all) {
        reqUrl = '/api/off'
        reqOpts.method = 'POST'
    } else if (toggleOperation != null) {
        reqUrl = `/api/area/${toggleOperation.areaId}`
        reqOpts.method = 'POST'
        reqOpts.postData = {
            toggle: toggleOperation.active ? 'on' : 'off',
        }
    }

    const { loading, error, data } = useApi<zoneStatus[] | { operation: 'ok' }>(
        reqUrl,
        user!,
        reqOpts,
        [toggleOperation],
    )

    useEffect(() => {
        if (error) {
            onApiError(error)
            return
        }

        if (data && 'operation' in data) {
            // Result from turning all zones off
            setZoneList((zoneList) =>
                zoneList.map((e) => {
                    return {
                        ...e,
                        active: false,
                    }
                }),
            )
        } else if (data && Array.isArray(data)) {
            setZoneList(data)
        }
    }, [data, error, onApiError])

    const onToggle = (toggle: OnToggleData) => {
        if (toggle.all) {
            if (window.confirm('Do you want to turn off all alarms?')) {
                // Update state to trigger the API call
                setToggleOperation({
                    all: true,
                })
            }
        } else {
            if (typeof toggle?.areaId == 'undefined' || typeof toggle.active == 'undefined') {
                return
            }
            const name = toggle.name || 'this area'

            const confirmText = toggle.active
                ? 'Do you want to activate ' + name + '?'
                : 'Do you want to deactivate ' + name + '?'

            if (window.confirm(confirmText)) {
                // Update state to trigger the API call
                setToggleOperation({
                    areaId: toggle.areaId,
                    active: toggle.active,
                })
            }
        }
    }

    if (loading) {
        return <Spinner />
    }

    return (
        <div className="my-2 rounded-lg border border-gray-300 bg-white p-2 shadow">
            <p className='mx-2 my-1'>Here&apos;s the current status. Tap a zone to activate/deactivate.</p>
            <ul className="mx-2 my-4">
                {zoneList.map(({ id, name, active }) => (
                    <StatusItem
                        key={id}
                        name={name}
                        active={active}
                        areaId={id}
                        onToggle={onToggle}
                    />
                ))}
                <StatusItem areaId={-1} onToggle={onToggle} />
            </ul>
        </div>
    )
}

type zoneStatus = {
    id: number
    name: string
    active: boolean
}
