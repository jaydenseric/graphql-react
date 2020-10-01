'use strict';

const { AssertionError } = require('assert');

/**
 * Promisifies an event.
 * @param {object} emitter An event emitter with `on` and `off` methods.
 * @param {string} event The event name.
 * @param {number} [timeout=1000] How many milliseconds to wait for the event.
 * @returns {Promise<*>} Event data.
 * @see [Stack Overflow answer](https://stackoverflow.com/a/40353376/1596978).
 * @ignore
 */
module.exports = function promisifyEvent(emitter, event, timeout = 1000) {
  return new Promise((resolve, reject) => {
    // Ensure the timeout error stack trace starts at the location where
    // `promisifyEvent` is called. Creating the error within the `setTimeout`
    // callback function would result in an unhelpful stack trace.
    const timeoutError = new AssertionError({
      message: `Event “${event}” ${timeout} millisecond timeout.`,
      stackStartFn: promisifyEvent,
    });

    const timer = setTimeout(() => {
      emitter.off(event, listener);
      reject(timeoutError);
    }, timeout);

    /**
     * Listener for the event.
     * @param {*} data Event data.
     * @ignore
     */
    function listener(data) {
      clearTimeout(timer);
      emitter.off(event, listener);
      resolve(data);
    }

    emitter.on(event, listener);
  });
};
