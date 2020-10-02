'use strict';

const { deepStrictEqual, notStrictEqual } = require('assert');
const arrayFlat = require('../../universal/private/arrayFlat');

module.exports = (tests) => {
  tests.add('`arrayFlat` with undefined', () => {
    deepStrictEqual(arrayFlat(undefined), []);
  });

  tests.add('`arrayFlat` with an empty array', () => {
    const input = [];
    const output = arrayFlat(input);

    notStrictEqual(input, output);
    deepStrictEqual(input, []);
    deepStrictEqual(output, []);
  });

  tests.add('`arrayFlat` with an array containing non array items', () => {
    const input = ['a', 'b'];
    const output = arrayFlat(input);

    notStrictEqual(input, output);
    deepStrictEqual(input, ['a', 'b']);
    deepStrictEqual(output, ['a', 'b']);
  });

  tests.add('`arrayFlat` with an array containing array items', () => {
    const input = [['a', 'b'], ['c']];
    const output = arrayFlat(input);

    notStrictEqual(input, output);
    deepStrictEqual(input, [['a', 'b'], ['c']]);
    deepStrictEqual(output, ['a', 'b', 'c']);
  });

  tests.add(
    '`arrayFlat` with an array containing mixed array and non array items',
    () => {
      const input = [['a', 'b'], ['c'], 'd'];
      const output = arrayFlat(input);

      notStrictEqual(input, output);
      deepStrictEqual(input, [['a', 'b'], ['c'], 'd']);
      deepStrictEqual(output, ['a', 'b', 'c', 'd']);
    }
  );
};
