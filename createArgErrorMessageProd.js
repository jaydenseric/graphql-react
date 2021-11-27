'use strict';

/**
 * Creates an argument error message for a production environment.
 * @kind function
 * @name createArgErrorMessageProd
 * @param {number} argNumber Argument number (starts at 1).
 * @returns {string} Error message.
 * @ignore
 */
module.exports = function createArgErrorMessageProd(argNumber) {
  // Argument checks are skipped for this function as it’s supposed to be ultra
  // lightweight for production, and all the times it’s used in the project are
  // tested anyway.
  return `Argument ${argNumber} type invalid.`;
};
