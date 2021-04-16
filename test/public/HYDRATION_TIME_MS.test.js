'use strict';

const { strictEqual } = require('assert');
const HYDRATION_TIME_MS = require('../../public/HYDRATION_TIME_MS');

module.exports = (tests) => {
  tests.add('`HYDRATION_TIME_MS` value.', () => {
    strictEqual(HYDRATION_TIME_MS, 1000);
  });
};
