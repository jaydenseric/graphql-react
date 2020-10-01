'use strict';

/**
 * Shallow flattens an array. Can be replaced with `Array.flat` once Node.js
 * v10 support ends.
 * @param {Array|undefined} array The array to flatten.
 * @returns {Array} A new flat array.
 * @see [MDN code example](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat#reduce_and_concat).
 * @ignore
 */
module.exports = function arrayFlat(array) {
  return [].concat(...array);
};
