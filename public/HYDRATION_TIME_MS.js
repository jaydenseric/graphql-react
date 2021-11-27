'use strict';

/**
 * Number of milliseconds after the first client render that’s considered the
 * hydration time; during which the
 * [`useAutoLoad`]{@link useAutoLoad} React hook won’t load if the
 * cache entry is already populated.
 * @kind constant
 * @name HYDRATION_TIME_MS
 * @type {number}
 * @example <caption>How to `import`.</caption>
 * ```js
 * import HYDRATION_TIME_MS from 'graphql-react/public/HYDRATION_TIME_MS.js';
 * ```
 * @example <caption>How to `require`.</caption>
 * ```js
 * const HYDRATION_TIME_MS = require('graphql-react/public/HYDRATION_TIME_MS.js');
 * ```
 */
module.exports = 1000;
