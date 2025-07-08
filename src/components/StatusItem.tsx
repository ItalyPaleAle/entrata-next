import React, { useState, useCallback } from 'react'
import SwitchButton from '@/components/SwitchButton'

interface StatusItemProps {
    areaId: number
    name?: string
    active?: boolean
    onToggle?: (data: OnToggleData) => void
}

export type OnToggleData =
    | {
          all?: false
          areaId: number
          active: boolean
          name?: string
      }
    | { all: true }

export default function StatusItem({ areaId, name, active, onToggle: onClick }: StatusItemProps) {
    const [hover, setHover] = useState(false)

    // Detect if device supports hover
    const canHover = !(typeof window !== 'undefined' && !window.matchMedia('(hover: none)').matches)

    // Click handler
    const handleClick = useCallback(() => {
        if (areaId >= 0) {
            onClick?.({ areaId, active: !active, name })
        } else {
            onClick?.({ all: true })
        }

        // Highlight for a moment if no hover support
        if (!canHover) {
            setHover(true)
            setTimeout(() => setHover(false), 50)
        }
    }, [areaId, active, name, onClick, canHover])

    // Keyboard handler (Enter/Space)
    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleClick()
            }
        },
        [handleClick],
    )

    return (
        <li className="list-none m-2" tabIndex={0} onClick={handleClick} onKeyUp={handleKeyPress}>
            <span
                className={
                    hover
                        ? `flex cursor-pointer flex-row items-center rounded-lg border border-gray-300 bg-gray-300 p-2 shadow`
                        : `flex cursor-pointer flex-row items-center rounded-lg border border-gray-300 p-2 shadow hover:bg-gray-300`
                }>
                {areaId >= 0 ? (
                    <>
                        <span style={{ width: 60 }} className="inline-block flex-grow-0">
                            <SwitchButton active={active} />
                        </span>
                        <span className="w-0 flex-grow truncate">{name}</span>
                    </>
                ) : (
                    <>
                        <span
                            style={{ height: 38, width: 60 }}
                            className="inline-block flex-grow-0"></span>
                        <span className="w-0 flex-grow truncate">Deactivate all alarms</span>
                    </>
                )}
            </span>
        </li>
    )
}
