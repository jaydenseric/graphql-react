/**
 * Number of milliseconds after the first client render that’s considered the
 * hydration time; during which the
 * [`useAutoLoad`]{@link useAutoLoad} React hook won’t load if the
 * cache entry is already populated.
 * @kind constant
 * @name HYDRATION_TIME_MS
 * @type {number}
 * @example <caption>How to import.</caption>
 * ```js
 * import HYDRATION_TIME_MS from "graphql-react/HYDRATION_TIME_MS.mjs";
 * ```
 */
export default 1000;
