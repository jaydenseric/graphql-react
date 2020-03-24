/**
 * Sleeps the process for a specified duration.
 * @param {number} ms Duration in milliseconds.
 * @returns {Promise<void>} Resolves once the duration is up.
 * @ignore
 */
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
