'use strict';

const { deepStrictEqual, strictEqual } = require('assert');
const { File, FormData } = require('formdata-node');
const revertableGlobals = require('revertable-globals');
const fetchOptionsGraphQL = require('../../public/fetchOptionsGraphQL');

module.exports = (tests) => {
  tests.add('`fetchOptionsGraphQL` without files.', () => {
    deepStrictEqual(fetchOptionsGraphQL({ query: '' }), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: '{"query":""}',
    });
  });

  tests.add('`fetchOptionsGraphQL` with files.', () => {
    const revertGlobals = revertableGlobals({ File, FormData });

    try {
      const fileName = 'a.txt';
      const options = fetchOptionsGraphQL({
        query: '',
        variables: { a: new File(['a'], fileName) },
      });

      // See the GraphQL multipart request spec:
      // https://github.com/jaydenseric/graphql-multipart-request-spec

      strictEqual(options.method, 'POST');
      deepStrictEqual(options.headers, { Accept: 'application/json' });
      strictEqual(options.body instanceof FormData, true);

      const formDataEntries = Array.from(options.body.entries());

      strictEqual(formDataEntries.length, 3);
      deepStrictEqual(formDataEntries[0], [
        'operations',
        '{"query":"","variables":{"a":null}}',
      ]);
      deepStrictEqual(formDataEntries[1], ['map', '{"1":["variables.a"]}']);
      strictEqual(formDataEntries[2][0], '1');
      strictEqual(formDataEntries[2][1] instanceof File, true);
      strictEqual(formDataEntries[2][1].name, fileName);
    } finally {
      revertGlobals();
    }
  });
};
