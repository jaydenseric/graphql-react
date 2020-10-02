'use strict';

const { AssertionError } = require('assert');

/**
 * Promisifies an event.
 * @param {object} emitter An event emitter with `on` and `off` methods.
 * @param {string} eventName The event name.
 * @param {number} [msTimeLimit=1000] How many milliseconds to wait for the event.
 * @returns {Promise<*>} Resolves the event data.
 * @see [Stack Overflow answer](https://stackoverflow.com/a/40353376/1596978).
 * @ignore
 */
module.exports = function promisifyEvent(
  emitter,
  eventName,
  msTimeLimit = 1000
) {
  if (
    typeof emitter !== 'object' ||
    typeof emitter.on !== 'function' ||
    typeof emitter.off !== 'function'
  )
    throw new TypeError(
      'First argument `emitter` must be an event emitter with `on` and `off` methods.'
    );

  if (typeof eventName !== 'string')
    throw new TypeError('Second argument `eventName` must be a string.');

  if (typeof msTimeLimit !== 'number' || msTimeLimit < 0)
    throw new TypeError(
      'Third argument `msTimeLimit` must be a positive number.'
    );

  return new Promise((resolve, reject) => {
    // Ensure the timeout error stack trace starts at the location where
    // `promisifyEvent` is called. Creating the error within the `setTimeout`
    // callback function would result in an unhelpful stack trace.
    const timeoutError = new AssertionError({
      message: `Event “${eventName}” ${msTimeLimit} millisecond timeout.`,
      stackStartFn: promisifyEvent,
    });

    const timer = setTimeout(() => {
      emitter.off(eventName, listener);
      reject(timeoutError);
    }, msTimeLimit);

    /**
     * Listener for the event.
     * @param {*} data Event data.
     * @ignore
     */
    function listener(data) {
      clearTimeout(timer);
      emitter.off(eventName, listener);
      resolve(data);
    }

    emitter.on(eventName, listener);
  });
};
