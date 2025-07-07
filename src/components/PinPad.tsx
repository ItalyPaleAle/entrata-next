import { useState, type Dispatch, type SetStateAction } from 'react'

import ClearButton from '@/components/ClearButton'
import DigitButton from '@/components/DigitButton'

const pinLength = 6

export default function PinPad({
    setPin,
    attemptDelay,
    pinError,
}: {
    setPin: Dispatch<SetStateAction<string>>
    attemptDelay: number
    pinError: boolean
}) {
    const [pinInput, setPinInput] = useState('')

    // Handler for when buttons are pressed
    function buttonPressed(number: number) {
        if (number > 9 || number < 0) {
            return
        }

        const updatedPin = pinInput + (number + '')
        if (updatedPin.length > pinLength - 1) {
            // Set the final pin
            setPin(updatedPin.slice(0, pinLength))
            setPinInput('')
        } else {
            setPinInput(updatedPin)
        }
    }

    // Handler for when the clear button is pressed
    function clearButtonPressed() {
        setPinInput('')
    }

    // Dots logic
    const dots = []
    for (let i = 0; i < pinLength; i++) {
        dots.push(i < pinInput.length)
    }

    return (
        <div className="relative">
            {attemptDelay > 0 && (
                <div className="absolute z-50 -mt-2 flex h-full w-full flex-col justify-center space-y-3 rounded-lg bg-red-600 px-10 py-1 text-center text-white opacity-95">
                    <p className="text-xl">Too many wrong PIN attempts!</p>
                    <p>Please wait {formatWaitTime(attemptDelay)}</p>
                </div>
            )}
            <div className="relative my-4 flex justify-center">
                {pinError && !pinInput.length && (
                    <span className="absolute -mt-2 rounded-lg border-red-700 bg-red-700 px-10 py-1 text-center text-white opacity-75">
                        Invalid PIN
                    </span>
                )}
                {dots.map((active, idx) => (
                    <span
                        key={idx}
                        className={
                            `mx-2 inline-block h-6 w-6 rounded-full border-4 border-gray-400 ` +
                            (active ? 'border-gray-600 bg-gray-600' : '') +
                            (pinError && !pinInput.length ? 'border-red-200 bg-red-200' : '')
                        }></span>
                ))}
            </div>
            <div className="flex">
                <DigitButton digit={1} onPressed={buttonPressed} />
                <DigitButton digit={2} onPressed={buttonPressed} />
                <DigitButton digit={3} onPressed={buttonPressed} />
            </div>
            <div className="flex">
                <DigitButton digit={4} onPressed={buttonPressed} />
                <DigitButton digit={5} onPressed={buttonPressed} />
                <DigitButton digit={6} onPressed={buttonPressed} />
            </div>
            <div className="flex">
                <DigitButton digit={7} onPressed={buttonPressed} />
                <DigitButton digit={8} onPressed={buttonPressed} />
                <DigitButton digit={9} onPressed={buttonPressed} />
            </div>
            <div className="flex">
                <ClearButton onPressed={clearButtonPressed} />
                <DigitButton digit={0} onPressed={buttonPressed} />
            </div>
        </div>
    )
}

function formatWaitTime(ms: number) {
    if (ms < 90 * 1000) {
        const seconds = Math.ceil(ms / 1000)
        return `${seconds} second${seconds > 1 ? 's' : ''}`
    } else if (ms < 5400 * 1000) {
        const minutes = Math.ceil(ms / (60 * 1000))
        return `${minutes} minute${minutes > 1 ? 's' : ''}`
    } else {
        const hours = Math.ceil(ms / (3600 * 1000))
        return `${hours} hour${hours > 1 ? 's' : ''}`
    }
}
