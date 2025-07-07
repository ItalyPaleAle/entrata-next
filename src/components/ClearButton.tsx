'use client'

import { useState } from 'react'

export default function ClearButton({ onPressed }: { onPressed: () => void }) {
    // Does this device have support for hover?
    const canHover = !(typeof window !== 'undefined' && !window.matchMedia('(hover: none)').matches)
    const [hover, setHover] = useState(false)

    // Handle clicks
    function click() {
        onPressed()

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
                    ? 'm-3 flex h-20 w-20 cursor-pointer rounded-full border-4 border-gray-600 bg-gray-200 text-gray-700 shadow-2xl'
                    : 'm-3 flex h-20 w-20 cursor-pointer rounded-full border-4 border-gray-500 bg-gray-200 text-gray-600 shadow-lg hover:border-gray-600 hover:text-gray-700 hover:shadow-2xl'
            }
            onClick={click}
            onKeyUp={click}>
            <div className="m-auto text-2xl font-bold">C</div>
        </button>
    )
}
