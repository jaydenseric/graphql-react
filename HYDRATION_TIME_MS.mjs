// @ts-check

/** @import useAutoLoad from "./useAutoLoad.mjs" */

/**
 * Number of milliseconds after the first client render that’s considered the
 * hydration time; during which the {@linkcode useAutoLoad} React hook won’t
 * load if the cache entry is already populated.
 */
export default 1000;
