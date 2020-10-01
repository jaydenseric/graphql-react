'use strict';

const { deepStrictEqual } = require('assert');
const arrayFlat = require('../../universal/private/arrayFlat');

module.exports = (tests) => {
  tests.add('`arrayFlat` with undefined', () => {
    deepStrictEqual(arrayFlat(undefined), []);
  });

  tests.add('`arrayFlat` with an empty array', () => {
    deepStrictEqual(arrayFlat([]), []);
  });

  tests.add('`arrayFlat` with an array containing non array items', () => {
    deepStrictEqual(arrayFlat(['a', 'b']), ['a', 'b']);
  });

  tests.add('`arrayFlat` with an array containing array items', () => {
    deepStrictEqual(arrayFlat([['a', 'b'], ['c']]), ['a', 'b', 'c']);
  });

  tests.add(
    '`arrayFlat` with an array containing mixed array and non array items',
    () => {
      deepStrictEqual(arrayFlat([['a', 'b'], ['c'], 'd']), [
        'a',
        'b',
        'c',
        'd',
      ]);
    }
  );
};
