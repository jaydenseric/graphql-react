'use strict';

const { strictEqual } = require('assert');
const createArgErrorMessageProd = require('../../private/createArgErrorMessageProd');

module.exports = (tests) => {
  tests.add('`createArgErrorMessageProd` functionality.', () => {
    strictEqual(createArgErrorMessageProd(1), 'Argument 1 type invalid.');
  });
};
