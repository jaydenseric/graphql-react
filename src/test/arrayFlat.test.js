'use strict';

const { deepStrictEqual, notStrictEqual, throws } = require('assert');
const arrayFlat = require('./arrayFlat');

module.exports = (tests) => {
  tests.add('`arrayFlat` with argument 1 not an array', () => {
    throws(() => {
      arrayFlat(true);
    }, new TypeError('Argument 1 must be an array.'));
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
