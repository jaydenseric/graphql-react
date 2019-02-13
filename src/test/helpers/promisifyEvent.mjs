/**
 * Promisifies an event.
 * @param {Object} emitter An event emitter with `on` and `off` methods.
 * @param {string} event The event name.
 * @param {number} [timeout=1000] How many milliseconds to wait for the event.
 * @returns {Promise<*>} Event data.
 * @see [Stack Overflow answer](https://stackoverflow.com/a/40353376/1596978).
 * @ignore
 */
export const promisifyEvent = (emitter, event, timeout = 1000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      emitter.off(event, listener)
      reject(new Error(`Event “${event}” wait timeout.`))
    }, timeout)

    /**
     * Listener for the event.
     * @param {*} data Event data.
     * @ignore
     */
    function listener(data) {
      clearTimeout(timer)
      emitter.off(event, listener)
      resolve(data)
    }

    emitter.on(event, listener)
  })
