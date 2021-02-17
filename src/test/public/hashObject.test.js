'use strict';

const { notStrictEqual, strictEqual } = require('assert');
const FormData = require('formdata-node');
const revertableGlobals = require('revertable-globals');
const hashObject = require('../../public/hashObject');

module.exports = (tests) => {
  tests.add('`hashObject` with an object', () => {
    const object = { a: 1, b: 2 };
    const hash1 = hashObject(object);

    strictEqual(typeof hash1, 'string');

    const hash2 = hashObject(object);

    // Deterministic hash.
    strictEqual(hash1, hash2);

    object.b = 3;

    const hash3 = hashObject(object);

    // Property values affect the hash.
    notStrictEqual(hash2, hash3);
  });

  tests.add('`hashObject` with a `FormData` instance', () => {
    const revertGlobals = revertableGlobals({ FormData });

    try {
      const form1 = new FormData();
      const form2 = new FormData();

      form1.append('1', 'a');
      form2.append('1', 'b');

      const hash1 = hashObject(form1);
      const hash2 = hashObject(form1);
      const hash3 = hashObject(form2);

      strictEqual(typeof hash1, 'string');

      // Deterministic hash.
      strictEqual(hash1, hash2);

      // Fields determine hash.
      notStrictEqual(hash2, hash3);
    } finally {
      revertGlobals();
    }
  });
};
