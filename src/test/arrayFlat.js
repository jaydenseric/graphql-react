'use strict';

/**
 * Shallow flattens an array. Can be replaced with `Array.flat` once Node.js
 * v10 support ends.
 * @param {Array} array The array to flatten.
 * @returns {Array} A new flat array.
 * @see [MDN code example](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat#reduce_and_concat).
 * @ignore
 */
module.exports = function arrayFlat(array) {
  if (!Array.isArray(array))
    throw new TypeError('Argument 1 must be an array.');

  return [].concat(...array);
};
