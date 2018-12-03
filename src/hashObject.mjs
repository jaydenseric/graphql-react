import fnv1a from 'fnv1a'

/**
 * Hashes an object.
 * @kind function
 * @name hashObject
 * @param {Object} object Fetch options.
 * @returns {string} A hash.
 * @ignore
 */
export const hashObject = object => fnv1a(JSON.stringify(object)).toString(36)
