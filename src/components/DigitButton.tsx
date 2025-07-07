'use client'

import { useState } from 'react'

export default function DigitButton({
    digit,
    onPressed,
}: {
    digit: number
    onPressed: (digit: number) => void
}) {
    // Does this device have support for hover?
    const canHover = !(typeof window !== 'undefined' && !window.matchMedia('(hover: none)').matches)
    const [hover, setHover] = useState(false)

    // Handle clicks
    function click() {
        onPressed(digit)

        // Highlight the element for just a moment
        if (!canHover) {
            setHover(true)
            setTimeout(() => {
                setHover(false)
            }, 50)
        }
    }

    return (
        <button
            className={
                hover
                    ? 'm-3 flex h-20 w-20 cursor-pointer rounded-full border-4 border-blue-600 bg-gray-600 text-gray-200 shadow-2xl hover:text-gray-100'
                    : 'm-3 flex h-20 w-20 cursor-pointer rounded-full border-4 border-blue-400 bg-gray-600 text-gray-200 shadow-lg hover:border-blue-600 hover:text-gray-100 hover:shadow-2xl'
            }
            onClick={click}
            onKeyUp={click}>
            <div className="m-auto text-2xl font-bold">{digit}</div>
        </button>
    )
}
