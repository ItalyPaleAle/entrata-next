/**
 * Returns a Promise that resolves after a certain amount of time, in ms
 */
export function WaitPromise(time: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, time || 0)
    })
}

/**
 * Sets a timeout on a Promise, so it's automatically rejected if it doesn't resolve within a certain time.
 *
 * @param promise Promise to execute
 * @param Timeout Timeout in ms
 * @returns Promise with a timeout
 */
export function TimeoutPromise<T>(promise: Promise<T>, timeout: number) {
    return Promise.race([
        WaitPromise(timeout).then(() => {
            throw Error('Promise has timed out')
        }),
        promise,
    ])
}
