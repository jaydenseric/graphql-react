'use strict';

/**
 * Sleeps the process for a specified duration.
 * @param {number} ms Duration in milliseconds.
 * @returns {Promise<void>} Resolves once the duration is up.
 * @ignore
 */
module.exports = function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
